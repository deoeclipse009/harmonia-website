// Ticketing engine. Every function that touches inventory is async and
// returns plain data, so the page calls it exactly as it would call a server.
//
// ponytail: localStorage stands in for the server, so inventory lives in one
// browser and two people cannot compete for a seat. Upgrade path: keep these
// signatures, back them with serverless functions and a database that takes
// holds inside a transaction, and enforce expiry on the server.

const KEY = 'harmonia.ticketing.v1'
// No 0/O or 1/I, so a code read aloud at the door cannot be misheard.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

let memory = null

function empty() {
  return { sold: {}, hold: null, orders: [] }
}

function read() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Storage blocked or corrupt: fall through to the in-memory copy.
  }
  return memory ?? empty()
}

function write(state) {
  memory = state
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(state))
  } catch {
    // Private windows can refuse writes. The in-memory copy keeps the
    // session working.
  }
}

function dropExpiredHold(state, now) {
  if (state.hold && state.hold.expiresAt <= now) state.hold = null
  return state
}

function code(length) {
  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

// ---------- Pure helpers ----------

export function buildSeats(config) {
  const seats = []
  for (const row of config.rows) {
    const perRow = row.left + row.right
    for (let n = 1; n <= perRow; n++) {
      seats.push({
        id: `${row.label}${n}`,
        row: row.label,
        number: n,
        tier: row.tier,
        side: n <= row.left ? 'left' : 'right',
      })
    }
  }
  return seats
}

export function tierOf(config, tierId) {
  return config.tiers.find((t) => t.id === tierId)
}

export function priceOf(config, seatId) {
  const seat = buildSeats(config).find((s) => s.id === seatId)
  return seat ? tierOf(config, seat.tier).price : 0
}

export function orderTotal(config, seatIds) {
  return seatIds.reduce((sum, id) => sum + priceOf(config, id), 0)
}

export function formatIDR(amount) {
  return `Rp${amount.toLocaleString('id-ID')}`
}

// Best available: the frontmost row of the tier that still has `qty` seats
// side by side, and within that row the block closest to the centre aisle.
// A block never straddles the aisle, so a group always sits together.
export function pickBest(config, soldIds, tierId, qty) {
  const sold = new Set(soldIds)
  for (const row of config.rows) {
    if (row.tier !== tierId) continue
    const aisle = row.left + 0.5
    let best = null
    const sides = [
      [1, row.left],
      [row.left + 1, row.left + row.right],
    ]
    for (const [from, to] of sides) {
      for (let start = from; start + qty - 1 <= to; start++) {
        const block = []
        for (let n = start; n < start + qty; n++) block.push(`${row.label}${n}`)
        if (block.some((id) => sold.has(id))) continue
        const centre = start + (qty - 1) / 2
        const distance = Math.abs(centre - aisle)
        if (!best || distance < best.distance) best = { block, distance }
      }
    }
    if (best) return best.block
  }
  return []
}

// ---------- Inventory (the part a server replaces) ----------

export async function getAvailability(now = Date.now()) {
  const state = dropExpiredHold(read(), now)
  write(state)
  return { sold: Object.keys(state.sold), hold: state.hold }
}

export async function holdSeats(config, seatIds, now = Date.now()) {
  const state = dropExpiredHold(read(), now)
  const known = new Set(buildSeats(config).map((s) => s.id))

  if (seatIds.length === 0) return { ok: false, reason: 'empty' }
  if (seatIds.length > config.maxSeatsPerOrder) return { ok: false, reason: 'limit' }
  if (seatIds.some((id) => !known.has(id))) return { ok: false, reason: 'unknown' }

  // Checked again here, not trusted from the page: the map a buyer is
  // looking at may be minutes old.
  const taken = seatIds.filter((id) => state.sold[id])
  if (taken.length > 0) return { ok: false, reason: 'taken', taken }

  state.hold = {
    seatIds: [...seatIds],
    expiresAt: now + config.holdMinutes * 60 * 1000,
  }
  write(state)
  return { ok: true, hold: state.hold }
}

export async function releaseHold() {
  const state = read()
  state.hold = null
  write(state)
}

export async function payOrder(config, buyer, now = Date.now()) {
  const state = dropExpiredHold(read(), now)
  if (!state.hold) return { ok: false, reason: 'expired' }

  const taken = state.hold.seatIds.filter((id) => state.sold[id])
  if (taken.length > 0) {
    state.hold = null
    write(state)
    return { ok: false, reason: 'taken', taken }
  }

  const order = {
    code: `HRM-${code(6)}`,
    createdAt: now,
    buyer: { name: buyer.name.trim(), email: buyer.email.trim(), phone: buyer.phone.trim() },
    seats: state.hold.seatIds.map((id) => ({
      id,
      price: priceOf(config, id),
      ticketCode: `HRM27-${id}-${code(8)}`,
    })),
    total: orderTotal(config, state.hold.seatIds),
    // No gateway is connected. Nothing was charged.
    payment: 'simulated',
  }

  for (const seat of order.seats) state.sold[seat.id] = order.code
  state.hold = null
  state.orders.push(order)
  write(state)
  return { ok: true, order }
}

export async function getOrders() {
  return read().orders
}

// ---------- Prototype tools ----------

export async function resetAll() {
  write(empty())
}

export async function seedDemoSales(config, count) {
  const state = read()
  const held = new Set(state.hold?.seatIds ?? [])
  const free = buildSeats(config)
    .map((s) => s.id)
    .filter((id) => !state.sold[id] && !held.has(id))
  for (let i = 0; i < count && free.length > 0; i++) {
    const pick = Math.floor(Math.random() * free.length)
    state.sold[free.splice(pick, 1)[0]] = 'DEMO'
  }
  write(state)
}
