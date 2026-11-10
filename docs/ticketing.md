# Harmonia ticketing

Own ticketing system, modelled on the workflow in the Artatix guide book:
categories by section, seat picking, manual payment, e-ticket with QR,
organiser panel, door check-in. No per-ticket platform fee.

## Where things are

| Path | What |
|---|---|
| `/tiket-2027-pratinjau` | Buyer page. Unlisted, noindex |
| `/e-tiket/<token>` | One order: payment, proof upload, then the e-tickets |
| `/panel` | Organiser panel and door scanner |
| `server/core.js` | All rules: orders, seats, vouchers, staff, check-in |
| `server/db.js` | Schema and the seat rows seeded from the 2025 poster |
| `server/handler.js` | The one API endpoint and the permission table |
| `api/tix.js` | Vercel serverless entry |
| `src/pages/Tickets.jsx`, `ETicket.jsx`, `Panel.jsx`, `src/panel/` | Screens |

## Run it locally

```bash
npm install
npm run dev
```

Data lives in `.data/harmonia.db`. Delete that file to start clean.
The panel user is `admin`. Its password is the `ADMIN_PASSWORD` line in
`.env.local`, which is never committed.

```bash
npm test
```

## How an order moves

1. Buyer picks a category, then seats. The server holds them for 10 minutes.
2. Buyer enters name, email, WhatsApp, optional voucher. Status: waiting.
   Seats are now held for the payment window (3 hours, set in the panel).
3. Buyer transfers and uploads proof. Status: needs checking. It no longer expires.
4. Admin opens the order in the panel, looks at the proof, confirms.
   Status: paid. Ticket codes exist from this moment, and the email goes out.
5. At the door, staff scan the QR. A ticket is accepted once.

A seat can belong to one live order only. That is a unique index in the
database, not a check in code, so two buyers cannot get the same seat no
matter how their requests are timed.

## Roles

| Role | Can |
|---|---|
| admin | Everything |
| seller | Door sales, see orders, report |
| checkin | Scan tickets, see counts |

## Going online

Nothing here is deployed yet. In order:

1. **Turso** (free): create a database, copy its URL and an auth token.
2. **Vercel project settings, Environment Variables**: set
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `SESSION_SECRET` (any long
   random string), `ADMIN_PASSWORD` (your own, 12 characters or more),
   `PUBLIC_URL` (the site address). See `.env.example`.
3. **Email, optional**: `RESEND_API_KEY` and `MAIL_FROM`. Resend only sends
   from a domain you own, so this needs a real domain. A `vercel.app`
   address cannot be used. Without it, buyers still get their e-ticket link
   on screen and can send it to their own WhatsApp.
4. Deploy, then in the panel: **Pengaturan** for date, venue, bank account
   or QRIS; **Kategori** to check every seat row and price.

## Known limits

- Seat rows were counted from a phone screenshot of the 2025 poster. Check them.
- Prices are the 2025 prices.
- The door scanner's camera path has not been run on a real phone. What is
  tested: the scanner library reads the QR codes the e-ticket prints, and
  the check-in rules.
- The Vercel function and the email have not run in production, since
  both need accounts that do not exist yet.
- Wrong panel passwords are slowed down, not locked out.
- Proof images are stored in the database. Fine for a few hundred orders.
- Cancelling a paid order frees the seats. Sending money back is manual.
- One category per order. The seat plan shows one section at a time, as
  straight rows, not the shape of the hall.
- The panel is in Indonesian only.

## Personal data

Buyer name, email, WhatsApp number and proof of payment are stored. Only
panel accounts can read them. The buyer's e-ticket link is long and random;
anyone holding the link can see that order, so it is treated like the ticket.
