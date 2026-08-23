# Harmonia, Website

A bilingual (ID/EN) React + Vite site for **Harmonia: Harmoni Indonesia**, a
student-run charity music concert in Yogyakarta. Built against the
requirements in [`PRD.md`](./PRD.md).

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint       # oxlint
```

## What's real vs. placeholder

Real and live on the site:

- **Harmonia 2025 facts**, date, venue, price, Artatix link, guide-book
  rules (from the Artatix listing and Instagram profile)
- **201 tickets sold** and **Rp50,000,000+ raised**, supplied by the team
- **23 partner logos**, 14 sponsors, 6 community partners, 3 media
  partners, in `public/logos/`
- **24 event photos** by **@fusiapicture**, in `public/photos/`
- **13 committee members** in `src/data/team.js` (`/team` page)
- **9 performers + the full 11-piece repertoire** in
  `src/data/performers.js`, taken from the printed guide book
- **53 photos organised per performance** in `src/data/gallery.js`,
  matching the team's own Drive folders (7 performance sets + off stage)
- **Official merch** (Dagadu tee, prices, promo, pre-order form) in
  `src/data/org.js`
- **Ticketing/merch WhatsApp contacts** (Adela, Tata, Dio) on `/contact`
- **Real mission statement & foreword** (ID + EN) on `/about`

Still outstanding:

- **Team portraits**, drop files in `src/assets/team/` (see the README
  there). Members without one render a monogram tile.
- **Partner names flagged `needsConfirm`** in `src/data/sponsors.js`, read
  off the logo artwork and worth a spelling check.
- **Partner websites**, every `url` is empty; fill in to make logos
  clickable.
- **Performer portraits**, drop files in `src/assets/performers/` named by
  performer id; monogram tiles render meanwhile.
- **Contact email**, `hello@harmoniafest.id` in `src/data/org.js` is a
  placeholder.
- **Contact form delivery**, validates and shows success, but sends
  nothing yet (see `src/pages/Contact.jsx`).

## Design system

**White gallery, black ink**, component language drawn from the reference
set (Anthropic, Hyer, Caldera, xAI, Augen, Apple, Wispr Flow): architectural
bold display type, pill actions, hairline-ring elevation, alternating white
and near-black chambers. Tokens live at the top of
[`src/index.css`](src/index.css).

| | |
|---|---|
| Canvas | `#ffffff`; recessed panels `#f5f5f7`; dark chambers `#0a0a0a` |
| Ink | `#0a0a0a`, text, filled pill buttons, never softened to grey |
| Accent | seal crimson `#a5202d`, one consequential CTA per page |
| Display | Archivo 700-800, tracking −0.03em, poster scale |
| UI / body | Figtree · DM Mono for eyebrows, roles, metadata |
| Editorial voice | Fraunces 400 via `.prose-serif` (mission, foreword, founder) |
| Shape | pill buttons/badges; 28-40px card radii |
| Elevation | 1px hairline rings, no shadows anywhere |
| Signature motif | halftone dot fields, echoing the seal's piano |

The home page is capped at **five sections**, in order:

1. **Hero**, typographic. On tablet and up the section is exactly one
   viewport tall (`100svh - --header-h`) laid out as a flex column; the
   photograph is the only flexible row (`flex: 1 1 0`), so it absorbs every
   height difference and the four stat figures always land above the fold.
   Below 768px it returns to natural flow.
2. **Words from the Founder**, Jorge's portrait and personal address.
3. **Mission**, dark chamber.
4. **Performers**, the bill.
5. **Partners**, the marquee.

The founder section's copy is a **draft**, Jorge replaces it in
`src/i18n/strings.js` (search "WORDS FROM THE FOUNDER", both languages).

The brand seal renders from `src/assets/brand/seal.jpg` in a circular crop
that clips the piano legs. Current file is the 150px Instagram profile
picture, replace with the original high-res artwork (same filename) for a
lossless upgrade; crop knobs in `SealLogo.css`.

## Structure

Five destinations, each one topic:

| Nav | Route | Holds |
|---|---|---|
| Beranda / Home | `/` | hero, founder, mission, lineup bill, partners |
| Tentang / About | `/about` | story, mission, foreword, event history, partners wall, impact |
| Harmonia 2025 | `/edition/harmonia-2025` | event facts, early bird, guide book |
| Lineup & Tim | `/lineup` | performers, programme, committee by division |
| Galeri / Gallery | `/gallery` | recap video, per-artist carousels, Instagram highlights |

Contact and Merch stay routed (`/contact`, `/merch`) and are reachable from
the footer. Retired paths redirect: `/performers` and `/team` to `/lineup`,
`/sponsors-impact` to `/about#partners`.

```
src/
  data/            edition, performer, gallery, sponsor, team, org content
  i18n/            strings.js (ID/EN dictionary) + LanguageContext
  components/      Header, Footer, SealLogo, Carousel, RecapVideo, Figure, ...
  pages/           Home, About, Edition, Lineup, Gallery, Merch, Contact, NotFound
```

Routing is client-side (`react-router-dom`). Every edition renders through
the single `/edition/:slug` template driven by `src/data/editions.js`, so
adding an edition is a data change, not a new page.

## House style

No em dashes or en dashes anywhere in copy. Use commas, full stops, or
parentheses instead. A sweep script lives at `/tmp/dash.cjs` if copy is ever
pasted in from elsewhere.

## Next steps

1. Swap placeholder content for real assets (logo vectors, performer/sponsor
   rosters, gallery photos, donation figures), see `PRD.md` §11.
2. Wire the contact form to a real email service (Formspree/Resend).
3. When ready, migrate to Next.js for SSR/SEO per the PRD's tech direction,
   or deploy this Vite build as-is (Vercel/Netlify both work out of the box).
