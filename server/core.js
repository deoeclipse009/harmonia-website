// Ticketing rules. Every function takes a context ({ db, now, session, env })
// and plain input, returns plain data, and throws Fail for anything the
// caller can act on. No HTTP in here, so the same code runs under tests,
// the dev server and the serverless function.
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto'
import { ROW_LETTERS, seatLabels } from '../shared/seats.js'

export { seatLabels }

export class Fail extends Error {
  constructor(code, extra = {}) {
    super(code)
    this.code = code
    this.extra = extra
  }
}

// No I or O in codes: read aloud at a door they are heard as 1 and 0.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 32 symbols, so no modulo bias
const MINUTE = 60 * 1000
export const DRAFT_MINUTES = 10
const SESSION_HOURS = 12
const MAX_PROOF_CHARS = 700_000
const MAX_QRIS_CHARS = 500_000
const IMAGE_PREFIX = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

function randomCode(length) {
  return Array.from(randomBytes(length), (b) => CODE_ALPHABET[b % 32]).join('')
}

async function all(db, sql, args = []) {
  const res = await db.execute({ sql, args })
  return res.rows.map((row) => Object.fromEntries(res.columns.map((c, i) => [c, row[i]])))
}

async function one(db, sql, args = []) {
  return (await all(db, sql, args))[0] ?? null
}

function parseCategory(row) {
  return row && { ...row, rows: JSON.parse(row.rows), blocked: JSON.parse(row.blocked) }
}

function text(value, max = 120) {
  return String(value ?? '').trim().slice(0, max)
}

function cleanBuyer(buyer = {}) {
  const name = text(buyer.name)
  const email = text(buyer.email, 160).toLowerCase()
  const phone = text(buyer.phone, 24).replace(/[\s()+-]/g, '')
  const errors = {}
  if (name.length < 2) errors.name = 'required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = email ? 'invalid' : 'required'
  if (!/^\d{9,15}$/.test(phone)) errors.phone = phone ? 'invalid' : 'required'
  return { name, email, phone, errors }
}

async function eventSettings(db) {
  const row = await one(db, `SELECT value FROM settings WHERE key = 'event'`)
  return JSON.parse(row.value)
}

// ---------- Expiry ----------

// Lazy expiry: every request first releases orders whose time ran out. The
// clock that matters is the server's, never the buyer's browser.
export async function expireOrders(db, now) {
  const stale = await all(
    db,
    `SELECT id, voucher_code FROM orders WHERE status IN ('draft', 'waiting') AND expires_at IS NOT NULL AND expires_at <= ?`,
    [now],
  )
  if (stale.length === 0) return 0
  const statements = []
  for (const o of stale) {
    statements.push({ sql: `UPDATE orders SET status = 'expired' WHERE id = ?`, args: [o.id] })
    statements.push({ sql: `UPDATE tickets SET active = 0 WHERE order_id = ?`, args: [o.id] })
    if (o.voucher_code) {
      statements.push({
        sql: `UPDATE vouchers SET used = MAX(used - 1, 0) WHERE code = ?`,
        args: [o.voucher_code],
      })
    }
  }
  await db.batch(statements, 'write')
  return stale.length
}

// ---------- Public: event and seats ----------

function saleStatus(cat, left, now) {
  if (!cat.on_sale) return 'not_started'
  if (cat.sale_start && now < cat.sale_start) return 'not_started'
  if (cat.sale_end && now > cat.sale_end) return 'ended'
  if (left <= 0) return 'sold_out'
  return 'on_sale'
}

async function takenCounts(db) {
  const rows = await all(db, `SELECT category_id, COUNT(*) AS n FROM tickets WHERE active = 1 GROUP BY category_id`)
  return new Map(rows.map((r) => [r.category_id, Number(r.n)]))
}

function publicCategory(cat, taken, now) {
  const total = seatLabels(cat.rows).length - cat.blocked.length
  const left = Math.max(0, total - taken)
  return {
    id: cat.id,
    name: cat.name,
    price: cat.price,
    maxPerOrder: cat.max_per_order,
    description: cat.description,
    saleStart: cat.sale_start,
    saleEnd: cat.sale_end,
    total,
    left,
    status: saleStatus(cat, left, now),
  }
}

