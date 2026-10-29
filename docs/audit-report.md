# Harmonia — standards audit

Standards version: 2026-10-12
Audited: 2026-10-29, branch `standards-retrofit`
Stack note: plain CSS custom properties + JSX, not Tailwind. Greps in
`anti-slop.md` were translated to the equivalent CSS properties.

Counts: 24 pass, 22 FAIL, 1 not applicable, 4 not run.

## A. Repo setup

| Item | Result |
|---|---|
| Graphify graph | FAIL, no `graphify-out/` |
| Git deny rules | fixed, `.claude/settings.json` |
| Pre-commit check | fixed, `.githooks/pre-commit` runs `oxlint` (no TypeScript in this repo, so no `tsc`) |

## B. Twelve must-haves

| # | Feature | Result |
|---|---|---|
| 1 | Mobile menu | FAIL, partial. Present and opaque (`Header.css:137`), closes on link tap, 48px targets. No Escape handler, no focus trap (`Header.jsx`) |
| 2 | Loading states | FAIL, none anywhere |
| 3 | Scroll progress bar | FAIL, none |
| 4 | Sticky header | pass, `Header.css:5` |
| 5 | Password visibility toggle | not applicable, no password field on the site |
| 6 | UTM tracking | FAIL, none |
| 7 | Form success state | FAIL. A success message renders (`Contact.jsx:34`) but `handleSubmit` only calls `setStatus('sent')` and sends nothing. The state lies to the visitor |
| 8 | Form error state | FAIL, relies on native browser validation only. No per-field message, no focus move |
| 9 | Confirmation modal | FAIL, none |
| 10 | Last updated date | FAIL, none on the edition or merch pages |
| 11 | Expandable FAQ | pass, native `<details>` at `Contact.jsx:101`. No shared `name`, so several can sit open at once |
| 12 | Floating contact | FAIL, none |

## C. Exclusions

Pass: 01 purple/blue gradients, 02 gradient hero text, 03 emoji, 04+19 banned
fonts (Archivo/Figtree/Fraunces/DM Mono), 10 Lucide, 11 shadcn, 12 fade-in on
scroll, 13+27 cursor effects, 16 em and en dashes, 20 grain, 28+29 fake
counters and AI badges.

| Tell | Result |
|---|---|
| 06 Glassmorphism | FAIL, `Carousel.css:31`, `Figure.css:29`, `Header.css:9` |
| 23 Glass/transparent header | FAIL, `Header.css:8` is 88% tint plus `blur(12px)`. The rule is solid |
| 22 Pill buttons | FAIL, `--r-pill: 999px` on every button, `index.css:67,235,294,311,398` |

## D. Richness floor and motion ceiling

not run. The brief never named a package, so the row is unknown. See Gate R
question 1.

## E/F. UI craft and UX flow

not run in full. Needs the before screenshots, which need a running server.

## G. Feel kit consistency

Reconstructed from the code: single maroon accent `#901e24`, white canvas,
1px hairline borders, no shadows, 28/40px card radii. Internally consistent.
The pill buttons are the one element that does not agree with the hairline,
squared-card language around them.

## H. Studio design system, Part 8

not run, `~/Developer/eclipse-studio/docs/DESIGN-SYSTEM.md` not present on
this machine.

## I. Accessibility and performance

| Item | Result |
|---|---|
| Alt text | pass, present and descriptive on every image |
| `focus-visible` | pass, `index.css:118` |
| Skip link | pass, `index.css:391` |
| `prefers-reduced-motion` | pass, `index.css:403` |
| `html lang` updates on toggle | pass, `LanguageContext.jsx:20` |
| Nav landmarks | pass, `aria-label="Primary"` |
| Image weight | FAIL. 23 partner logos are 2000x2000 PNGs, 7.2MB total, rendered at ~60px. The homepage marquee renders each twice |
| Modern image formats | FAIL, no WebP or AVIF, no `srcset` |
| Lighthouse mobile | not run, needs a production build |

## SEO and sharing

| Item | Result |
|---|---|
| `og:title`, `description` | pass |
| `og:image` | FAIL |
| `twitter:card` | FAIL |
| Canonical | FAIL |
| Per-route `<title>` | FAIL, one static title across all five routes |
| `robots.txt` | FAIL |
| `sitemap.xml` | FAIL |
| JSON-LD `Event` | FAIL |

## Resilience

| Item | Result |
|---|---|
| 404 route | pass, `App.jsx:43` |
| Error boundary | FAIL, any throw blanks the site |
| Analytics | FAIL, none |

## J. Security

not run, Step 4.

## Content needing the client

- Founder's words are placeholder copy written by Claude, not Jorge
- 8 performer and 14 committee portraits missing, all render as monograms
- Recap video slot empty
- Seal artwork is a 150px Instagram grab, also used as favicon
- YKAI figure is a range, "roughly Rp30 to Rp40 million"
- `hello@harmoniafest.id` is invented and may not exist
- Merch promo is a year expired but written in the present tense, with a live
  order form

---

## Fixed in the retrofit pass, 2026-10-29

Branch `standards-retrofit`. Each verified in the browser before commit.

| Was | Now | Commit |
|---|---|---|
| Tell 22, pill buttons | 12px via `--r-button` | `acf00d4` |
| Tell 23, glass header | solid `--paper` | `acf00d4` |
| Tell 21, label pills in 9 places | plain mono text | `acf00d4` |
| og:image, twitter:card, canonical | present | `cd566f3` |
| One title for 5 routes | per-route, bilingual | `cd566f3` |
| No robots.txt or sitemap.xml | both, 7 routes | `cd566f3` |
| No Event schema | JSON-LD from editions.js | `cd566f3` |
| Logos 7.16 MB | 96 KB WebP, 98.7% smaller | `b8f1ca1` |
| No error boundary | catches, both languages | `0cfcff5` |
| No analytics | Vercel Analytics, cookieless | `0cfcff5` |
| Must-have 1, no Escape or focus trap | both, focus returns to toggle | `168d27f` |
| Must-have 8, no form error state | per-field, focus moves, input kept | `168d27f` |
| Must-have 11, FAQ all open at once | shared name | `168d27f` |

Note on the form: `noValidate` was required. The browser's own
`type="email"` check cancelled submit before `handleSubmit` ran, so no
custom message could ever appear.

Analytics still needs enabling in the Vercel dashboard before it reports.

### Still open

- Must-have 2 loading states, 3 scroll progress, 6 UTM, 9 confirmation
  modal, 10 last updated, 12 floating contact
- Must-have 7: the form still does not send. Needs an endpoint decision
  (Formspree or Resend), not just code
- D richness floor against the Custom / Commerce row
- E, F, H: not run, need `/impeccable`, `21st-ui-review` and a studio
  design system file absent from this machine
- J security: Step 4
- Everything under "Content needing the client" above
