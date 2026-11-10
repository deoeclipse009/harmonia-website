// Database access. SQLite through libSQL: a local file while developing, a
// hosted Turso database in production. Same SQL in both places.
import { createClient } from '@libsql/client'

let client
let ready

export function getDb() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL
    if (!url && process.env.VERCEL) {
      throw Object.assign(new Error('TURSO_DATABASE_URL is not set'), { code: 'not_configured' })
    }
    client = createClient({
      url: url || 'file:.data/harmonia.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return client
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS categories (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     kind TEXT NOT NULL DEFAULT 'online',
     price INTEGER NOT NULL DEFAULT 0,
     max_per_order INTEGER NOT NULL DEFAULT 5,
     sale_start INTEGER,
     sale_end INTEGER,
     on_sale INTEGER NOT NULL DEFAULT 1,
     sort INTEGER NOT NULL DEFAULT 0,
     rows TEXT NOT NULL DEFAULT '[]',
     blocked TEXT NOT NULL DEFAULT '[]',
     description TEXT NOT NULL DEFAULT '',
     archived INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS orders (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     code TEXT UNIQUE NOT NULL,
     token TEXT UNIQUE NOT NULL,
     status TEXT NOT NULL,
     channel TEXT NOT NULL DEFAULT 'online',
     category_id INTEGER NOT NULL,
     buyer_name TEXT NOT NULL DEFAULT '',
     email TEXT NOT NULL DEFAULT '',
     phone TEXT NOT NULL DEFAULT '',
     subtotal INTEGER NOT NULL DEFAULT 0,
     discount INTEGER NOT NULL DEFAULT 0,
     total INTEGER NOT NULL DEFAULT 0,
     voucher_code TEXT,
     created_at INTEGER NOT NULL,
     expires_at INTEGER,
     paid_at INTEGER,
     proof TEXT,
     proof_note TEXT NOT NULL DEFAULT '',
     admin_note TEXT NOT NULL DEFAULT '',
     created_by TEXT NOT NULL DEFAULT '',
     email_status TEXT NOT NULL DEFAULT ''
   )`,
  `CREATE TABLE IF NOT EXISTS tickets (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     order_id INTEGER NOT NULL,
     category_id INTEGER NOT NULL,
     seat TEXT NOT NULL,
     holder_name TEXT NOT NULL DEFAULT '',
     code TEXT UNIQUE NOT NULL,
     price INTEGER NOT NULL,
     active INTEGER NOT NULL DEFAULT 1,
     checked_in_at INTEGER,
     checked_in_by TEXT
   )`,
  // The rule the whole system rests on: a seat can belong to only one live
  // order. The database enforces it, so no timing of requests can sell a
  // seat twice.
  `CREATE UNIQUE INDEX IF NOT EXISTS seat_once ON tickets(category_id, seat) WHERE active = 1`,
  `CREATE INDEX IF NOT EXISTS tickets_order ON tickets(order_id)`,
  `CREATE TABLE IF NOT EXISTS vouchers (
     code TEXT PRIMARY KEY,
     name TEXT NOT NULL DEFAULT '',
     type TEXT NOT NULL DEFAULT 'nominal',
     amount INTEGER NOT NULL DEFAULT 0,
     stock INTEGER NOT NULL DEFAULT 0,
     used INTEGER NOT NULL DEFAULT 0,
     min_total INTEGER NOT NULL DEFAULT 0,
     starts_at INTEGER,
     ends_at INTEGER,
     category_id INTEGER,
     active INTEGER NOT NULL DEFAULT 1
   )`,
  `CREATE TABLE IF NOT EXISTS staff (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     username TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL DEFAULT '',
     role TEXT NOT NULL,
     pass_hash TEXT NOT NULL,
     active INTEGER NOT NULL DEFAULT 1
   )`,
]

// Seat rows counted from the 2025 seating poster. They are a starting point:
// counts were read off a phone screenshot, so check each one in the panel.
// Prices are the 2025 prices. `rows` is seats per row, front to back.
const SEED_CATEGORIES = [
  ['Fortissimo Center', 'online', 115000, [18, 17, 16, 15, 15, 15], []],
  ['Fortissimo Right', 'online', 115000, [5, 9, 13, 13, 12, 10], []],
  ['Fortissimo Left', 'online', 115000, [5, 9, 13, 13, 12, 10], []],
  ['Forte Right', 'online', 110000, [19, 18], []],
  ['Forte Left', 'online', 110000, [19, 18], []],
  ['Early Bird Forte', 'online', 100000, [17, 17], []],
  ['Mezzo Piano Center', 'online', 105000, [9, 9, 9, 9, 9, 9, 9], ['F4', 'F5', 'G4', 'G5']],
  ['Mezzo Piano Right', 'online', 105000, [8, 8, 8, 7, 7, 7, 7], []],
  ['Mezzo Piano Left', 'online', 105000, [8, 8, 8, 7, 7, 7, 7], []],
  ['Pianissimo Bawah lt. 1', 'online', 95000, [4, 4, 4, 4, 4, 4, 4, 4], []],
  ['Pianissimo Atas lt. 2', 'online', 95000, [4, 5, 5, 4, 4, 5, 5, 4], []],
  // Not sold online. Used for invitations and sales at the door.
  ['VIP', 'offline', 0, [16, 14, 16, 14], []],
]

export const DEFAULT_EVENT = {
  name: 'Harmonia 2027',
  dateText: '',
  timeText: '',
  venue: '',
  payHours: 3,
  bankName: '',
  bankAccount: '',
  bankHolder: '',
  qrisImage: '',
  terms: '',
}

export async function migrate(db) {
  await db.batch(SCHEMA, 'write')
  const existing = await db.execute('SELECT COUNT(*) AS n FROM categories')
  if (Number(existing.rows[0].n) === 0) {
    await db.batch(
      SEED_CATEGORIES.map(([name, kind, price, rows, blocked], i) => ({
        sql: `INSERT INTO categories (name, kind, price, sort, rows, blocked) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [name, kind, price, i, JSON.stringify(rows), JSON.stringify(blocked)],
      })),
      'write',
    )
  }
  await db.execute({
    sql: `INSERT OR IGNORE INTO settings (key, value) VALUES ('event', ?)`,
    args: [JSON.stringify(DEFAULT_EVENT)],
  })
}

// Runs the schema once per process, then hands back the client.
export async function db() {
  const c = getDb()
  if (!ready) ready = migrate(c)
  await ready
  return c
}