export async function getEvent({ db, now }) {
  await expireOrders(db, now)
  const event = await eventSettings(db)
  const cats = (await all(db, `SELECT * FROM categories WHERE archived = 0 AND kind = 'online' ORDER BY sort, id`)).map(parseCategory)
  const taken = await takenCounts(db)
  return {
    event: {
      name: event.name,
      dateText: event.dateText,
      timeText: event.timeText,
      venue: event.venue,
      terms: event.terms,
    },
    categories: cats.map((c) => publicCategory(c, taken.get(c.id) ?? 0, now)),
    draftMinutes: DRAFT_MINUTES,
  }
}

export async function getSeats({ db, now }, { categoryId }) {
  await expireOrders(db, now)
  const cat = parseCategory(await one(db, `SELECT * FROM categories WHERE id = ? AND archived = 0`, [categoryId]))
  if (!cat) throw new Fail('not_found')
  const taken = await all(db, `SELECT seat FROM tickets WHERE category_id = ? AND active = 1`, [cat.id])
  return { id: cat.id, name: cat.name, rows: cat.rows, blocked: cat.blocked, taken: taken.map((t) => t.seat) }
}

// ---------- Orders ----------

function checkSeats(cat, seats, { allowBlocked = false } = {}) {
  if (!Array.isArray(seats) || seats.length === 0) throw new Fail('no_seats')
  const unique = [...new Set(seats.map((s) => text(s, 6)))]
  if (unique.length !== seats.length) throw new Fail('bad_seats')
  const valid = new Set(seatLabels(cat.rows))
  const blocked = new Set(cat.blocked)
  for (const s of unique) {
    if (!valid.has(s)) throw new Fail('bad_seats')
    if (blocked.has(s) && !allowBlocked) throw new Fail('bad_seats')
  }
  return unique
}

// Takes the seats inside one transaction. The check below gives a friendly
// answer; the unique index is what actually guarantees it.
async function insertOrder(db, order, cat, seats, ticketPrice, holderNames = []) {
  const tx = await db.transaction('write')
  try {
    const marks = seats.map(() => '?').join(',')
    const clash = await tx.execute({
      sql: `SELECT seat FROM tickets WHERE category_id = ? AND active = 1 AND seat IN (${marks})`,
      args: [cat.id, ...seats],
    })
    if (clash.rows.length > 0) {
      throw new Fail('taken', { taken: clash.rows.map((r) => r[0]) })
    }
    const res = await tx.execute({
      sql: `INSERT INTO orders (code, token, status, channel, category_id, buyer_name, email, phone, subtotal, total, created_at, expires_at, paid_at, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        order.code, order.token, order.status, order.channel, cat.id,
        order.buyer_name ?? '', order.email ?? '', order.phone ?? '',
        ticketPrice * seats.length, ticketPrice * seats.length,
        order.created_at, order.expires_at ?? null, order.paid_at ?? null, order.created_by ?? '',
      ],
    })
    const orderId = Number(res.lastInsertRowid)
    for (let i = 0; i < seats.length; i++) {
      await tx.execute({
        sql: `INSERT INTO tickets (order_id, category_id, seat, holder_name, code, price) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [orderId, cat.id, seats[i], holderNames[i] ?? '', randomCode(12), ticketPrice],
      })
    }
    await tx.commit()
    return orderId
  } catch (err) {
    await tx.rollback()
    if (err instanceof Fail) throw err
    if (/UNIQUE/i.test(String(err.message))) throw new Fail('taken', { taken: [] })
    throw err
  }
}

export async function createOrder({ db, now }, { categoryId, seats }) {
  await expireOrders(db, now)
  const cat = parseCategory(
    await one(db, `SELECT * FROM categories WHERE id = ? AND archived = 0 AND kind = 'online'`, [categoryId]),
  )
  if (!cat) throw new Fail('not_found')
  const taken = (await takenCounts(db)).get(cat.id) ?? 0
  const status = saleStatus(cat, seatLabels(cat.rows).length - cat.blocked.length - taken, now)
  if (status !== 'on_sale') throw new Fail('not_on_sale', { status })
  const picked = checkSeats(cat, seats)
  if (picked.length > cat.max_per_order) throw new Fail('too_many', { max: cat.max_per_order })

  const token = randomBytes(24).toString('base64url')
  await insertOrder(
    db,
    {
      code: `HRM${randomCode(7)}`,
      token,
      status: 'draft',
      channel: 'online',
      created_at: now,
      expires_at: now + DRAFT_MINUTES * MINUTE,
    },
    cat,
    picked,
    cat.price,
  )
  return getOrder({ db, now }, { token })
}

