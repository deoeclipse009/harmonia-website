# Product Requirements Document — HARMONIA Website

**Status:** Draft v1 for review
**Prepared:** 2026-08-19
**Owner:** Harmonia Production Team (student-run, FBSB UNY, Yogyakarta)
**Prepared by:** Claude, based on research of @harmoniafest.id (Instagram) and the live Artatix event page

---

## 1. Context & Research Summary

Harmonia currently has **no website** — its entire public presence is an Instagram account (@harmoniafest.id, 364 followers) plus a third-party ticketing listing on Artatix. Everything below was gathered directly from those two public sources (no login was used or required; Instagram content behind its login wall — e.g. individual post captions — was not accessible and is flagged as an open item).

**What Harmonia is:**
- Full name: **Harmonia: Harmoni Indonesia**
- Format: A **charity music concert** ("Konser Musik Amal"), produced by student organizers at Universitas Negeri Yogyakarta.
- Mission: The concert is explicitly framed as a fundraiser — *"bertujuan untuk menggalang dana bagi pengasuhan dan pendidikan anak-anak Indonesia"* (raising funds for the care and education of Indonesian children). A portion of ticket sales is donated to **SOS Children's Villages Indonesia**, an NGO supporting children who have lost, or are at risk of losing, parental care.
- This social-impact angle is a core brand pillar, not a footnote — it should be prominent on the site, not buried.

**Most recent edition (2025):**
- Date/time: **29 August 2025, 17:30–21:00 WIB**
- Venue: **Performance Hall, FBSB UNY** — Karang Malang, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta
- Partner: run in collaboration with **@desaanaksos**
- Ticketing: sold via **Artatix** (artatix.co.id/event/harmonia), starting from **Rp115.000**
- Category on Artatix: "Musik"
- Documented audience/venue terms (from Artatix T&C): security bag checks, no outside food/drink, silent phones during the show, photography permitted (no flash, no obstructing other guests), footage from the event may be used in official promotion.

**Instagram content structure (from profile + Highlights):**
The account's Highlights reveal the content categories the team already produces and that the website should mirror/aggregate:
- `JAZZ KOTABARU` — a related/prior event (jazz-themed, "Kotabaru" is a district in Yogyakarta) — suggests Harmonia Production Team runs more than one recurring event.
- `Guide Book` — an attendee guide (logistics, house rules, schedule).
- `Performances`, `D-Day (Part 1)`, `D-Day (Part 2)` — event-day recap content.
- `Performers` — lineup/artist profiles.
- `Harmonia Family` — presumably the organizing committee/volunteers ("panitia").
- `Merchandise` — event merch.
- `Ticket Info` — pricing/tiers.
- `Sponsors` — partner/sponsor shoutouts.

**Visual identity (from profile photo & grid, to confirm with team but usable as a v1 starting point):**
- Logo: a circular badge/seal, in the style of a vintage emblem — arched "HARMONIA" wordmark, an illustrated grand piano at the center, rendered in **deep maroon/burgundy with gold/cream linework**.
- Photography style: warm, low-light concert/gala photography — audience shots under purple/magenta stage lighting, and formal portraits of guests in batik and suits, signaling an **elegant, semi-formal event**, not a casual outdoor festival.
- Overall tone: warm, prestigious, culturally-rooted (Indonesian formal dress, "Harmoni Indonesia" naming), charitable — closer to a boutique benefit gala than a typical EDM/pop "festival."

**Key constraint this PRD must design around:** relative to today (19 Aug 2026), the only documented edition (29 Aug 2025) is **over a year in the past**, and no next-edition date is public yet.

---

## 2. Decisions From Stakeholder Review

Confirmed directly with the Harmonia contact (via clarifying questions):

1. **Site purpose (hybrid):** The site is **not** a single-event microsite. It's the **evergreen home of Harmonia as an ongoing charity concert brand/production house**. It must:
   - Lead with a strong **recap of the 2025 edition** (this is the only proof of track record right now) — gallery, performers, impact numbers, sponsors.
   - Be structurally ready to **flip into "next edition" mode** the moment a new date/lineup/tickets are announced, without a rebuild (i.e., an "edition" is data, not a hardcoded page).
   - Include a **dedicated "About / Organization" page** for the Harmonia Production Team itself — who they are, their mission, and their event history (Harmonia, Jazz Kotabaru, etc.) — separate from any single concert's page.

