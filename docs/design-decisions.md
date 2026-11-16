# Harmonia: design decisions (Blend)

Agreed 2026-11-16 in the `/home-lab` sessions. This file is what the build
reads. The lab page is throwaway and goes once the real pages carry this.

## References

| Link | Borrowed | Not borrowed |
|---|---|---|
| kaboodle.com | Full-bleed concert photo behind a huge headline, two buttons; sections flooded in the brand colour; rounded stacked sheets | Organiser product sections, client logo wall as proof, "book a demo", purple |
| vcass.vic.edu.au/programs | Dark stage photography, slow masked image reveals, one large statement, a row of photo plates linking out | Loading screen, all-caps headings |

## Feel

Blend: the Elegant kit's stage (dark page, light-weight display type, slow
masked reveals, hero fading into black) with the Soft kit's warmth (the
logo maroon at full strength, rounded sheets and cards, gentle lifts).
Approved by Jorge after comparing Bold, Elegant, Soft and Blend side by side.

## Palette

| Token | Value | Use |
|---|---|---|
| stage | `#150608` | Page background |
| panel | `#22090d` | Cards and panels on the stage |
| ink | `#f3ebe4` | Text on the stage |
| maroon | `#901e24` | Main buttons, the cause section, active rows |
| blush | `#e8a3a7` | One accent per view: the first statement line, the money figure, the quote mark |
| black | `#000` | Closing section |

Contrast (WCAG AA) to be measured and recorded in the build's audit.
Option sheet kept for reference: Harmonia maroon (chosen), Signal, Ink and
Tangerine, Cobalt and Coral.

## Type

Archivo for display, Figtree for text, as across the site. Display runs at
weight 300 to 400, large and tight. No new font.

## Components

- **Navbar:** the existing header, dark variant on dark pages (token re-map, `site-header--dark`).
- **Hero:** full-bleed stage photo, shade fading into the stage colour, the word "Harmonia" only, one solid maroon button and one outline button.
- **Footer:** existing footer, already dark.
- **Main action:** "Relive 2025" (edition page) until 2027 tickets open; then "Buy tickets" in the same place.

## Home page, in order

1. Hero
2. Statement: first sentence as a blush line, the rest at reading size beside it
3. Numbers: four equal centred cells on a rounded panel, money in blush, footnote under a hairline; 2×2 on phones
4. Performers: numbered list beside one large photo that follows the hovered or focused row, with a caption; settles under the header when scrolling stops near it (wide screens, not with reduced motion); thumbnails in the rows on phones
5. The cause: full maroon sheet with rounded top corners, photo beside
6. Gallery: four staggered plates, masked reveal
7. Founder: a card with portrait, blush quote mark, name and role
8. Partners: white rounded logo tiles in a continuous ticker that does not stop on hover; static grid with reduced motion. The logo files are white squares, so the tile is the white.
9. Closing: black sheet overlapping the cause, "See you in 2027", the main button again

## Signature moves

1. Hero photo fading into the stage (heavy)
2. Masked photo reveals on scroll (medium)
3. Performer list driving one stage photo (medium)
4. Maroon cause sheet breaking the dark page (medium)
5. Logo tile ticker (light)

## Motion

Reveal on scroll (fade and rise, masked for photos), photo crossfade in the
bill, hover lift on cards and tiles, arrow slide on buttons, ticker, scroll
settle on the bill. Everything stops or goes static under
`prefers-reduced-motion`.

## Rolling out to every page

Each page moves to the stage background with the dark header. Cards become
panels (`#22090d`, 20 px corners), photos get 16 px corners and the masked
reveal, and maroon stays for the one main action per view. The ticket flow
and the organiser panel stay light: forms and seat maps read better there.

## Avoided

Purple; all-caps display; equal-weight stat rows; sideways scroll rails;
logos placed straight on the dark page; a stopping ticker; loading screens;
stacked effects beyond the five moves above.

## Performance

Mobile Lighthouse 90+, initial JS under 150 kB gzipped. Photos lazy-loaded
below the hero. No WebGL.