async function loadOrder(db, where, arg) {
  const order = await one(db, `SELECT * FROM orders WHERE ${where} = ?`, [arg])
  if (!order) throw new Fail('not_found')
  const tickets = await all(db, `SELECT * FROM tickets WHERE order_id = ? ORDER BY id`, [order.id])
  const cat = await one(db, `SELECT id, name FROM categories WHERE id = ?`, [order.category_id])
  return { order, tickets, cat }
}

function orderView({ order, tickets, cat }, event, { admin = false } = {}) {
  const paid = order.status === 'paid'
  const view = {
    code: order.code,
    token: order.token,
    status: order.status,
    channel: order.channel,
    category: cat?.name ?? '',
    buyer: { name: order.buyer_name, email: order.email, phone: order.phone },
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    voucherCode: order.voucher_code,
    createdAt: order.created_at,
    expiresAt: order.expires_at,
    paidAt: order.paid_at,
    adminNote: order.admin_note,
    hasProof: Boolean(order.proof),
    tickets: tickets.map((t) => ({
      id: t.id,
      seat: t.seat,
      holderName: t.holder_name,
      price: t.price,
      // A ticket code is the key to the door. It leaves the server only
      // once the order is paid.
      code: paid || admin ? t.code : null,
      checkedInAt: t.checked_in_at,
    })),
  }
  if (order.status === 'waiting' || order.status === 'review') {
    view.payment = {
      bankName: event.bankName,
      bankAccount: event.bankAccount,
      bankHolder: event.bankHolder,
      qrisImage: event.qrisImage,
    }
  }
  if (admin) {
    view.id = order.id
    view.proofNote = order.proof_note
    view.createdBy = order.created_by
    view.emailStatus = order.email_status
  }
  return view
}

export async function getOrder({ db, now }, { token }) {
  await expireOrders(db, now)
  const loaded = await loadOrder(db, 'token', text(token, 80))
  const event = await eventSettings(db)
  return { order: orderView(loaded, event), event: { name: event.name, dateText: event.dateText, timeText: event.timeText, venue: event.venue, terms: event.terms } }
}

async function voucherDiscount(db, code, order, now) {
  const v = await one(db, `SELECT * FROM vouchers WHERE code = ?`, [text(code, 40).toUpperCase()])
  if (!v || !v.active) throw new Fail('voucher_invalid', { reason: 'unknown' })
  if (v.starts_at && now < v.starts_at) throw new Fail('voucher_invalid', { reason: 'not_started' })
  if (v.ends_at && now > v.ends_at) throw new Fail('voucher_invalid', { reason: 'ended' })
  if (v.used >= v.stock) throw new Fail('voucher_invalid', { reason: 'used_up' })
  if (v.category_id && v.category_id !== order.category_id) throw new Fail('voucher_invalid', { reason: 'wrong_category' })
  if (order.subtotal < v.min_total) throw new Fail('voucher_invalid', { reason: 'min_total', minTotal: v.min_total })
  const raw = v.type === 'percent' ? Math.floor((order.subtotal * v.amount) / 100) : v.amount
  return { code: v.code, discount: Math.min(order.subtotal, Math.max(0, raw)) }
}

export async function checkVoucher({ db, now }, { token, code }) {
  await expireOrders(db, now)
  const { order } = await loadOrder(db, 'token', text(token, 80))
  if (order.status !== 'draft') throw new Fail('not_draft')
  const { discount, code: clean } = await voucherDiscount(db, code, order, now)
  return { code: clean, discount, total: order.subtotal - discount }
}