2. **v1 feature set:**
   - **Ticketing — link-out model** (see explainer below), not in-house checkout.
   - **Photo/video gallery**
   - **Lineup / performers page**
   - **Sponsors & donation-impact transparency**

3. **Language:** **Bilingual Indonesian/English with a toggle.** Matches the mixed ID/EN usage already seen on Instagram/Artatix and widens reach to sponsors/press.

4. **Tech direction:** **React / Next.js.**

### Ticketing model — explainer
Harmonia already sells tickets through **Artatix**, an established Indonesian ticketing platform that handles payments, e-tickets, and check-in. Rebuilding that in-house would mean owning PCI-scope payment handling, refund logistics, and check-in tooling — high cost/risk for a small student-run team, duplicating something a real ticketing vendor already does well.

**Recommendation (adopted for this PRD):** the website is the marketing/storytelling layer; **"Beli Tiket / Buy Tickets" buttons deep-link out to the event's Artatix page** for the active edition. This keeps money/PII off the Harmonia site entirely (no payment forms, no card data — nothing in the "prohibited actions" category to worry about), while the site still owns the pricing/tier *display* (e.g. "From Rp115.000") for marketing purposes, sourced from the same data used to generate the Artatix link. If Harmonia later wants a fully-owned purchase flow, that's a v2 decision, not v1.

---

## 3. Goals

