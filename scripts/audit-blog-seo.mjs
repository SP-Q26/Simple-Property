#!/usr/bin/env node
/**
 * Blog SEO swarm · manifest, RSS, taxonomy, JSON-LD, sitemap, rewrites, pillar coverage.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const MIN = 95;
let fail = 0;

function read(rel) {
  const p = join(web, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

const manifest = JSON.parse(read("data/blog-manifest.json"));
const posts = manifest.posts || [];
const cats = manifest.categories || {};

function check(label, ok, detail = "") {
  if (!ok) {
    fail++;
    console.log(`✗ ${label}${detail ? " · " + detail : ""}`);
  } else {
    console.log(`✓ ${label}`);
  }
}

console.log("── Blog SEO swarm ──\n");

check("blog-manifest.json", posts.length >= 12, `count=${posts.length}`);
check("feed.rss", read("blog/feed.rss").includes("<rss"));
check("feed self link", read("blog/feed.rss").includes("feed.rss"));

for (const p of posts) {
  const htmlPath = `blog/${p.slug}.html`;
  check(`HTML ${p.slug}`, existsSync(join(web, htmlPath)));
}

const htmlFiles = readdirSync(join(web, "blog")).filter((f) => f.endsWith(".html") && f !== "index.html");
const manifestSlugs = new Set(posts.map((p) => p.slug));
for (const f of htmlFiles) {
  const slug = f.replace(".html", "");
  check(`manifest row ${slug}`, manifestSlugs.has(slug));
}

for (const key of Object.keys(cats)) {
  const n = posts.filter((p) => p.category === key).length;
  check(`pillar ${key} ≥ 2 posts`, n >= 2, `count=${n}`);
}

const lawWatch = posts.filter((p) => p.lawWatch).length;
check("law watch / news lane ≥ 2", lawWatch >= 2, `count=${lawWatch}`);

const sm = read("sitemap.xml");
for (const p of posts) {
  check(`sitemap ${p.slug}`, sm.includes(`/blog/${p.slug}`));
}

const vercel = read("vercel.json");
for (const p of posts) {
  check(`vercel rewrite ${p.slug}`, vercel.includes(`"/blog/${p.slug}"`));
}

const index = read("blog/index.html");
check("blog index state locales", index.includes('id="locale-IL"') && index.includes("locale-IN"));
for (const code of ["IL", "IN", "OH", "MI", "IA", "MO"]) {
  const n = posts.filter((p) => (p.states || []).includes(code)).length;
  check(`state ${code} ≥ 1 guide`, n >= 1, `count=${n}`);
}
for (const key of Object.keys(cats)) {
  check(`index cluster ${key}`, index.includes(`id="cluster-${key}"`));
}

let jsonLdOk = 0;
let dupLd = 0;
for (const f of htmlFiles) {
  const h = read(`blog/${f}`);
  const blocks = (h.match(/"@type"\s*:\s*"Article"/g) || []).length;
  if (blocks === 1) jsonLdOk++;
  if (blocks > 1) dupLd++;
  check(`${f} Article JSON-LD`, blocks >= 1);
  check(`${f} canonical`, h.includes('rel="canonical"'));
  check(`${f} disclaimer or not legal`, h.includes("Not legal advice") || h.includes("not legal advice"));
  check(`${f} app CTA`, h.includes('href="/app"'));
}
check("no duplicate JSON-LD blocks", dupLd === 0, `dupes=${dupLd}`);

const robots = read("robots.txt");
check("robots → sitemap", robots.includes("sitemap.xml"));

let score = 100;
if (posts.length < 12) score -= 8;
if (lawWatch < 2) score -= 5;
if (dupLd > 0) score -= 10;
if (!read("blog/feed.rss")) score -= 15;
for (const key of Object.keys(cats)) {
  if (posts.filter((p) => p.category === key).length < 2) score -= 5;
}
score = Math.max(0, score);

console.log(`\nBlog SEO score: ${score}/100`);
if (score < MIN) fail++;
if (fail) {
  console.log(`\n${fail} check(s) failed or score below ${MIN}`);
  process.exit(1);
}
console.log(`\nBlog SEO swarm OK (≥ ${MIN})`);