export async function submitDetails({ db, now }, { token, buyer, holders, voucherCode }) {
  await expireOrders(db, now)
  const { order, tickets } = await loadOrder(db, 'token', text(token, 80))
  if (order.status === 'expired') throw new Fail('expired')
  if (order.status !== 'draft') throw new Fail('not_draft')

  const clean = cleanBuyer(buyer)
  if (Object.keys(clean.errors).length > 0) throw new Fail('invalid', { fields: clean.errors })
  const names = tickets.map((_, i) => text(holders?.[i]) || clean.name)

  let discount = 0
  let voucher = null
  if (text(voucherCode)) {
    const applied = await voucherDiscount(db, voucherCode, order, now)
    discount = applied.discount
    voucher = applied.code
  }
  const total = order.subtotal - discount
  const event = await eventSettings(db)
  const free = total === 0

  const statements = [
    {
      sql: `UPDATE orders SET status = ?, buyer_name = ?, email = ?, phone = ?, discount = ?, total = ?, voucher_code = ?, expires_at = ?, paid_at = ? WHERE id = ? AND status = 'draft'`,
      args: [
        free ? 'paid' : 'waiting', clean.name, clean.email, clean.phone, discount, total, voucher,
        free ? null : now + Math.max(1, Number(event.payHours) || 3) * 60 * MINUTE,
        free ? now : null, order.id,
      ],
    },
    ...tickets.map((t, i) => ({ sql: `UPDATE tickets SET holder_name = ? WHERE id = ?`, args: [names[i], t.id] })),
  ]
  if (voucher) {
    // Guarded update: two buyers racing for the last voucher cannot both win.
    const used = await db.execute({
      sql: `UPDATE vouchers SET used = used + 1 WHERE code = ? AND used < stock`,
      args: [voucher],
    })
    if (used.rowsAffected === 0) throw new Fail('voucher_invalid', { reason: 'used_up' })
  }
  await db.batch(statements, 'write')
  return getOrder({ db, now }, { token: order.token })
}

export async function uploadProof({ db, now }, { token, image, note }) {
  await expireOrders(db, now)
  const { order } = await loadOrder(db, 'token', text(token, 80))
  if (order.status !== 'waiting' && order.status !== 'review') throw new Fail('not_waiting', { status: order.status })
  if (typeof image !== 'string' || image.length > MAX_PROOF_CHARS || !IMAGE_PREFIX.test(image)) {
    throw new Fail('bad_image')
  }
  // Once proof is in, the order stops expiring: it now waits on the
  // committee, not on the buyer.
  await db.execute({
    sql: `UPDATE orders SET status = 'review', proof = ?, proof_note = ?, expires_at = NULL WHERE id = ?`,
    args: [image, text(note, 300), order.id],
  })
  return getOrder({ db, now }, { token: order.token })
}

async function releaseOrder(db, order, status, note = '') {
  const statements = [
    { sql: `UPDATE orders SET status = ?, admin_note = ?, expires_at = NULL WHERE id = ?`, args: [status, note, order.id] },
    { sql: `UPDATE tickets SET active = 0 WHERE order_id = ?`, args: [order.id] },
  ]
  if (order.voucher_code) {
    statements.push({ sql: `UPDATE vouchers SET used = MAX(used - 1, 0) WHERE code = ?`, args: [order.voucher_code] })
  }
  await db.batch(statements, 'write')
}

export async function cancelByBuyer({ db, now }, { token }) {
  await expireOrders(db, now)
  const { order } = await loadOrder(db, 'token', text(token, 80))
  if (order.status !== 'draft' && order.status !== 'waiting') throw new Fail('cannot_cancel', { status: order.status })
  await releaseOrder(db, order, 'cancelled')
  return { ok: true }
}

// ---------- Sessions ----------

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 32).toString('hex')}`
}

function passwordMatches(password, stored) {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 32)
  const known = Buffer.from(hash, 'hex')
  return candidate.length === known.length && timingSafeEqual(candidate, known)
}

function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`
}

export function readSession(token, secret, now) {
  if (!token || !secret) return null
  const [body, mac] = String(token).split('.')
  if (!body || !mac) return null
  const expected = createHmac('sha256', secret).update(body).digest()
  const given = Buffer.from(mac, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    return payload.exp > now ? payload : null
  } catch {
    return null
  }
}

export async function login({ db, now, env }, { username, password }) {
  if (!env.SESSION_SECRET || !env.ADMIN_PASSWORD) throw new Fail('not_configured')
  const user = text(username, 40).toLowerCase()
  const pass = String(password ?? '')
  let session = null

  if (user === 'admin') {
    const a = Buffer.from(pass)
    const b = Buffer.from(env.ADMIN_PASSWORD)
    if (a.length === b.length && timingSafeEqual(a, b)) session = { u: 'admin', name: 'Admin', role: 'admin' }
  } else {
    const staff = await one(db, `SELECT * FROM staff WHERE username = ? AND active = 1`, [user])
    if (staff && passwordMatches(pass, staff.pass_hash)) {
      session = { u: staff.username, name: staff.name, role: staff.role }
    }
  }
  if (!session) {
    // ponytail: a fixed delay slows guessing but is not a lockout. Add
    // per-account attempt counting if the panel is ever attacked.
    await new Promise((r) => setTimeout(r, 400))
    throw new Fail('bad_login')
  }
  session.exp = now + SESSION_HOURS * 60 * MINUTE
  return { token: sign(session, env.SESSION_SECRET), user: { username: session.u, name: session.name, role: session.role } }
}

