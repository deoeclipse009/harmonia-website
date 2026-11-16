Stage: preview
Next: run the audit + Lighthouse; Deo sets up Turso + Vercel env vars so tickets work

# Harmonia

- Working copy: ~/Developer/harmonia. The Desktop copy sits in iCloud and loses files; do not work there.
- Live: https://harmoniafest.vercel.app (Vercel project `harmoniafest`, account jorgeamadeo). Since 2026-11-16 production runs branch `ticketing-prototype` (commit dab98b6), deployed through the Vercel connector from GitHub. `main` was fast-forwarded to match (c5dcfbd). Pushing does not deploy. On this Windows machine `npx vercel login` fails with 'fetch failed'; deploy via the Vercel connector instead.
- Branches: `main` is live. `retrofit-tailoring` holds the site-wide tailoring pass. `ticketing-prototype` holds the Blend redesign and the unlisted ticket page at /tiket-2027-pratinjau; Jorge approved it going live on production.
- Decisions: buttons 12px, cards 16/20px, header solid, Archivo + Figtree only, no labels above headings, package row Custom / Commerce.
- Ticketing needs from Deo: real hall seat plan, real prices, then backend or payment gateway.
- Read docs/audit-report.md for every check and what is open.
- Ticketing: real backend built and tested locally on branch `ticketing-prototype`. Not deployed. Read docs/ticketing.md first.
- Local panel login: user `admin`, password in `.env.local` (ADMIN_PASSWORD).
- Local dev server for this copy: launch config `harmonia-developer`, port 5180. Phone/camera testing: `harmonia-phone`, https on port 5443.
- graphify is on: hooks in .claude/settings.json and .githooks; run `graphify update .` after code changes.
