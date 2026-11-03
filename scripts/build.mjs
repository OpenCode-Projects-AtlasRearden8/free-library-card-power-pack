import { readFile, writeFile, copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONTENT = path.join(ROOT, "content", "entries.json");
const SITE = path.join(ROOT, "site");
const CSS_SRC = path.join(ROOT, "src", "main.css");
const HOME_URL = "https://dylanasdale.github.io";
const UPDATED = "fetched and verified November 2026";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HEAD = (title, description, rel) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="Asdale Dynamics, LLC">
<link rel="stylesheet" href="${rel}assets/main.css">
</head>
<body>`;

const FOOT = `<footer class="sitefooter">
<div class="wrap">
<p>A public-goods quick guide from the <strong>Free Library Card Power Pack</strong>. More plain-English guides: <a href="${HOME_URL}">dylanasdale.github.io</a></p>
<p class="credit">Copyright (c) 2026 Asdale Dynamics, LLC &middot; MIT licensed.</p>
<p class="credit">Informational only, not legal, tax, or medical advice. Program details change &mdash; confirm with your library.</p>
</div>
</footer>
</body>
</html>`;

const list = (items) =>
  `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

const entrySection = (e) => `<article class="entry" id="${esc(e.id)}">
<span class="badge">${esc(e.topic)}</span>
<h2>${esc(e.title)}</h2>
<p><em>${esc(e.teaser)}</em></p>
<h3>What it is</h3>
${list(e.what)}
<h3>Cost</h3>
${list(e.cost)}
<h3>What you need to sign up</h3>
${list(e.signup)}
<div class="factbox"><p><strong>Good to know:</strong> ${e.goodToKnow.map(esc).join(" ")}</p></div>
<h3>Real examples you can copy</h3>
<ul class="schoollist">${e.examples
    .map((x) => `<li><a class="src-name" href="${esc(x.url)}" rel="noopener">${esc(x.name)}</a> &mdash; ${esc(x.desc)}</li>`)
    .join("\n")}</ul>
<h3>Sources</h3>
<ul class="schoollist">${e.sources
    .map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a><br><span class="src-url">${esc(s.url)}</span></li>`)
    .join("\n")}</ul>
</article>`;

const toc = (entries) =>
  `<nav class="toc" aria-label="Guide contents"><h2>Guide contents</h2><ol>${entries
    .map(
      (e, i) =>
        `<li><a href="cards/${esc(e.id)}.html">${esc(String(i + 1).padStart(2, "0"))}. ${esc(e.topic)} &mdash; ${esc(e.title.replace(/:.*/, ""))}</a></li>`
    )
    .join("\n")}</ol></nav>`;

const masthead = (eyebrow, title, lede, meta) => `<header class="masthead">
<div class="wrap masthead-inner">
<p class="eyebrow">${esc(eyebrow)}</p>
<h1>${esc(title)}</h1>
<p class="lede">${esc(lede)}</p>
<p class="meta">${esc(meta)}</p>
</div>
</header>`;

const data = JSON.parse(await readFile(CONTENT, "utf8"));
const entries = data.entries;

const indexDesc = entries
  .map((e) => e.topic)
  .join(", ");
const title = data.title;
const desc = `${data.subtitle}: ${indexDesc}. What it is, what it costs, what you need to sign up. No affiliate links.`;

const cardList = entries
  .map((e) => {
    const detail = e.what[0].replace(/\s+/g, " ").slice(0, 160);
    return `<li><a class="card" href="cards/${esc(e.id)}.html">