// ---------- Panel: orders ----------

export async function listOrders({ db, now }, { status, channel, q } = {}) {
  await expireOrders(db, now)
  const where = []
  const args = []
  if (status) {
    // "waiting" in the panel covers both sides of a manual payment: not yet
    // paid, and paid but not yet checked by the committee.
    if (status === 'waiting') where.push(`o.status IN ('waiting', 'review')`)
    else {
      where.push('o.status = ?')
      args.push(text(status, 20))
    }
  } else {
    where.push(`o.status != 'draft'`)
  }
  if (channel) {
    where.push('o.channel = ?')
    args.push(text(channel, 20))
  }
  if (text(q)) {
    where.push('(o.code LIKE ? OR o.buyer_name LIKE ? OR o.email LIKE ?)')
    const like = `%${text(q, 60)}%`
    args.push(like, like, like)
  }
  const rows = await all(
    db,
    `SELECT o.id, o.code, o.status, o.channel, o.buyer_name, o.email, o.phone, o.total, o.discount, o.voucher_code,
            o.created_at, o.paid_at, o.expires_at, o.created_by, o.proof IS NOT NULL AS has_proof, c.name AS category,
            (SELECT GROUP_CONCAT(seat, ', ') FROM tickets t WHERE t.order_id = o.id) AS seats,
            (SELECT COUNT(*) FROM tickets t WHERE t.order_id = o.id) AS qty
     FROM orders o LEFT JOIN categories c ON c.id = o.category_id
     WHERE ${where.join(' AND ')} ORDER BY o.created_at DESC LIMIT 1000`,
    args,
  )
  return { orders: rows.map((r) => ({ ...r, has_proof: Boolean(r.has_proof) })) }
}

export async function getOrderAdmin({ db, now }, { id }) {
  await expireOrders(db, now)
  const loaded = await loadOrder(db, 'id', Number(id))
  return { order: orderView(loaded, await eventSettings(db), { admin: true }), proof: loaded.order.proof }
}

export async function confirmOrder({ db, now, session }, { id }) {
  await expireOrders(db, now)
  const { order } = await loadOrder(db, 'id', Number(id))
  if (order.status !== 'waiting' && order.status !== 'review') throw new Fail('cannot_confirm', { status: order.status })
  await db.execute({
    sql: `UPDATE orders SET status = 'paid', paid_at = ?, expires_at = NULL, admin_note = ? WHERE id = ? AND status IN ('waiting', 'review')`,
    args: [now, `confirmed by ${session.u}`, order.id],
  })
  return getOrderAdmin({ db, now }, { id: order.id })
}

export async function rejectProof({ db, now }, { id, note }) {
  const { order } = await loadOrder(db, 'id', Number(id))
  if (order.status !== 'review') throw new Fail('cannot_reject', { status: order.status })
  const event = await eventSettings(db)
  await db.execute({
    sql: `UPDATE orders SET status = 'waiting', proof = NULL, admin_note = ?, expires_at = ? WHERE id = ?`,
    args: [text(note, 300), now + Math.max(1, Number(event.payHours) || 3) * 60 * MINUTE, order.id],
  })
  return getOrderAdmin({ db, now }, { id: order.id })
}

export async function cancelOrder({ db, now }, { id, note }) {
  const { order } = await loadOrder(db, 'id', Number(id))
  if (order.status === 'cancelled' || order.status === 'expired') throw new Fail('already_closed')
  await releaseOrder(db, order, 'cancelled', text(note, 300))
  return getOrderAdmin({ db, now }, { id: order.id })
}

export async function updateOrderPeople({ db, now }, { id, buyer, holders }) {
  const { order, tickets } = await loadOrder(db, 'id', Number(id))
  const clean = cleanBuyer(buyer)
  if (Object.keys(clean.errors).length > 0) throw new Fail('invalid', { fields: clean.errors })
  await db.batch(
    [
      { sql: `UPDATE orders SET buyer_name = ?, email = ?, phone = ? WHERE id = ?`, args: [clean.name, clean.email, clean.phone, order.id] },
      ...tickets.map((t, i) => ({
        sql: `UPDATE tickets SET holder_name = ? WHERE id = ?`,
        args: [text(holders?.[i]) || t.holder_name, t.id],
      })),
    ],
    'write',
  )
  return getOrderAdmin({ db, now }, { id: order.id })
}

