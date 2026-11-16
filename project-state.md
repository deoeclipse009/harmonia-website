Stage: build-1
Next: Gate 2 for phase 1 (home page in Blend). On OK: commit, then phase 2 rolls the dark look out to About, Edition, Lineup, Gallery, Merch, Contact, 404 (tickets and panel stay light)

# Harmonia

- Working copy: ~/Developer/harmonia. The Desktop copy sits in iCloud and loses files; do not work there.
- Live: https://harmoniafest.vercel.app (Vercel project `harmoniafest`, account jorgeamadeo). Pushing does not deploy; run `npx vercel --prod`.
- Branches: `main` is live. `retrofit-tailoring` holds the site-wide tailoring pass. `ticketing-prototype` holds the hidden ticket page at /tiket-2027-pratinjau and must only go to protected preview deploys.
- Decisions: buttons 12px, cards 16/20px, header solid, Archivo + Figtree only, no labels above headings, package row Custom / Commerce.
- Ticketing needs from Deo: real hall seat plan, real prices, then backend or payment gateway.
- Read docs/audit-report.md for every check and what is open.
- Ticketing: real backend built and tested locally on branch `ticketing-prototype`. Not deployed. Read docs/ticketing.md first.
- Local panel login: user `admin`, password in `.env.local` (ADMIN_PASSWORD).
- Local dev server for this copy: launch config `harmonia-developer`, port 5180. Phone/camera testing: `harmonia-phone`, https on port 5443.
- graphify is on: hooks in .claude/settings.json and .githooks; run `graphify update .` after code changes.
