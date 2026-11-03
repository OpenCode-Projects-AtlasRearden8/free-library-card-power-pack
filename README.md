# Free Library Card Power Pack

**A freebie guide: use your whole library card.** Nine of the biggest perks a public
library card already pays for, written in plain English — what it is, what it costs,
and what you need to sign up. Everything is verified against official public sources
(verified November 2026), with zero affiliate links.

Published by **Asdale Dynamics, LLC** — beginner-friendly guides from
[Dylan Asdale](https://dylanasdale.github.io) (author of *The Massive AI Manual*).

## What's inside

| # | Perk | In one line |
|---|------|-------------|
| 1 | Interlibrary loan | Your library didn't buy it? They can get it from another library, usually free. |
| 2 | Libby | Free e-books and audiobooks; send Kindle books straight to your Kindle. |
| 3 | hoopla | Instant movies, music, comics, audiobooks — no waitlists. |
| 4 | Museum & park passes | Free museum passes at many libraries; week-long state park passes in Colorado (and check out "Museums for All" for EBT cardholders). |
| 5 | Tool & sewing lending | Borrow drills, rakes, telescopes, and sewing machines — Library of Things and tool libraries. |
| 6 | Free tax help | IRS VITA, TCE, and AARP Tax-Aide: IRS-certified volunteers file simple returns for free. |
| 7 | Resume classes | Free resume workshops, career coaching, and premium job-help platforms via your card. |
| 8 | Book-a-Librarian | A free 30–60 minute one-on-one appointment with a librarian. |
| 9 | Seed libraries | Free vegetable and flower seeds; save and return the next generation. |

Every entry answers the same three questions: **what it is**, **what it costs**, and
**what you need to sign up** — then shows real example libraries with links to their
own public pages (full source list on each entry page).

## Get it / run it

No dependencies, no build tools to install. Requires Node.js 18+.

```bash
npm run build     # builds the site into ./site (index, 9 entry pages, print-ready page)
npm test          # runs the test suite (content, output, license, no-affiliate checks)
npm run serve     # serves ./site at http://localhost:8080
```

Alternatively, just open `site/index.html` in any browser — it is a plain static
site, no JavaScript frameworks, no tracking.

## Print-ready

`site/print.html` is a print-optimized one-file booklet of all nine entries:
letter-size pages, page breaks between entries, no headers/footers junk, and
grayscale-friendly styling. Print it from your browser (Ctrl/Cmd+P) and hand it
out, pin it to a corkboard, or leave a stack at your library.

## Structure

```
content/entries.json   # all guide data (single source of truth)
scripts/build.mjs      # zero-dependency site generator -> ./site
scripts/serve.mjs      # tiny static file server for npm run serve
scripts/test.mjs       # test suite (node:test, zero dependencies)
site/                  # generated output — safe to open directly, or rebuild
```

## Sources & integrity

- Every factual claim traces to an **official public source** (IRS.gov, museums4all.org,
  hoopladigital.com, libbyapp.com, state library pages, individual library pages), all
  fetched and verified in **November 2026**.
- **No affiliate links anywhere.** The test suite enforces a blocklist of affiliate-tag
  and redirect-link patterns on every URL in the content and the built site.
- No secrets, API keys, or personal data are stored in this repository, by design —
  the test suite also checks for common token patterns.

## License

MIT — see [LICENSE](LICENSE).
Copyright (c) 2026 Asdale Dynamics, LLC.

## About Asdale Dynamics, LLC

Asdale Dynamics, LLC (Indiana) publishes beginner-friendly AI guides, books, and
practical tools, including *The Massive AI Manual* by Dylan Asdale, a registered nurse
turned AI author who explains AI "like a friend would": plain English, step by step,
never condescending. Free resources: [dylanasdale.github.io](https://dylanasdale.github.io).