// Sales at the door and invitations: created by staff, paid on creation.
export async function staffOrder({ db, now, session }, { channel, categoryId, seats, buyer, holders }) {
  await expireOrders(db, now)
  if (channel !== 'direct' && channel !== 'invitation') throw new Fail('bad_channel')
  if (channel === 'invitation' && session.role !== 'admin') throw new Fail('forbidden')
  const cat = parseCategory(await one(db, `SELECT * FROM categories WHERE id = ? AND archived = 0`, [categoryId]))
  if (!cat) throw new Fail('not_found')
  const picked = checkSeats(cat, seats, { allowBlocked: channel === 'invitation' })
  const name = text(buyer?.name)
  if (name.length < 2) throw new Fail('invalid', { fields: { name: 'required' } })
  const email = text(buyer?.email, 160).toLowerCase()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Fail('invalid', { fields: { email: 'invalid' } })

  const token = randomBytes(24).toString('base64url')
  const id = await insertOrder(
    db,
    {
      code: `HRM${randomCode(7)}`,
      token,
      status: 'paid',
      channel,
      buyer_name: name,
      email,
      phone: text(buyer?.phone, 24).replace(/[\s()+-]/g, ''),
      created_at: now,
      paid_at: now,
      created_by: session.u,
    },
    cat,
    picked,
    channel === 'invitation' ? 0 : cat.price,
    picked.map((_, i) => text(holders?.[i]) || name),
  )
  return getOrderAdmin({ db, now }, { id })
}

export async function markEmail({ db }, { id, status }) {
  await db.execute({ sql: `UPDATE orders SET email_status = ? WHERE id = ?`, args: [text(status, 60), Number(id)] })
}

// ---------- Panel: categories and event ----------

export async function listCategories({ db, now }) {
  await expireOrders(db, now)
  const cats = (await all(db, `SELECT * FROM categories WHERE archived = 0 ORDER BY sort, id`)).map(parseCategory)
  const taken = await takenCounts(db)
  return {
    categories: cats.map((c) => ({
      ...publicCategory(c, taken.get(c.id) ?? 0, now),
      kind: c.kind,
      onSale: Boolean(c.on_sale),
      sort: c.sort,
      rows: c.rows,
      blocked: c.blocked,
      taken: taken.get(c.id) ?? 0,
    })),
  }
}

