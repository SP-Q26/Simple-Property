#!/usr/bin/env node
/**
 * Blog SEO bus · manifest → index sections · RSS · sitemap blog URLs · vercel rewrites.
 * Run after adding a post HTML + manifest row: node scripts/build-blog-seo.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const manifestPath = join(web, "data", "blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const site = manifest.site.replace(/\/$/, "");

function blogHtmlPath(slug) {
  return join(web, "blog", `${slug}.html`);
}

const missing = manifest.posts.filter((p) => !existsSync(blogHtmlPath(p.slug)));
if (missing.length) {
  console.error("MISSING HTML for slugs:", missing.map((m) => m.slug).join(", "));
  process.exit(1);
}

const byCat = {};
for (const [key, meta] of Object.entries(manifest.categories)) {
  byCat[key] = { ...meta, posts: [] };
}
for (const post of manifest.posts) {
  if (!byCat[post.category]) throw new Error(`Unknown category ${post.category}`);
  byCat[post.category].posts.push(post);
}
for (const cat of Object.values(byCat)) {
  cat.posts.sort((a, b) => (a.published < b.published ? 1 : -1));
}

const painPosts = manifest.posts
  .filter((p) => p.intent === "pain")
  .sort((a, b) => (a.published < b.published ? 1 : -1));

let painSections = `\n      <section class="guides-hub blog-cluster--pain" aria-labelledby="guides-pain">\n`;
painSections += `        <h2 id="guides-pain">When something goes wrong</h2>\n`;
painSections += `        <p class="muted">Missed clocks, withhold fights, spreadsheet traps · not legal advice.</p>\n`;
painSections += `        <ul class="bullet-tight">\n`;
for (const p of painPosts) {
  painSections += `          <li><a href="/blog/${p.slug}">${p.title}</a></li>\n`;
}
painSections += `        </ul>\n      </section>\n`;

const cityPosts = manifest.posts
  .filter((p) => p.intent === "city" || p.category === "city")
  .sort((a, b) => a.title.localeCompare(b.title));
const chicagoAnchor = manifest.posts.find((p) => p.slug === "chicago-45-day-deposit-deadline");

let citySections = `\n      <section class="guides-hub blog-cluster--city" aria-labelledby="guides-cities">\n`;
citySections += `        <h2 id="guides-cities">Major cities</h2>\n`;
citySections += `        <p class="muted">Chicago RLTO · local fees · app city dropdown on step 1. Not legal advice.</p>\n`;
citySections += `        <ul class="bullet-tight">\n`;
if (chicagoAnchor) {
  citySections += `          <li><a href="/blog/${chicagoAnchor.slug}">${chicagoAnchor.title}</a></li>\n`;
}
for (const p of cityPosts) {
  if (p.slug === "chicago-45-day-deposit-deadline") continue;
  citySections += `          <li><a href="/blog/${p.slug}">${p.title}</a></li>\n`;
}
citySections += `        </ul>\n      </section>\n`;

const stateOrder = manifest.stateOrder || ["IL", "IN", "OH", "MI", "IA", "MO"];
const stateLabels = manifest.stateLabels || {};

function postStates(post) {
  if (Array.isArray(post.states) && post.states.length) return post.states;
  if (/illinois|chicago|rlto/i.test(post.slug)) return ["IL"];
  return stateOrder;
}

function postsForState(code) {
  return manifest.posts
    .filter((p) => postStates(p).includes(code))
    .sort((a, b) => (a.published < b.published ? 1 : -1));
}

let stateSections = `\n      <section class="guides-hub" aria-labelledby="guides-by-state">\n`;
stateSections += `        <h2 id="guides-by-state">Guides by state</h2>\n`;
stateSections += `        <p class="muted">Jump from the bar above or pick a state · not legal advice.</p>\n`;
for (const code of stateOrder) {
  const list = postsForState(code);
  const label = stateLabels[code] || code;
  stateSections += `\n      <section class="blog-cluster blog-cluster--state" id="locale-${code}">\n`;
  stateSections += `        <h3>${label}</h3>\n`;
  stateSections += `        <p class="muted"><a href="/app?state=${code}">Open Deposit Desk for ${label}</a></p>\n`;
  stateSections += `        <ul class="bullet-tight">\n`;
  for (const p of list) {
    stateSections += `          <li><a href="/blog/${p.slug}">${p.title}</a></li>\n`;
  }
  stateSections += `        </ul>\n      </section>\n`;
}
stateSections += `      </section>\n`;

let indexSections = `\n      <section class="guides-hub" aria-labelledby="guides-by-topic">\n`;
indexSections += `        <h2 id="guides-by-topic">Guides by topic</h2>\n`;
for (const [key, cat] of Object.entries(byCat)) {
  if (!cat.posts.length) continue;
  indexSections += `\n      <section class="blog-cluster" id="cluster-${key}">\n`;
  indexSections += `        <h2>${cat.label}</h2>\n        <p class="muted">${cat.audience}</p>\n        <ul class="bullet-tight">\n`;
  for (const p of cat.posts) {
    const watch = p.lawWatch ? ' <span class="badge">Law watch</span>' : "";
    indexSections += `          <li><a href="/blog/${p.slug}">${p.title}</a>${watch}</li>\n`;
  }
  indexSections += "        </ul>\n      </section>\n";
}
indexSections += `      </section>\n`;

const indexPath = join(web, "blog", "index.html");
let indexHtml = readFileSync(indexPath, "utf8");
const start = "<!-- BLOG_MANIFEST_START -->";
const end = "<!-- BLOG_MANIFEST_END -->";
if (!indexHtml.includes(start)) {
  console.error("blog/index.html missing BLOG_MANIFEST markers — add them around generated block");
  process.exit(1);
}
const stateStart = "<!-- BLOG_STATE_START -->";
const stateEnd = "<!-- BLOG_STATE_END -->";
const cityStart = "<!-- BLOG_CITY_START -->";
const cityEnd = "<!-- BLOG_CITY_END -->";
const painStart = "<!-- BLOG_PAIN_START -->";
const painEnd = "<!-- BLOG_PAIN_END -->";
if (!indexHtml.includes(stateStart)) {
  console.error("blog/index.html missing BLOG_STATE markers");
  process.exit(1);
}
if (!indexHtml.includes(painStart)) {
  console.error("blog/index.html missing BLOG_PAIN markers");
  process.exit(1);
}
if (!indexHtml.includes(cityStart)) {
  console.error("blog/index.html missing BLOG_CITY markers");
  process.exit(1);
}
indexHtml = indexHtml.replace(
  new RegExp(`${painStart}[\\s\\S]*${painEnd}`),
  `${painStart}${painSections}      ${painEnd}`
);
indexHtml = indexHtml.replace(
  new RegExp(`${cityStart}[\\s\\S]*${cityEnd}`),
  `${cityStart}${citySections}      ${cityEnd}`
);
indexHtml = indexHtml.replace(
  new RegExp(`${stateStart}[\\s\\S]*${stateEnd}`),
  `${stateStart}${stateSections}      ${stateEnd}`
);
indexHtml = indexHtml.replace(
  new RegExp(`${start}[\\s\\S]*${end}`),
  `${start}${indexSections}      ${end}`
);
indexHtml = indexHtml.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="Major city deposit guides, missed deadlines, tenant disputes, fees, pets, and Midwest state law. Not legal advice.">`
);
indexHtml = indexHtml.replace(
  /<title>[^<]*<\/title>/,
  `<title>Deposit pain guides & state law · Simple Property Tools</title>`
);
indexHtml = indexHtml.replace(
  /<p class="hero-lead">[^<]*<\/p>/,
  `<p class="hero-lead">City guides · missed deadlines · fees and pets · spreadsheet traps · Midwest state law. Not legal advice.</p>`
);
writeFileSync(indexPath, indexHtml);
console.log("updated blog/index.html clusters");

const sorted = [...manifest.posts].sort((a, b) => (a.published < b.published ? 1 : -1));
let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
rss += `<title>Simple Property Tools · Midwest deposit guides</title>\n`;
rss += `<link>${site}/blog</link>\n`;
rss += `<description>State and topic guides for IL, IN, OH, MI, IA, MO landlords and renters. Not legal advice.</description>\n`;
rss += `<language>en-us</language>\n`;
rss += `<atom:link href="${site}/blog/feed.rss" rel="self" type="application/rss+xml"/>\n`;
for (const p of sorted.slice(0, 30)) {
  const link = `${site}/blog/${p.slug}`;
  rss += `<item>\n<title>${escapeXml(p.title)}</title>\n<link>${link}</link>\n<guid isPermaLink="true">${link}</guid>\n`;
  rss += `<pubDate>${rfc822(p.published)}</pubDate>\n<description>${escapeXml(p.description)}</description>\n`;
  rss += `<category>${escapeXml(manifest.categories[p.category].label)}</category>\n`;
  const states = postStates(p).join(",");
  if (states) rss += `<category>${escapeXml(states)}</category>\n`;
  rss += `</item>\n`;
}
rss += `</channel>\n</rss>\n`;
writeFileSync(join(web, "blog", "feed.rss"), rss);
console.log("wrote blog/feed.rss");

const staticUrls = [
  `${site}/`,
  `${site}/pricing`,
  `${site}/app`,
  `${site}/logs`,
  `${site}/blog`,
  `${site}/privacy`,
  `${site}/terms`,
  `${site}/launch-stack`,
];
const blogUrls = manifest.posts.map((p) => `${site}/blog/${p.slug}`);
const allUrls = [...staticUrls, ...blogUrls];
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const loc of allUrls) {
  sm += `  <url><loc>${loc}</loc></url>\n`;
}
sm += `</urlset>\n`;
writeFileSync(join(web, "sitemap.xml"), sm);
console.log("updated sitemap.xml");

const vercelPath = join(web, "vercel.json");
const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const keep = (vercel.rewrites || []).filter((r) => !r.source.startsWith("/blog/") && r.source !== "/blog");
const blogRewrites = [{ source: "/blog", destination: "/blog/index.html" }];
blogRewrites.push({ source: "/blog/feed.rss", destination: "/blog/feed.rss" });
for (const p of manifest.posts) {
  blogRewrites.push({
    source: `/blog/${p.slug}`,
    destination: `/blog/${p.slug}.html`,
  });
}
vercel.rewrites = [...keep, ...blogRewrites];
writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");
console.log("updated vercel.json blog rewrites");

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(isoDate) {
  return new Date(isoDate + "T12:00:00Z").toUTCString();
}