<span class="badge">${esc(e.topic)}</span>
<h3>${esc(e.title.replace(/:.*/, ""))}</h3>
<p class="teaser">${esc(detail).trimEnd()}&hellip;</p>
</a></li>`;
  })
  .join("\n");

const indexHtml = `${HEAD(title, desc, "")}
<a class="skip" href="#main">Skip to content</a>
${masthead(
  "Asdale Dynamics, LLC",
  title,
  data.intro,
  `Updated ${data.updated} · ${entries.length} entries · no ads, no affiliate links`
)}
<main class="wrap" id="main">
<p>Each entry answers the same three questions: <strong>what it is</strong>, <strong>what it costs</strong>, and <strong>what you need to sign up</strong>. Every link goes straight to the organization's own public site &mdash; no affiliate links anywhere (${UPDATED}). Print the <a href="print.html">print-ready handout</a> and leave a copy at your library or community board.</p>
<ul class="cardlist">
${cardList}
</ul>
${toc(entries)}
</main>
${FOOT}`;

await rm(SITE, { recursive: true, force: true });
await mkdir(path.join(SITE, "assets"), { recursive: true });
await mkdir(path.join(SITE, "cards"), { recursive: true });
await copyFile(CSS_SRC, path.join(SITE, "assets", "main.css"));
await writeFile(path.join(SITE, "index.html"), indexHtml + "\n");

for (const [i, e] of entries.entries()) {
  const prev = entries[(i - 1 + entries.length) % entries.length];
  const next = entries[(i + 1) % entries.length];
  const nav = `<nav aria-label="Entry navigation"><a class="backlink" href="../index.html">&larr; All ${entries.length} perks</a> &nbsp;&middot;&nbsp; <a class="backlink" href="${esc(prev.id)}.html">&larr; ${esc(prev.topic)}</a> &nbsp;&middot;&nbsp; <a class="backlink" href="${esc(next.id)}.html">${esc(next.topic)} &rarr;</a></nav>`;
  const html = `${HEAD(`${e.title} — ${title}`, `${e.teaser} What it is, cost, and signup needs, from official public sources.`, "../")}
<a class="skip" href="#main">Skip to content</a>
${masthead(
    `${e.topic} · perk ${i + 1} of ${entries.length}`,
    e.title,
    e.teaser,
    `Free Library Card Power Pack · updated ${data.updated}`
  )}
<main class="wrap" id="main">
${nav}
${entrySection(e)}
${nav}
<p><a class="backlink" href="../print.html">&curren; Print-friendly version of every entry</a></p>
</main>
${FOOT}`;
  await writeFile(path.join(SITE, "cards", `${e.id}.html`), html + "\n");
}

const printEntries = entries
  .map(
    (e, i) => `<section class="entry">
<div class="ph"><span class="badge">${esc(e.topic)}</span><span class="pnum">Perk ${i + 1} of ${entries.length}</span></div>
<h2>${esc(e.title)}</h2>
<p class="pt"><em>${esc(e.teaser)}</em></p>
<h3>What it is</h3>
${list(e.what)}
<h3>Cost</h3>
${list(e.cost)}
<h3>What you need to sign up</h3>
${list(e.signup)}
<div class="factbox"><p><strong>Good to know:</strong> ${e.goodToKnow.map(esc).join(" ")}</p></div>
<h3>Where to go (source pages)</h3>
<ul class="schoollist">${e.examples
      .map((x) => `<li><span class="src-name">${esc(x.name)}</span> &mdash; ${esc(x.desc)}<br><span class="src-url">${esc(x.url)}</span></li>`)
      .join("\n")}</ul>