export async function saveCategory({ db, now }, input) {
  const name = text(input.name, 60)
  if (name.length < 2) throw new Fail('invalid', { fields: { name: 'required' } })
  const kind = input.kind === 'offline' ? 'offline' : 'online'
  const price = Math.max(0, Math.round(Number(input.price) || 0))
  const maxPerOrder = Math.min(20, Math.max(1, Math.round(Number(input.maxPerOrder) || 5)))
  const rows = (Array.isArray(input.rows) ? input.rows : [])
    .map((n) => Math.round(Number(n)))
    .filter((n) => n > 0 && n <= 60)
    .slice(0, ROW_LETTERS.length)
  if (rows.length === 0) throw new Fail('invalid', { fields: { rows: 'required' } })
  const labels = new Set(seatLabels(rows))
  const blocked = [...new Set((Array.isArray(input.blocked) ? input.blocked : []).map((s) => text(s, 6).toUpperCase()))].filter((s) => labels.has(s))
  const stamp = (v) => (v ? Number(v) : null)
  const values = [name, kind, price, maxPerOrder, stamp(input.saleStart), stamp(input.saleEnd), input.onSale ? 1 : 0, Math.round(Number(input.sort) || 0), JSON.stringify(rows), JSON.stringify(blocked), text(input.description, 400)]

  if (input.id) {
    // Shrinking a section must never orphan a seat somebody already holds.
    const held = await all(db, `SELECT seat FROM tickets WHERE category_id = ? AND active = 1`, [Number(input.id)])
    const lost = held.map((h) => h.seat).filter((s) => !labels.has(s))
    if (lost.length > 0) throw new Fail('seats_in_use', { seats: lost })
    await db.execute({
      sql: `UPDATE categories SET name = ?, kind = ?, price = ?, max_per_order = ?, sale_start = ?, sale_end = ?, on_sale = ?, sort = ?, rows = ?, blocked = ?, description = ? WHERE id = ?`,
      args: [...values, Number(input.id)],
    })
  } else {
    await db.execute({
      sql: `INSERT INTO categories (name, kind, price, max_per_order, sale_start, sale_end, on_sale, sort, rows, blocked, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: values,
    })
  }
  return listCategories({ db, now })
}

export async function archiveCategory({ db, now }, { id }) {
  const held = await one(db, `SELECT COUNT(*) AS n FROM tickets WHERE category_id = ? AND active = 1`, [Number(id)])
  if (Number(held.n) > 0) throw new Fail('seats_in_use', { count: Number(held.n) })
  await db.execute({ sql: `UPDATE categories SET archived = 1 WHERE id = ?`, args: [Number(id)] })
  return listCategories({ db, now })
}

export async function getSettings({ db }) {
  return { event: await eventSettings(db) }
}

export async function saveSettings({ db }, { event }) {
  const current = await eventSettings(db)
  const qris = typeof event?.qrisImage === 'string' ? event.qrisImage : current.qrisImage
  if (qris && (qris.length > MAX_QRIS_CHARS || !IMAGE_PREFIX.test(qris))) throw new Fail('bad_image')
  const next = {
    name: text(event?.name, 80) || current.name,
    dateText: text(event?.dateText, 80),
    timeText: text(event?.timeText, 80),
    venue: text(event?.venue, 160),
    payHours: Math.min(72, Math.max(1, Math.round(Number(event?.payHours) || 3))),
    bankName: text(event?.bankName, 60),
    bankAccount: text(event?.bankAccount, 40),
    bankHolder: text(event?.bankHolder, 80),
    qrisImage: qris || '',
    terms: text(event?.terms, 4000),
  }
  await db.execute({ sql: `UPDATE settings SET value = ? WHERE key = 'event'`, args: [JSON.stringify(next)] })
  return { event: next }
}

// ---------- Panel: vouchers and staff ----------

export async function listVouchers({ db }) {
  return { vouchers: await all(db, `SELECT * FROM vouchers ORDER BY code`) }
}

export async function saveVoucher({ db }, input) {
  const code = text(input.code, 40).toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  if (code.length < 3) throw new Fail('invalid', { fields: { code: 'required' } })
  const type = input.type === 'percent' ? 'percent' : 'nominal'
  const amount = Math.max(0, Math.round(Number(input.amount) || 0))
  if (type === 'percent' && amount > 100) throw new Fail('invalid', { fields: { amount: 'invalid' } })
  const stamp = (v) => (v ? Number(v) : null)
  await db.execute({
    sql: `INSERT INTO vouchers (code, name, type, amount, stock, min_total, starts_at, ends_at, category_id, active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(code) DO UPDATE SET name = excluded.name, type = excluded.type, amount = excluded.amount,
            stock = excluded.stock, min_total = excluded.min_total, starts_at = excluded.starts_at,
            ends_at = excluded.ends_at, category_id = excluded.category_id, active = excluded.active`,
    args: [code, text(input.name, 60), type, amount, Math.max(0, Math.round(Number(input.stock) || 0)), Math.max(0, Math.round(Number(input.minTotal) || 0)), stamp(input.startsAt), stamp(input.endsAt), input.categoryId ? Number(input.categoryId) : null, input.active === false ? 0 : 1],
  })
  return listVouchers({ db })
}

export async function listStaff({ db }) {
  return { staff: await all(db, `SELECT id, username, name, role, active FROM staff ORDER BY username`) }
}

export async function saveStaff({ db }, input) {
  const username = text(input.username, 40).toLowerCase().replace(/[^a-z0-9._-]/g, '')
  if (username.length < 3 || username === 'admin') throw new Fail('invalid', { fields: { username: 'invalid' } })
  const role = input.role === 'seller' ? 'seller' : 'checkin'
  const name = text(input.name, 80)
  const password = String(input.password ?? '')
  const active = input.active === false ? 0 : 1
  try {
    if (input.id) {
      if (password) {
        if (password.length < 8) throw new Fail('invalid', { fields: { password: 'short' } })
        await db.execute({ sql: `UPDATE staff SET pass_hash = ? WHERE id = ?`, args: [hashPassword(password), Number(input.id)] })
      }
      await db.execute({ sql: `UPDATE staff SET username = ?, name = ?, role = ?, active = ? WHERE id = ?`, args: [username, name, role, active, Number(input.id)] })
    } else {
      if (password.length < 8) throw new Fail('invalid', { fields: { password: 'short' } })
      await db.execute({ sql: `INSERT INTO staff (username, name, role, pass_hash, active) VALUES (?, ?, ?, ?, ?)`, args: [username, name, role, hashPassword(password), active] })
    }
  } catch (err) {
    if (err instanceof Fail) throw err
    if (/UNIQUE/i.test(String(err.message))) throw new Fail('invalid', { fields: { username: 'taken' } })
    throw err
  }
  return listStaff({ db })
}

// ---------- Panel: report and check-in ----------

export async function salesReport({ db, now }) {
  await expireOrders(db, now)
  const cats = (await all(db, `SELECT * FROM categories WHERE archived = 0 ORDER BY sort, id`)).map(parseCategory)
  const sold = await all(
    db,
    `SELECT t.category_id, o.channel, o.status, COUNT(*) AS n, SUM(t.checked_in_at IS NOT NULL) AS checked
     FROM tickets t JOIN orders o ON o.id = t.order_id WHERE t.active = 1 GROUP BY t.category_id, o.channel, o.status`,
  )
  const money = await all(db, `SELECT category_id, channel, SUM(total) AS total FROM orders WHERE status = 'paid' GROUP BY category_id, channel`)
  const rows = cats.map((c) => {
    const mine = sold.filter((s) => s.category_id === c.id)
    const count = (fn) => mine.filter(fn).reduce((sum, s) => sum + Number(s.n), 0)
    const revenue = (channel) => Number(money.find((m) => m.category_id === c.id && m.channel === channel)?.total ?? 0)
    return {
      id: c.id,
      name: c.name,
      kind: c.kind,
      price: c.price,
      seats: seatLabels(c.rows).length - c.blocked.length,
      online: count((s) => s.channel === 'online' && s.status === 'paid'),
      direct: count((s) => s.channel === 'direct' && s.status === 'paid'),
      invitation: count((s) => s.channel === 'invitation' && s.status === 'paid'),
      waiting: count((s) => s.status === 'waiting' || s.status === 'review' || s.status === 'draft'),
      checkedIn: mine.reduce((sum, s) => sum + Number(s.checked ?? 0), 0),
      revenueOnline: revenue('online'),
      revenueDirect: revenue('direct'),
    }
  })
  const sum = (key) => rows.reduce((total, r) => total + r[key], 0)
  return {
    rows,
    totals: {
      seats: sum('seats'),
      online: sum('online'),
      direct: sum('direct'),
      invitation: sum('invitation'),
      waiting: sum('waiting'),
      checkedIn: sum('checkedIn'),
      issued: sum('online') + sum('direct') + sum('invitation'),
      revenue: sum('revenueOnline') + sum('revenueDirect'),
    },
  }
}

export async function checkIn({ db, now, session }, { code }) {
  const clean = text(code, 40).toUpperCase().replace(/[^A-Z0-9]/g, '')
  const ticket = await one(
    db,
    `SELECT t.*, o.status AS order_status, o.code AS order_code, o.buyer_name, c.name AS category
     FROM tickets t JOIN orders o ON o.id = t.order_id JOIN categories c ON c.id = t.category_id WHERE t.code = ?`,
    [clean],
  )
  if (!ticket) throw new Fail('ticket_unknown')
  const info = { holderName: ticket.holder_name, seat: ticket.seat, category: ticket.category, orderCode: ticket.order_code }
  if (!ticket.active || ticket.order_status !== 'paid') throw new Fail('ticket_not_valid', { ...info, status: ticket.order_status })
  // Guarded update: if two scanners read the same ticket at the same moment,
  // exactly one of them gets the green result.
  const res = await db.execute({
    sql: `UPDATE tickets SET checked_in_at = ?, checked_in_by = ? WHERE id = ? AND checked_in_at IS NULL`,
    args: [now, session.u, ticket.id],
  })
  if (res.rowsAffected === 0) {
    const again = await one(db, `SELECT checked_in_at, checked_in_by FROM tickets WHERE id = ?`, [ticket.id])
    throw new Fail('ticket_used', { ...info, at: again.checked_in_at, by: again.checked_in_by })
  }
  return { ok: true, ...info }
}