**Business goals**
- Establish Harmonia as a credible, recurring brand independent of any single Instagram post — a permanent, linkable home base.
- Build legitimacy for **sponsor outreach and partnership pitches** (a proper sponsors/impact page is often a prerequisite for corporate sponsors).
- Convert visitors into ticket buyers for the next edition (once announced) via clear, low-friction hand-off to Artatix.
- Make the **social-impact story (SOS Children's Villages)** a first-class, sharable asset — usable in press kits, sponsor decks, and grant/partnership conversations.

**User goals**
- *Prospective attendee:* quickly understand what Harmonia is, whether there's a show coming up, and how to get tickets.
- *Past attendee / fan:* relive the 2025 edition (photos, performers, atmosphere), stay informed on what's next, follow on Instagram.
- *Sponsor / partner prospect:* understand Harmonia's reach, audience, past sponsors, and the cause, and find a clear way to make contact.
- *Performer / prospective collaborator:* see who's performed before and how to get involved.
- *Press / donor:* find factual, citable info on the mission and impact (funds raised/donated, beneficiary org).

---

## 4. Target Audience

1. University students & young professionals in Yogyakarta (primary ticket-buying audience).
2. Jazz/music-appreciation and cultural-event communities in DIY (Daerah Istimewa Yogyakarta).
3. Corporate & institutional sponsors (local businesses, university bodies, brands wanting CSR/cultural association).
4. Performers and creative collaborators (musicians, MCs, production crews).
5. Donors/press interested in the SOS Children's Villages partnership.

---

## 5. Site Structure (Sitemap)

Every top-level page exists in **ID and EN** via a language toggle (URL-based, e.g. `/id/...` and `/en/...`, defaulting to ID with browser-language detection).

1. **Home (`/`)**
   - Hero: current "edition state" component — either **"Upcoming: [Edition Name] — [date] — Get Tickets"** or, when no edition is announced, **"Relive Harmonia 2025"** with a recap CTA.
   - Mission strip: one-line charity framing + SOS Children's Villages logo/mention.
   - Highlights reel: photo/video teaser from the latest edition.
   - Quick links: Performers, Gallery, Sponsors, About.
   - Instagram feed teaser (embed or manually curated latest posts) + follow CTA.
   - Newsletter/contact-list signup (optional, see open questions).

2. **About / Harmonia Production Team (`/about`)**
   - Organization mission & story (the "Harmoni Indonesia" concept, why it exists).
   - Event history timeline: Harmonia 2025, Jazz Kotabaru, and future entries — pulled from the same "editions/events" data model (see §7).
   - Team/"Harmonia Family" section — committee structure or featured organizers (only as much as is comfortable to publish; see open questions on privacy).
   - Partnership CTA (for future collaborators, venues, NGOs).

3. **Current/Next Edition (`/edition/[slug]`, e.g. `/edition/harmonia-2025`)**
   - This is the template every edition (past or future) renders through — **not** a one-off hardcoded page — so a 2026 edition can be added as a new data entry, not a new page.
   - Event details: date, time, venue (with embedded map), dress code/format cues.
   - "Buy Tickets" CTA → deep-links to that edition's Artatix (or successor platform) URL. Shows starting price ("From Rp115.000").
   - Guide Book content: schedule, house rules, what to bring/not bring (sourced from the Instagram "Guide Book" highlight content).
   - Status ribbon: Upcoming / Past — changes CTA copy and visual treatment (e.g., past editions show "Watch the Recap" instead of "Buy Tickets").

4. **Performers / Lineup (`/performers`, edition-filterable)**
   - Grid of performer profile cards: name, photo, short bio, genre/role, social links.
   - Filter/tag by edition (e.g. view "Harmonia 2025 lineup" vs. all-time performer roster).

5. **Gallery (`/gallery`)**
   - Photo (and video, if available) grid from past editions, filterable by edition and by moment (Performances, D-Day, Crowd, Behind-the-scenes) — mirrors the Instagram Highlight categories.
   - Lightbox viewer; credit photographers if known.

6. **Sponsors & Impact (`/sponsors-impact`)**
   - Sponsor logo wall, tiered if applicable (title sponsor / partner / media partner).
   - "Why sponsor Harmonia" pitch block (audience size/demographics, past reach, brand alignment with a cultural charity cause).
   - Impact section: explanation of the SOS Children's Villages Indonesia partnership, what donations fund, and (once available) a running total of funds raised/donated across editions.
   - Sponsor/partner inquiry CTA → contact form or mailto.

7. **Merchandise (`/merch`)** *(lighter-weight page for v1)*
   - Showcases past/current merch items with photos; links out to wherever merch is actually sold (Instagram DM, a form, or a store link) rather than building e-commerce in-house — same "link-out, don't rebuild" principle as ticketing.

8. **Contact / FAQ (`/contact`)**
   - FAQ block sourced from Guide Book / Artatix T&C content (refund policy, entry rules, accessibility, parking).
   - Contact form (routes to email — no sensitive data collection) + social links (Instagram primary).

**Global elements:** header nav, language toggle, footer (social links, "in collaboration with" credits, SOS Children's Villages mention, copyright).

---

## 6. Page-Level Functional Requirements

- **Edition status logic:** a single "active edition" flag in the data model drives Home hero + nav CTA copy (Upcoming vs. Recap mode) — this is the mechanism that satisfies the "flip into next-edition mode without a rebuild" requirement from §2.
- **Ticket CTA:** every "Buy Tickets" button opens the edition's external ticketing URL in a new tab; button is disabled/relabeled "Tickets Not Yet Available" when an edition has no ticket link (e.g., an announced-but-not-onsale edition).
- **Language toggle:** persists across navigation (stored in URL + local preference), all copy professionally translated (not machine-translated placeholder) before launch.
- **Gallery filtering:** client-side filter by edition/category; lazy-loaded images for performance.
- **Responsive design:** mobile-first — Instagram referral traffic will be overwhelmingly mobile.
- **Social proof:** Instagram follow button/embed on Home and footer throughout.
- **Forms (contact / sponsor inquiry):** client-side validated, submit via email service (e.g., Formspree/Resend) — no backend database required for v1.

---

## 7. Content Model (for future CMS / data structure)

Designed so non-technical organizers can eventually add a new edition without a developer. Suggested entities:

- **Edition**: id, name (e.g. "Harmonia 2025"), status (upcoming/past), date, time range, venue name + address + map link, description (ID/EN), ticket URL, starting price, guide book content, hero image/video.
- **Performer**: id, name, photo, bio (ID/EN), role/genre, social links, associated edition(s).
- **GalleryItem**: id, media (image/video), caption, category (Performances/D-Day/Crowd/BTS), associated edition.
- **Sponsor**: id, name, logo, tier, associated edition(s), website link.
- **ImpactStat**: edition, funds raised, amount donated, beneficiary note (SOS Children's Villages).
- **OrgInfo** (singleton): mission statement, history/timeline entries, team/committee entries.

This lets v1 ship with these as static JSON/MDX content (fast, no backend), while leaving a clean path to a headless CMS (e.g. Sanity, Contentful, or a simple Git-based CMS) in v2 if the team wants self-service editing.

---

## 8. Design & Branding Direction

- **Palette:** deep maroon/burgundy (primary, from the logo) + gold/cream (accent) + a near-black or dark charcoal background option to match the moody concert photography; avoid generic "festival" neon gradients — lean elegant/gala, not EDM.
- **Typography:** a refined serif or classic display face for headings (echoing the vintage-badge logo lettering) paired with a clean sans-serif for body/UI text; must support Indonesian diacritics/characters cleanly.
- **Imagery:** prioritize the warm, low-light concert photography and formal-attire portraits already established in the Instagram grid — this is a signature look, not stock-photo festival imagery.
- **Logo usage:** the existing circular badge as primary mark; request a high-resolution/vector version from the team (see open questions) rather than re-deriving one from a compressed Instagram screenshot.
- **Tone of voice:** warm, sincere, culturally proud, mission-forward — copy should foreground the "for the children" cause alongside the music, not treat it as a footnote.

---

## 9. Non-Functional Requirements

- **Performance:** Lighthouse ≥ 90 on mobile for Performance/Accessibility/SEO/Best Practices; optimized/responsive images (Next.js `<Image>`), lazy-loaded gallery.
- **SEO:** proper metadata, Open Graph/Twitter cards per edition (critical for Instagram-bio link shares), sitemap.xml, structured data (`Event` schema.org markup) for the active edition so it can surface in Google's event listings.
- **Accessibility:** WCAG 2.1 AA target — alt text on all imagery, keyboard-navigable nav/gallery/lightbox, sufficient color contrast against the dark palette.
- **Hosting/deploy:** Vercel (natural fit for Next.js), custom domain (e.g. harmoniafest.id if acquirable, or harmoniafest.com/.id).
- **Analytics:** lightweight, privacy-respecting analytics (e.g. Vercel Analytics or Plausible) to track ticket-CTA click-through as the core conversion metric.
- **No payment or PII handling on-site** — reinforced by the link-out ticketing model in §2.

---

## 10. Success Metrics

- Click-through rate from "Buy Tickets" CTA to Artatix (primary conversion metric, trackable even without in-house checkout).
- Instagram bio link → website sessions (traffic redirected from the current bio-link setup).
- Sponsor inquiry form submissions.
- Organic search visibility for "Harmonia" + "Yogyakarta" / "charity concert Yogyakarta" queries.
- Qualitative: usable as a sponsor-deck link and press reference (not easily quantified, but a stated goal).

---

## 11. Open Questions / Inputs Needed From the Harmonia Team

These couldn't be resolved from public research (Instagram post captions and Highlight *contents* are behind Instagram's login wall, so only what's visible on the profile header and the Artatix listing was used):

1. High-resolution/vector logo and brand assets (current source is a compressed profile photo).
2. Actual performer names/bios, sponsor names/logos, and gallery photo files/rights (currently only category *names* are known, not contents, since Highlights require login to view).
3. Confirmed funds-raised/donated figures for the impact section (currently only the *mechanism* — partial proceeds to SOS Children's Villages — is confirmed, not amounts).
4. Whether/when a 2026 (or next) edition is being planned — determines whether Home launches in "upcoming" or "recap" mode.
5. How much to publish about individual committee/"Harmonia Family" members (privacy comfort level).
6. Domain name availability/preference.
7. Merch: is there an actual current sales channel to link out to, or should that page be omitted/marked "coming soon" for v1?

---

## 12. Out of Scope (v1)

- In-house ticket purchase/checkout and payment processing.
- In-house e-commerce for merchandise.
- User accounts/login.
- CMS/admin panel (content ships as static data files in v1; CMS is a v2 candidate).
- Native mobile app.

---

## 13. Next Steps After This PRD

1. Collect the assets/answers in §11 from the Harmonia team.
2. Produce a technical implementation plan (Next.js project setup, i18n approach, folder structure, component breakdown) as a separate, code-focused plan once this PRD is approved.
3. Design pass (moodboard/wireframes) using the branding direction in §8 before front-end build begins.
