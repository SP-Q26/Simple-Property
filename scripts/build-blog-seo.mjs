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

let indexSections = "";
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

const indexPath = join(web, "blog", "index.html");
let indexHtml = readFileSync(indexPath, "utf8");
const start = "<!-- BLOG_MANIFEST_START -->";
const end = "<!-- BLOG_MANIFEST_END -->";
if (!indexHtml.includes(start)) {
  console.error("blog/index.html missing BLOG_MANIFEST markers — add them around generated block");
  process.exit(1);
}
indexHtml = indexHtml.replace(
  new RegExp(`${start}[\\s\\S]*${end}`),
  `${start}${indexSections}      ${end}`
);
indexHtml = indexHtml.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="Illinois rental guides: law, landlords, renters, news watch — 765 ILCS 715/, Chicago RLTO. Not legal advice.">`
);
writeFileSync(indexPath, indexHtml);
console.log("updated blog/index.html clusters");

const sorted = [...manifest.posts].sort((a, b) => (a.published < b.published ? 1 : -1));
let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
rss += `<title>Simple Property Tools · Illinois rental guides</title>\n`;
rss += `<link>${site}/blog</link>\n`;
rss += `<description>Law, landlord ops, renter facts, and IL rental news watch. Not legal advice.</description>\n`;
rss += `<language>en-us</language>\n`;
rss += `<atom:link href="${site}/blog/feed.rss" rel="self" type="application/rss+xml"/>\n`;
for (const p of sorted.slice(0, 30)) {
  const link = `${site}/blog/${p.slug}`;
  rss += `<item>\n<title>${escapeXml(p.title)}</title>\n<link>${link}</link>\n<guid isPermaLink="true">${link}</guid>\n`;
  rss += `<pubDate>${rfc822(p.published)}</pubDate>\n<description>${escapeXml(p.description)}</description>\n`;
  rss += `<category>${escapeXml(manifest.categories[p.category].label)}</category>\n</item>\n`;
}
rss += `</channel>\n</rss>\n`;
writeFileSync(join(web, "blog", "feed.rss"), rss);
console.log("wrote blog/feed.rss");

const staticUrls = [
  `${site}/`,
  `${site}/pricing`,
  `${site}/app`,
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
