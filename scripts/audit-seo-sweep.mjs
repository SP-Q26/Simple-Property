#!/usr/bin/env node
/**
 * Full SEO sweep · meta lengths · social parity · JSON-LD layers · sitemap hygiene.
 * Complements audit-blog-seo and audit-discovery-seo (≥95 to pass).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const MIN = 95;
let score = 100;
const fails = [];

function read(rel) {
  const p = join(web, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

function ding(n, why) {
  score -= n;
  fails.push(why);
  console.log(`✗ −${n} ${why}`);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

console.log("── SEO sweep (all layers) ──\n");

const INDEXABLE_PAGES = [
  "index.html",
  "pricing.html",
  "blog/index.html",
  "launch-stack.html",
  "legal.html",
  "privacy.html",
  "terms.html",
  "feedback.html",
  "legal/deposit-statutes.html",
];

for (const p of INDEXABLE_PAGES) {
  const h = read(p);
  if (!h) {
    ding(8, `missing page ${p}`);
    continue;
  }
  if (!h.includes('rel="canonical"')) ding(4, `${p} no canonical`);
  if (!h.includes("og:title") || !h.includes("twitter:card")) ding(4, `${p} incomplete social`);
  const desc = h.match(/name="description" content="([^"]+)"/)?.[1];
  if (!desc) ding(5, `${p} no meta description`);
  else if (desc.length > 165) ding(3, `${p} description long (${desc.length})`);
  else if (desc.length > 158) ding(1, `${p} description SERP trim (${desc.length}c)`);
  else if (desc.length < 45) ding(2, `${p} description thin (${desc.length})`);
  else ok(`${p} meta (${desc.length}c)`);
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) ding(3, `${p} h1 count ${h1}`);
  else ok(`${p} h1`);
}

const index = read("index.html");
if (index.includes('"@type": "WebSite"') && index.includes("FAQPage")) ok("home @graph WebSite + FAQ");
else ding(6, "home missing WebSite/FAQ graph");

if (index.includes('"logo"') || index.includes("ImageObject")) ok("home publisher logo in schema");
else ding(3, "home Organization missing logo");

const blogPosts = readdirSync(join(web, "blog")).filter((f) => f.endsWith(".html") && f !== "index.html");
let breadcrumbOk = 0;
let dupLdPages = 0;
const titles = new Map();
const descs = new Map();

for (const f of blogPosts) {
  const h = read(`blog/${f}`);
  const title = h.match(/<title>([^<]+)/)?.[1];
  if (title) {
    if (titles.has(title)) ding(2, `duplicate title: ${f}`);
    else titles.set(title, f);
  }
  const desc = h.match(/name="description" content="([^"]+)"/)?.[1];
  if (desc?.length > 165) ding(1, `${f} meta description ${desc.length} chars`);
  if (desc && descs.has(desc)) ding(1, `${f} duplicate description`);
  else if (desc) descs.set(desc, f);

  if (h.includes("BreadcrumbList")) breadcrumbOk++;
  const ldBlocks = (h.match(/<script type="application\/ld\+json">/g) || []).length;
  if (ldBlocks > 1) dupLdPages++;
  if (!h.includes("og:image")) ding(1, `${f} missing og:image`);
}

if (breadcrumbOk === blogPosts.length) ok(`all ${blogPosts.length} posts BreadcrumbList`);
else ding(8, `BreadcrumbList on ${breadcrumbOk}/${blogPosts.length} posts`);

if (dupLdPages === 0) ok("single JSON-LD block per blog post");
else ding(10, `${dupLdPages} posts with duplicate ld+json blocks`);

const app = read("app.html");
const appLd = (app.match(/"@type"\s*:\s*"WebApplication"/g) || []).length;
if (appLd === 1) ok("app single WebApplication JSON-LD");
else ding(6, `app WebApplication blocks: ${appLd} (want 1)`);
if (app.includes("noindex")) ok("app noindex");
else ding(4, "app should be noindex");

const hub = read("blog/index.html");
if (hub.includes("CollectionPage") || hub.includes("ItemList")) ok("blog hub CollectionPage/ItemList");
else ding(5, "blog hub missing hub schema");

const sm = read("sitemap.xml");
if (sm.includes("<lastmod>")) ok("sitemap lastmod");
else ding(4, "sitemap missing lastmod");

if (!sm.includes(">https://simple-property.com/app<") && !sm.includes(">https://simple-property.com/logs<")) {
  ok("sitemap excludes noindex app/logs");
} else ding(5, "sitemap lists noindex URLs");

if ((sm.match(/<loc>[^<]*\/pricing<\/loc>/g) || []).length === 1) ok("sitemap single pricing entry");
else ding(3, "sitemap duplicate or missing pricing");

if (sm.includes("/legal/deposit-statutes")) ok("sitemap statute index");
else ding(4, "sitemap missing /legal/deposit-statutes");

const statutes = read("legal/deposit-statutes.html");
if (statutes.includes("og:title") && statutes.includes("twitter:card")) ok("statute page social meta");
else ding(5, "statute page missing OG/Twitter");

score = Math.max(0, score);
console.log(`\nSEO sweep score: ${score}/100`);
if (score < MIN) {
  console.log(`FAIL: below ${MIN} (${fails.length} issue(s))`);
  process.exit(1);
}
console.log(`PASS: ≥ ${MIN}`);
