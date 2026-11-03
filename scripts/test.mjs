import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFile(path.join(ROOT, p), "utf8");

const AFFILIATE_PATTERNS = [
  /[\?&]tag=[^&\s"']{2,}/i,
  /amzn\.to\//i,
  /rstyle\.me\//i,
  /shareasale\.com/i,
  /clickbank\.net/i,
  /sjv\.io\//i,
  /go\.redirectingat\.com/i,
  / [\?&](ref|affid|affiliate|partner)= /i,
  /impact\.com\/.*(click|aff)/i,
  /awin1\.com/i,
  /commission-junction|cj\.com\/click/i,
  /bit\.ly\//i,
  /tinyurl\.com\//i,
];

const SECRET_PATTERNS = [
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bapi[_-]?key['"\s:=]+[A-Za-z0-9_\-]{16,}\b/i,
];

const REQUIRED_FIELDS = ["id", "topic", "title", "teaser", "what", "cost", "signup", "goodToKnow", "sources"];
const TOPIC_WORDS = /\b(interlibrary loan|libby|hoopla|kindle|museum|park|tool|sewing|tax|resume|book.a.librarian|seed)\b/i;

const EXPECTED_PAGES = [
  "site/index.html",
  "site/print.html",
  "site/assets/main.css",
  "site/cards/ill.html",
  "site/cards/libby.html",
  "site/cards/hoopla.html",
  "site/cards/passes.html",
  "site/cards/tools.html",
  "site/cards/tax.html",
  "site/cards/resume.html",
  "site/cards/bookalibrarian.html",
  "site/cards/seeds.html",
];

function collectUrls(node, out = []) {
  if (typeof node === "string") {
    for (const m of node.matchAll(/https?:\/\/[^\s"'<>)]+/g)) out.push(m[0]);
    return out;
  }
  if (Array.isArray(node)) {
    for (const v of node) collectUrls(v, out);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectUrls(v, out);
  }
  return out;
}

test("content is complete: every entry has what/cost/signup and required fields", async () => {
  const data = JSON.parse(await read("content/entries.json"));
  assert.ok(Array.isArray(data.entries) && data.entries.length >= 9);
  for (const e of data.entries) {
    for (const f of REQUIRED_FIELDS) {
      const v = e[f];
      assert.ok(v !== undefined && v !== null && v !== "", `entry ${e.id} missing field ${f}`);
      if (Array.isArray(v)) assert.ok(v.length > 0, `entry ${e.id} field ${f} is empty`);
    }
    assert.ok(e.what.every((s) => typeof s === "string" && s.length > 20));
    assert.ok(e.cost.some((s) => /free|\$|fee|limit|included|refundable|responsible/i.test(s)), `entry ${e.id} cost should mention cost`);
    assert.ok(e.signup.length >= 2);
    for (const s of e.sources) {
      assert.match(s.url, /^https:\/\//);
      assert.ok(s.label.length > 8);
    }
  }
});

test("content covers all nine required topics", async () => {
  const data = JSON.parse(await read("content/entries.json"));
  const blob = JSON.stringify(data);
  const required = [
    "Interlibrary loan",
    "Libby",
    "hoopla",
    "Kindle",
    "museum",
    "park",
    "tool",
    "Sewing machine",
    "VITA",
    "Tax-Aide",
    "resume",
    "Book-a-Librarian",
    "seed lending library",
  ];
  for (const topic of required) {
    assert.ok(blob.includes(topic), `missing topic: ${topic}`);
  }
});

test("no affiliate links anywhere in the content", async () => {
  const data = JSON.parse(await read("content/entries.json"));
  const urls = collectUrls(data);
  assert.ok(urls.length >= 20, "expected a healthy number of source URLs");
  for (const url of urls) {
    assert.match(url, /^https:\/\//i, `non-https URL: ${url}`);
    for (const pat of AFFILIATE_PATTERNS) {
      const re = new RegExp(pat.source.replace(/ /g, ""), "i");
      assert.ok(!re.test(url), `affiliate-looking URL detected: ${url}`);
    }
  }
});

test("all URLs are from the verified/tested allowlist", async () => {
  let tested = await read("scripts/verified-sources.txt");
  tested = new Set(
    tested
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !l.startsWith("#"))
      .map((l) => l.split(/\s+/)[0])
  );
  const data = JSON.parse(await read("content/entries.json"));
  const urls = collectUrls(data);
  for (const url of urls) {
    assert.ok(
      tested.has(url),
      `URL not on the tested-allowlist (fetch it first, add it with its verification date): ${url}`
    );
  }
});

test("every entry cites only HTTPS official public pages (no shortened/dead domains)", async () => {
  const data = JSON.parse(await read("content/entries.json"));
  const bannedHostFragments = ["t.co", "lnkd.in", "ow.ly", "goo.gl", "data.pe", "git.io"];
  const urls = collectUrls(data);
  for (const url of urls) {
    const lower = url.toLowerCase();
    for (const frag of bannedHostFragments) {
      assert.ok(!lower.includes(`//${frag}`) && !lower.includes(`.${frag}/`), `shortener/banned domain: ${url}`);
    }
  }
});

test("no secrets, keys, or personal data in repository files", async () => {
  const files = ["content/entries.json", "README.md", "LICENSE", "scripts/build.mjs", "scripts/serve.mjs", "scripts/test.mjs", "package.json"];
  for (const f of files) {
    const text = await read(f);
    for (const pat of SECRET_PATTERNS) {
      assert.ok(!pat.test(text), `possible secret pattern in ${f}`);
    }
  }
  const data = JSON.parse(await read("content/entries.json"));
  const blob = JSON.stringify(data);
  for (const pat of SECRET_PATTERNS) {
    assert.ok(!pat.test(blob), "possible secret pattern in content");
  }
});

test("build output exists and is well-formed", async () => {
  for (const f of EXPECTED_PAGES) {
    const html = await read(f);
    assert.ok(html.startsWith("<!doctype html") || f.endsWith("main.css"), `${f} missing doctype`);
    if (f.endsWith(".html")) {
      assert.ok(html.includes("</html>"), `${f} not closed`);
      assert.ok(!html.includes("undefined"), `${f} contains 'undefined'`);
      assert.ok(!html.includes("[object"), `${f} contains '[object'`);
      assert.ok(!html.includes("<script"), `${f} should be script-free static HTML`);
    }
  }
});

test("built pages contain the three-question structure for each entry", async () => {
  const print = await read("site/print.html");
  for (const phrase of ["What it is", "Cost", "What you need to sign up"]) {
    const count = print.split(phrase).length - 1;
    assert.ok(count >= 9, `print.html should mention '${phrase}' at least 9 times, got ${count}`);
  }
  const data = JSON.parse(await read("content/entries.json"));
  const cards = await readdir(path.join(ROOT, "site", "cards"));
  assert.equal(cards.filter((c) => c.endsWith(".html")).length, data.entries.length);
  for (const e of data.entries) {
    const html = await read(`site/cards/${e.id}.html`);
    assert.ok(html.includes("What you need to sign up"));
    const unescaped = html
      .replaceAll("&#39;", "'")
      .replaceAll("&quot;", '"')
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&");
    assert.ok(unescaped.includes(e.teaser), `cards/${e.id}.html should contain its teaser`);
    for (const s of e.sources) assert.ok(html.includes(s.url));
  }
});

test("print handout is genuinely print-ready", async () => {
  const print = await read("site/print.html");
  assert.match(print, /@page\s*\{[^}]*size:\s*letter/i);
  assert.match(print, /page-break-after:\s*always/);
  assert.match(print, /media print/);
  assert.ok(!print.includes("<script"));
});

test("LICENSE, README credit, and copyright line are exact", async () => {
  const license = await read("LICENSE");
  assert.match(license, /^MIT License\n/);
  assert.match(license, /Copyright \(c\) 2026 Asdale Dynamics, LLC/);
  const readme = await read("README.md");
  assert.match(readme, /Asdale Dynamics, LLC/);
  assert.match(readme, /Copyright \(c\) 2026 Asdale Dynamics, LLC/);
  const built = await read("site/index.html");
  assert.match(built, /Asdale Dynamics, LLC/);
});

test("index links resolve to real files (no broken relative hrefs)", async () => {
  const index = await read("site/index.html");
  const data = JSON.parse(await read("content/entries.json"));
  for (const e of data.entries) {
    assert.ok(index.includes(`cards/${e.id}.html`), `index missing link to cards/${e.id}.html`);
  }
  const print = await read("site/print.html");
  assert.ok(print.includes("dylanasdale.github.io"));
});
