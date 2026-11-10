// Run with: npm test
// The smallest set of checks that fails if the money or inventory logic breaks.
import assert from 'node:assert/strict'

const store = new Map()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  },
})

const api = await import('./api.js')
const { ticketing: cfg } = await import('../data/ticketing.js')
const buyer = { name: 'Tes', email: 'tes@example.com', phone: '081200000000' }
const T0 = 1_000_000
const MIN = 60 * 1000

// Seat plan and money
assert.equal(api.buildSeats(cfg).length, 220)
assert.equal(api.priceOf(cfg, 'A1'), 150000)
assert.equal(api.orderTotal(cfg, ['A1', 'D5', 'L20']), 150000 + 115000 + 85000)
assert.equal(api.formatIDR(150000), 'Rp150.000')

// Best available sits a group together, next to the aisle, in the front row
assert.deepEqual(api.pickBest(cfg, [], 'front', 2), ['A9', 'A10'])
assert.deepEqual(api.pickBest(cfg, ['A10'], 'front', 2), ['A11', 'A12'])
const rowAGone = Array.from({ length: 20 }, (_, i) => `A${i + 1}`)
assert.deepEqual(api.pickBest(cfg, rowAGone, 'front', 3), ['B8', 'B9', 'B10'])

// Holds: limits, unknown seats, expiry
await api.resetAll()
assert.equal((await api.holdSeats(cfg, [], T0)).reason, 'empty')
assert.equal((await api.holdSeats(cfg, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'], T0)).reason, 'limit')
assert.equal((await api.holdSeats(cfg, ['Z99'], T0)).reason, 'unknown')
const held = await api.holdSeats(cfg, ['A1', 'A2'], T0)
assert.equal(held.ok, true)
assert.equal(held.hold.expiresAt, T0 + cfg.holdMinutes * MIN)

// Paying after the hold ran out sells nothing
const late = await api.payOrder(cfg, buyer, T0 + cfg.holdMinutes * MIN)
assert.equal(late.ok, false)
assert.equal(late.reason, 'expired')
assert.deepEqual((await api.getAvailability(T0 + 9 * MIN)).sold, [])

// A paid order marks seats sold, with one ticket per seat
await api.holdSeats(cfg, ['A1', 'A2'], T0)
const paid = await api.payOrder(cfg, buyer, T0 + MIN)
assert.equal(paid.ok, true)
assert.equal(paid.order.total, 300000)
assert.equal(paid.order.seats.length, 2)
assert.notEqual(paid.order.seats[0].ticketCode, paid.order.seats[1].ticketCode)
assert.equal(paid.order.payment, 'simulated')

// The same seat cannot be sold twice
const again = await api.holdSeats(cfg, ['A2', 'A3'], T0 + 2 * MIN)
assert.equal(again.ok, false)
assert.deepEqual(again.taken, ['A2'])

// One payment per hold
assert.equal((await api.payOrder(cfg, buyer, T0 + 2 * MIN)).ok, false)
assert.equal((await api.getOrders()).length, 1)

console.log('ticketing engine: all checks passed')
