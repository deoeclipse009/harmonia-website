// Run with: npm test
// Exercises the rules against a real SQLite file, the same engine as production.
import assert from 'node:assert/strict'
import { mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@libsql/client'
import { migrate } from './db.js'
import * as core from './core.js'
import { handle } from './handler.js'

// A fixed, git-ignored folder, wiped at the start rather than the end: on
// Windows libSQL keeps the file open until the process exits, so it can't be
// deleted from inside the run that used it.
const dir = join(import.meta.dirname, '..', '.data', 'test')
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })
const db = createClient({ url: `file:${join(dir, 'test.db')}` })
await migrate(db)

const env = { SESSION_SECRET: 'test-secret-not-used-anywhere-real', ADMIN_PASSWORD: 'test-admin-password' }
const MIN = 60 * 1000
let now = 1_800_000_000_000
const ctx = (session = null) => ({ db, now, session, env })
const admin = { u: 'admin', role: 'admin' }
const buyer = { name: 'Tes Pembeli', email: 'tes@example.com', phone: '0812 3456 7890' }
const fails = async (promise, code) => {
  try {
    await promise
  } catch (err) {
    assert.equal(err.code, code, `expected ${code}, got ${err.code ?? err.message}`)
    return err
  }
  assert.fail(`expected ${code}, but it succeeded`)
}

// Seed and public view
const ev = await core.getEvent(ctx())
assert.equal(ev.categories.length, 11, 'VIP is offline, so 11 public categories')
const forte = ev.categories.find((c) => c.name === 'Forte Right')
assert.equal(forte.total, 37)
assert.equal(forte.status, 'on_sale')
const mezzo = ev.categories.find((c) => c.name === 'Mezzo Piano Center')
assert.equal(mezzo.total, 63 - 4, 'blocked seats are not for sale')

