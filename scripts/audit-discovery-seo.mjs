#!/usr/bin/env node
/**
 * Lane · branding · search · agent discovery audit (≥95 to pass).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const MIN = 95;
let score = 100;

function read(rel) {
  const p = join(web, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

function ding(n, why) {
  score -= n;
  console.log(`✗ −${n} ${why}`);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

console.log("── Discovery · lane · SEO audit ──\n");

const index = read("index.html");
const llms = read("llms.txt");
const bus = read("spt-ai-bus.json");
const discovery = read(".well-known/ai-discovery.json");
const manifest = JSON.parse(read("data/blog-manifest.json") || "{}");

const painTerms = [
  "30",
  "45",
  "765 ILCS",
  "RLTO",
  "surrender",
  "itemiz",
  "deposit",
  "spreadsheet",
  "disput",
  "missed",
];
for (const t of painTerms) {
  if (!index.toLowerCase().includes(t.toLowerCase()) && !index.includes(t)) {
    ding(3, `home missing pain keyword: ${t}`);
  } else ok(`home · ${t}`);
}

if (!index.includes("application/ld+json")) ding(8, "home missing JSON-LD");
else ok("home JSON-LD");

if (!index.includes("FAQPage")) ding(5, "home FAQ schema");
else ok("home FAQ schema");

if (!llms.includes("blog/feed.rss")) ding(6, "llms.txt missing RSS");
else ok("llms RSS");

if (!llms.includes("765 ILCS")) ding(5, "llms missing statute");
else ok("llms statute");

if (!bus.includes("blog_feed")) ding(5, "ai-bus missing blog_feed");
else ok("ai-bus blog_feed");

if (!discovery.includes("/blog")) ding(8, "ai-discovery missing blog in read_order");
else ok("ai-discovery blog");

const discoveryObj = JSON.parse(discovery || "{}");
if (!discoveryObj.endpoints?.blog_feed) ding(5, "ai-discovery endpoints.blog_feed");
else ok("ai-discovery blog_feed endpoint");

if (!index.includes("/blog")) ding(4, "home missing guides link");
else ok("home → guides");

if (!index.includes("feed.rss") && !read("blog/index.html").includes("feed.rss")) {
  ding(4, "no RSS surfaced on home or blog hub");
} else ok("RSS surfaced");

if (!read("brand/shell-header.html").includes("Guides")) ding(3, "shell header missing Guides nav");
else ok("shell Guides nav");

const brandPhrase = "Keep the clock";
const pages = ["index.html", "pricing.html", "app.html", "blog/index.html"];
for (const p of pages) {
  const h = read(p);
  if (!h.includes(brandPhrase)) ding(2, `${p} missing brand phrase`);
}

if (manifest.posts?.length >= 12) ok("manifest ≥12 posts");
else ding(6, "manifest thin for discovery");

const pillars = ["law", "landlord", "renter", "news", "pain"];
for (const p of pillars) {
  const n = (manifest.posts || []).filter((x) => x.category === p).length;
  if (n < 2) ding(4, `pillar ${p} thin (${n})`);
  else ok(`pillar ${p}`);
}

if (!index.includes("product-proof")) ding(5, "home missing product proof");
else ok("home product proof");

if (!index.includes('href="/app"')) ding(10, "home missing app CTA");
else ok("home app CTA");

score = Math.max(0, score);
console.log(`\nDiscovery SEO score: ${score}/100`);
if (score < MIN) {
  console.log(`FAIL: below ${MIN}`);
  process.exit(1);
}
console.log(`PASS: ≥ ${MIN}`);