</section>`
  )
  .join("\n");

const printHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Use Your Whole Library Card — Print-Ready Handout</title>
<meta name="description" content="Print handout: ${entries.length} library card perks, one page each.">
<meta name="author" content="Asdale Dynamics, LLC">
<style>
:root {
  --ink: #1b1e17;
  --ink-soft: #44483e;
  --line: #d9d5c8;
  --green-deep: #1f4d37;
  --gold: #b98a2e;
  --gold-soft: #f5ecd7;
}
* { box-sizing: border-box; }
body { margin: 0; font: 12.5pt/1.55 Georgia, "Times New Roman", serif; color: var(--ink); background: #fff; }
h1, h2, h3 { font-family: "Trebuchet MS", Verdana, sans-serif; line-height: 1.25; margin: 0 0 0.45rem; color: var(--green-deep); }
h3 { font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.09em; color: #2e6e4f; border-bottom: 1.5pt solid var(--gold-soft); padding-bottom: 2px; margin: 12pt 0 5pt; }
h2 { font-size: 15.5pt; margin: 0 0 3pt; }
p { margin: 0 0 7pt; }
ul { margin: 0 0 8pt; padding-left: 1.1rem; }
li { margin-bottom: 3.5pt; }
li::marker { color: var(--gold); }
.wrap { max-width: 7.4in; margin: 0 auto; padding: 10mm; }
.ph { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8pt; }
.badge { font: bold 7.5pt "Trebuchet MS", sans-serif; text-transform: uppercase; letter-spacing: 0.1em; color: var(--green-deep); background: var(--gold-soft); border: 0.5pt solid #dcc896; border-radius: 99px; padding: 1pt 8pt; }
.pnum { font: 8pt "Trebuchet MS", sans-serif; color: var(--ink-soft); }
.pt { font-size: 10pt; color: var(--ink-soft); margin-bottom: 8pt; }
.factbox { background: #faf7ee; border: 0.5pt dashed var(--line); border-radius: 4pt; padding: 5pt 8pt; margin: 6pt 0; }
.factbox p { margin: 0; font-size: 9pt; }
.schoollist { list-style: none; padding-left: 0; margin: 4pt 0 0; }
.schoollist li { border: 0.5pt solid #e4e1d4; border-left: 2.5pt solid #2e6e4f; background: #f7f9f4; border-radius: 3pt; padding: 4pt 7pt; margin-bottom: 4pt; font-size: 9pt; }
.src-name { font-weight: bold; }
.src-url { color: var(--green-deep); font-family: "Trebuchet MS", sans-serif; font-size: 7.8pt; }
.cover { border-bottom: 4pt solid var(--gold); padding-bottom: 10pt; margin-bottom: 4pt; }
.cover h1 { font-size: 21pt; margin-bottom: 4pt; }
.eyebrow { font: 8pt "Trebuchet MS", sans-serif; text-transform: uppercase; letter-spacing: 0.16em; color: var(--gold); margin-bottom: 4pt; }
@page { size: letter; margin: 0.55in; }
@media print {
  body { font-size: 11pt; }
  .wrap { padding: 0; }
  a { color: inherit; text-decoration: none; }
  .entry { page-break-after: always; }
  .entry:last-child { page-break-after: auto; }
  .factbox, .schoollist li { background: #fff; }
}
</style>
</head>
<body>
<div class="wrap">
<div class="cover">
<p class="eyebrow">Free Library Card Power Pack &middot; Asdale Dynamics, LLC &middot; Updated ${esc(data.updated)}</p>
<h1>Use Your Whole Library Card &mdash; the ${entries.length}-Perk Power Pack</h1>
<p>${esc(data.subtitle)}. Hand this to a friend who thinks the library is "just books." Each perk below covers <strong>what it is</strong>, <strong>what it costs</strong>, and <strong>what you need to sign up</strong> (${UPDATED}). No affiliate links, no ads &mdash; just the freebies.</p>
</div>
${printEntries}
<div class="entry">
<p class="pnum">Copyright (c) 2026 Asdale Dynamics, LLC &middot; MIT license &middot; <span class="src-url">${HOME_URL}</span> &middot; Informational only, not legal, tax, or medical advice &mdash; confirm details with your own library, since programs vary by system.</p>
</div>
</div>
</body>
</html>
`;

await writeFile(path.join(SITE, "print.html"), printHtml);

console.log(
  `Built ${1 + entries.length + 1} pages into site/ (index, ${entries.length} entry pages, print handout).`
);