// Bad seat requests
await fails(core.createOrder(ctx(), { categoryId: forte.id, seats: [] }), 'no_seats')
await fails(core.createOrder(ctx(), { categoryId: forte.id, seats: ['Z99'] }), 'bad_seats')
await fails(core.createOrder(ctx(), { categoryId: forte.id, seats: ['A1', 'A1'] }), 'bad_seats')
await fails(core.createOrder(ctx(), { categoryId: forte.id, seats: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'] }), 'too_many')
await fails(core.createOrder(ctx(), { categoryId: mezzo.id, seats: ['F4'] }), 'bad_seats')

// A draft order holds its seats
const first = (await core.createOrder(ctx(), { categoryId: forte.id, seats: ['A1', 'A2'] })).order
assert.equal(first.status, 'draft')
assert.equal(first.total, 220000)
assert.equal(first.tickets[0].code, null, 'no ticket code before payment')
const clash = await fails(core.createOrder(ctx(), { categoryId: forte.id, seats: ['A2', 'A3'] }), 'taken')
assert.deepEqual(clash.extra.taken, ['A2'])

// Two buyers racing for the same seat: exactly one wins
const race = await Promise.allSettled([
  core.createOrder(ctx(), { categoryId: forte.id, seats: ['B1'] }),
  core.createOrder(ctx(), { categoryId: forte.id, seats: ['B1'] }),
])
assert.equal(race.filter((r) => r.status === 'fulfilled').length, 1, 'one winner in a race')

// A draft that runs out frees its seats
now += (core.DRAFT_MINUTES + 1) * MIN
assert.deepEqual((await core.getSeats(ctx(), { categoryId: forte.id })).taken, [])
await fails(core.submitDetails(ctx(), { token: first.token, buyer }), 'expired')

// Details, then manual payment
let order = (await core.createOrder(ctx(), { categoryId: forte.id, seats: ['A1', 'A2'] })).order
const invalid = await fails(core.submitDetails(ctx(), { token: order.token, buyer: { name: '', email: 'x', phone: '1' } }), 'invalid')
assert.deepEqual(Object.keys(invalid.extra.fields).sort(), ['email', 'name', 'phone'])
order = (await core.submitDetails(ctx(), { token: order.token, buyer, holders: ['', 'Teman'] })).order
assert.equal(order.status, 'waiting')
assert.equal(order.tickets[0].holderName, 'Tes Pembeli', 'blank holder falls back to buyer')
assert.equal(order.tickets[1].holderName, 'Teman')
assert.equal(order.buyer.phone, '081234567890')
assert.ok(order.payment, 'payment details shown while waiting')
await fails(core.uploadProof(ctx(), { token: order.token, image: 'data:text/html;base64,AAAA' }), 'bad_image')
order = (await core.uploadProof(ctx(), { token: order.token, image: 'data:image/png;base64,iVBORw0KGgo=', note: 'BCA' })).order
assert.equal(order.status, 'review')
assert.equal(order.expiresAt, null, 'order with proof no longer expires')
now += 48 * 60 * MIN
assert.equal((await core.getOrder(ctx(), { token: order.token })).order.status, 'review')

// Panel: reject sends it back to waiting, confirm issues the tickets
const listed = (await core.listOrders(ctx(admin), { status: 'waiting' })).orders
assert.equal(listed.length, 1)
let back = (await core.rejectProof(ctx(admin), { id: listed[0].id, note: 'nominal kurang' })).order
assert.equal(back.status, 'waiting')
await core.uploadProof(ctx(), { token: order.token, image: 'data:image/png;base64,iVBORw0KGgo=' })
const paid = (await core.confirmOrder(ctx(admin), { id: listed[0].id })).order
assert.equal(paid.status, 'paid')
const eticket = (await core.getOrder(ctx(), { token: order.token })).order
assert.equal(eticket.tickets[0].code.length, 12, 'codes appear once paid')
assert.notEqual(eticket.tickets[0].code, eticket.tickets[1].code)
await fails(core.confirmOrder(ctx(admin), { id: listed[0].id }), 'cannot_confirm')

// Unpaid order expires after the payment window and frees seats
const slow = (await core.createOrder(ctx(), { categoryId: forte.id, seats: ['B5'] })).order
await core.submitDetails(ctx(), { token: slow.token, buyer })
now += 4 * 60 * MIN
assert.equal((await core.getOrder(ctx(), { token: slow.token })).order.status, 'expired')
assert.ok(!(await core.getSeats(ctx(), { categoryId: forte.id })).taken.includes('B5'))

// Vouchers: limits are enforced and released on cancel
await core.saveVoucher(ctx(admin), { code: 'teman10', type: 'percent', amount: 10, stock: 1, minTotal: 100000 })
const v1 = (await core.createOrder(ctx(), { categoryId: forte.id, seats: ['B6'] })).order
assert.equal((await core.checkVoucher(ctx(), { token: v1.token, code: 'TEMAN10' })).discount, 11000)
const withVoucher = (await core.submitDetails(ctx(), { token: v1.token, buyer, voucherCode: 'teman10' })).order
assert.equal(withVoucher.total, 99000)
const v2 = (await core.createOrder(ctx(), { categoryId: forte.id, seats: ['B7'] })).order
await fails(core.checkVoucher(ctx(), { token: v2.token, code: 'TEMAN10' }), 'voucher_invalid')
await core.cancelByBuyer(ctx(), { token: v1.token })
assert.equal((await core.checkVoucher(ctx(), { token: v2.token, code: 'TEMAN10' })).discount, 11000, 'cancel returns the voucher')
await core.cancelByBuyer(ctx(), { token: v2.token })

// Door sales and invitations
const cats = (await core.listCategories(ctx(admin))).categories
const vip = cats.find((c) => c.name === 'VIP')
const direct = (await core.staffOrder(ctx({ u: 'kasir', role: 'seller' }), { channel: 'direct', categoryId: forte.id, seats: ['B8'], buyer: { name: 'Beli Di Tempat' } })).order
assert.equal(direct.status, 'paid')
assert.equal(direct.total, 110000)
await fails(core.staffOrder(ctx({ u: 'kasir', role: 'seller' }), { channel: 'invitation', categoryId: vip.id, seats: ['A1'], buyer: { name: 'Tamu' } }), 'forbidden')
const invite = (await core.staffOrder(ctx(admin), { channel: 'invitation', categoryId: vip.id, seats: ['A1', 'A2'], buyer: { name: 'Tamu Undangan' } })).order
assert.equal(invite.total, 0)

// Check-in: valid once, refused twice, refused when unpaid
const door = { u: 'pintu', role: 'checkin' }
const scan = await core.checkIn(ctx(door), { code: eticket.tickets[0].code.toLowerCase() })
assert.equal(scan.seat, 'A1')
const again = await fails(core.checkIn(ctx(door), { code: eticket.tickets[0].code }), 'ticket_used')
assert.equal(again.extra.by, 'pintu')
await fails(core.checkIn(ctx(door), { code: 'NOPE12345678' }), 'ticket_unknown')
const unpaid = (await core.createOrder(ctx(), { categoryId: forte.id, seats: ['B9'] })).order
const unpaidCode = (await core.getOrderAdmin(ctx(admin), { id: (await core.listOrders(ctx(admin), {})).orders.length && (await db.execute({ sql: 'SELECT id FROM orders WHERE token = ?', args: [unpaid.token] })).rows[0][0] })).order.tickets[0].code
await fails(core.checkIn(ctx(door), { code: unpaidCode }), 'ticket_not_valid')

// Categories cannot shrink under a held seat
await fails(core.saveCategory(ctx(admin), { id: forte.id, name: 'Forte Right', price: 110000, rows: [1], onSale: true }), 'seats_in_use')
await fails(core.archiveCategory(ctx(admin), { id: forte.id }), 'seats_in_use')

// Report adds up
const report = await core.salesReport(ctx(admin))
const row = report.rows.find((r) => r.name === 'Forte Right')
assert.equal(row.online, 2)
assert.equal(row.direct, 1)
assert.equal(row.checkedIn, 1)
assert.equal(report.totals.invitation, 2)
assert.equal(report.totals.revenue, 220000 + 110000)

// Staff accounts and the permission table
await core.saveStaff(ctx(admin), { username: 'Pintu1', name: 'Petugas', role: 'checkin', password: 'rahasia-pintu' })
await fails(core.saveStaff(ctx(admin), { username: 'pintu1', role: 'checkin', password: 'rahasia-pintu' }), 'invalid')
await fails(core.login({ db, now, env }, { username: 'pintu1', password: 'salah' }), 'bad_login')
const staffLogin = await core.login({ db, now, env }, { username: 'pintu1', password: 'rahasia-pintu' })
assert.equal(staffLogin.user.role, 'checkin')
const adminLogin = await core.login({ db, now, env }, { username: 'admin', password: env.ADMIN_PASSWORD })

const call = (body, token) => handle({ body, authorization: token ? `Bearer ${token}` : '', env, now, })
// handle() opens the default database; point it at the test file first
process.env.TURSO_DATABASE_URL = `file:${join(dir, 'test.db')}`
assert.equal((await call({ action: 'panel.orders' })).status, 401, 'panel needs a login')
assert.equal((await call({ action: 'panel.orders' }, staffLogin.token)).status, 403, 'door staff cannot read orders')
assert.equal((await call({ action: 'panel.orders' }, `${adminLogin.token}x`)).status, 401, 'tampered token refused')
assert.equal((await call({ action: 'panel.orders' }, adminLogin.token)).json.ok, true)
assert.equal((await call({ action: 'panel.report' }, staffLogin.token)).json.ok, true)
assert.equal((await call({ action: 'nope' })).status, 404)
assert.equal(core.readSession(adminLogin.token, env.SESSION_SECRET, now + 13 * 60 * MIN), null, 'sessions end')

db.close()
console.log('ticketing server: all checks passed')
