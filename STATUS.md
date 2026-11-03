# STATUS — Free Library Card Power Pack

Built: November 3, 2026 · By Asdale Dynamics, LLC · MIT licensed

## What was built

A researched, print-ready guide that gets people using their **whole library card** —
9 perks, every entry structured the same way: **what it is**, **what it costs**,
**what you need to sign up**, a "good to know" tip, real example libraries with links
to their own public pages, and a sources list. All sources are official public pages,
fetched/verified in November 2026, with **no affiliate links** anywhere (enforced by tests).

**The 9 entries:**

1. Interlibrary loan (borrow from libraries nationwide)
2. Libby app (e-books/audiobooks, and sending borrowed books to Kindle)
3. hoopla app (instant movies, music, comics, audiobooks)
4. Museum & park passes (library museum-pass programs, Colorado's Check Out
   Colorado State Parks backpack program, Museums for All for EBT cardholders)
5. Tool & sewing lending (tool lending libraries and Library of Things)
6. Free tax help (IRS VITA, TCE, AARP Tax-Aide)
7. Resume classes & career help (free workshops and coach platforms via your card)
8. Book-a-Librarian (free one-on-one appointments; several Indiana examples)
9. Seed libraries (free seeds; Richmond Grows library finder)

**Deliverables:**

- `content/entries.json` — single source of truth for all guide content
- `site/index.html` — hub page with a card for each perk
- `site/cards/<id>.html` — one full page per perk (9 pages)
- `site/print.html` — self-contained print-ready handout: letter-size pages,
  one perk per page with page breaks, print-optimized grayscale-friendly styles
- `site/assets/main.css` — warm, clean, accessible styling
- `scripts/build.mjs`, `scripts/serve.mjs`, `scripts/test.mjs` — zero-dependency
  build/serve tests (Node ≥ 18, no packages to install)
- `scripts/verified-sources.txt` — the tested-URL allowlist with verification dates
- `LICENSE` (MIT, Copyright (c) 2026 Asdale Dynamics, LLC), `README.md` with the LLC credit

## How to run it

Node 18+ (tested on Node 20.19.2), no dependencies:

```bash
npm run build   # generate site/ (11 pages: index + 9 entries + print handout)
npm test        # 11-test suite
npm run serve   # serve site/ at http://localhost:8080 (PORT env var to change)
```

No server needed to view the content — the built pages are plain static HTML/CSS;
you can open `site/index.html` or e-mail `site/print.html` to someone.

## Verification results

- `npm run build` — OK. "Built 11 pages into site/ (index, 9 entry pages, print handout)."
- `npm test` — OK. **11/11 tests pass, 0 failures.** Tests cover:
  - every entry has non-empty `what` / `cost` / `signup` (and other key fields)
  - all nine requested topics present (ILL, Libby, hoopla, Kindle, museum, park,
    tool, sewing, tax, resume, book-a-librarian, seed)
  - no affiliate-looking links (tag/amzn.to/shareasale/shortener patterns etc.)
  - every cited URL is on `scripts/verified-sources.txt` (i.e., actually tested)
  - no secrets/key patterns in content or scripts
  - built site is well-formed static HTML (no `undefined`, no `<script>`)
  - print handout uses `@page letter`, `page-break-after: always`, `@media print`
  - exact LICENSE copyright line + README/site credit for Asdale Dynamics, LLC
- `npm run serve` smoke test — OK (PORT=8123): all pages returned HTTP 200
  (/, /print.html, /cards/libby.html, /cards/passes.html, /cards/seeds.html,
  /assets/main.css) and unknown routes return 404.
- Source verification: 29 public URLs verified live (direct page fetches) or via
  the official page's own content; details logged in `scripts/verified-sources.txt`.
  `seedlibraries.org` (the community organization) returned a 500 two days running,
  so it is NOT cited; the seed-library entry cites Richmond Grows instead. A
  `worldcat.org` link was dropped for the same reason; ILL cites ALA pages instead.
- Non-deterministic environments: if internet were unavailable at test time the
  allowlist test still passes (it checks recorded URLs, not live connections).

## Known gaps

- **Programs vary locally.** Museum passes, Library of Things catalogs, and
  Book-a-Librarian availability differ by library system; the guide teaches the
  pattern and points to real examples, plus tells readers to look up their own
  library. hoopla borrow limits (and VITA's yearly income guideline) change
  annually — the guide points to the official pages for the current numbers.
- **Coverage is US-focused** (that's what the user-facing sources are); a few
  seed-library resources are international.
- **No screenshots** were included to keep the pack text-only, light, and easy to
  reprint in black and white.
- `seedlibraries.org` was down (500) during verification — revisit when it's back
  if you want to add it as a source.
- Optional futures: per-state park-pass page list, a Spanish translation of the
  print handout, and an 11x17 poster cut-down of the print page.
