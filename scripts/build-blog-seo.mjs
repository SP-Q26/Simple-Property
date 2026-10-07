#!/usr/bin/env node
/**
 * Blog SEO bus · manifest → index sections · RSS · sitemap blog URLs · vercel rewrites.
 * Run after adding a post HTML + manifest row: node scripts/build-blog-seo.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";
import { STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";
import { COVERAGE_LABEL, OG_IMAGE_ALT } from "./lib/social-share.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const manifestPath = join(web, "data", "blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const site = manifest.site.replace(/\/$/, "");
/** Marketing pages last content refresh · bump on sitewide copy/SEO sweeps. */
const SITE_LASTMOD = "2026-10-07";

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
  .sort((a, b) => {
    const aPrimary = Object.values(manifest.primaryPainByState || {}).includes(a.slug);
    const bPrimary = Object.values(manifest.primaryPainByState || {}).includes(b.slug);
    if (aPrimary && !bPrimary) return -1;
    if (!aPrimary && bPrimary) return 1;
    if (a.slug === "missed-deposit-deadline-small-landlord-multi-state") return 1;
    if (b.slug === "missed-deposit-deadline-small-landlord-multi-state") return -1;
    return a.title.localeCompare(b.title);
  });

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
citySections += `        <p class="muted">Chicago HQ · RLTO and major-city dropdown on wizard step 1. Not legal advice.</p>\n`;
citySections += `        <ul class="bullet-tight">\n`;
if (chicagoAnchor) {
  citySections += `          <li><a href="/blog/${chicagoAnchor.slug}">${chicagoAnchor.title}</a></li>\n`;
}
for (const p of cityPosts) {
  if (p.slug === "chicago-45-day-deposit-deadline") continue;
  citySections += `          <li><a href="/blog/${p.slug}">${p.title}</a></li>\n`;
}
citySections += `        </ul>\n      </section>\n`;

const metroSeries = [
  { id: "chicago-metro-oct-2026", label: "Chicago neighborhoods · RLTO" },
  { id: "dc-metro-oct-2026", label: "DC neighborhoods · RHCA" },
  { id: "miami-metro-oct-2026", label: "Miami · Florida § 83.49" },
];
let metroSections = `\n      <section class="guides-hub blog-cluster blog-cluster--metro" id="cluster-metro" aria-labelledby="guides-metro">\n`;
metroSections += `        <h2 id="guides-metro">Metro deep dives</h2>\n`;
metroSections += `        <p class="muted">Hyper-focused neighborhood guides · Chicago, DC, Miami · not legal advice.</p>\n`;
for (const { id, label } of metroSeries) {
  const list = manifest.posts.filter((p) => p.series === id).sort((a, b) => a.title.localeCompare(b.title));
  if (!list.length) continue;
  metroSections += `        <h3 class="section-label">${label}</h3>\n        <ul class="bullet-tight">\n`;
  for (const p of list) {
    metroSections += `          <li><a href="/blog/${p.slug}">${p.title}</a></li>\n`;
  }
  metroSections += `        </ul>\n`;
}
metroSections += `      </section>\n`;

const stateOrder = manifest.stateOrder?.length ? manifest.stateOrder : SUPPORTED_STATES;
const stateLabels = manifest.stateLabels || {};

function postStates(post) {
  if (Array.isArray(post.states) && post.states.length) return post.states;
  if (/illinois|chicago|rlto/i.test(post.slug)) return ["IL"];
  return stateOrder;
}

function postsForState(code) {
  const primary = manifest.primaryPainByState?.[code];
  return manifest.posts
    .filter((p) => postStates(p).includes(code))
    .sort((a, b) => {
      if (a.slug === primary) return -1;
      if (b.slug === primary) return 1;
      return a.published < b.published ? 1 : -1;
    });
}

let stateSections = `\n      <section class="guides-hub" aria-labelledby="guides-by-state">\n`;
stateSections += `        <h2 id="guides-by-state">Guides by state</h2>\n`;
  stateSections += `        <p class="muted">Jump from the color bar under the header or scroll · not legal advice.</p>\n`;
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
const metroStart = "<!-- BLOG_METRO_START -->";
const metroEnd = "<!-- BLOG_METRO_END -->";
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
if (!indexHtml.includes(metroStart)) {
  console.error("blog/index.html missing BLOG_METRO markers");
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
  new RegExp(`${metroStart}[\\s\\S]*${metroEnd}`),
  `${metroStart}${metroSections}      ${metroEnd}`
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
  /<p class="launch-live">[^<]*<\/p>/,
  `<p class="launch-live">Live · deposit guides in ${STATE_ONLY_COUNT} states + DC · founded in Chicago</p>`
);
indexHtml = indexHtml.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="State and city deposit guides, missed deadlines, tenant disputes, and itemization. ${STATE_ONLY_COUNT} states + DC. Not legal advice.">`
);
indexHtml = indexHtml.replace(
  /<title>[^<]*<\/title>/,
  `<title>Deposit pain guides & state law · Simple Property Tools</title>`
);
indexHtml = indexHtml.replace(
  /<p class="hero-lead">[^<]*<\/p>/,
  `<p class="hero-lead">City guides · missed deadlines · fees and pets · spreadsheet traps · state law by wizard pack. Not legal advice.</p>`
);
indexHtml = indexHtml.replace(
  /<meta property="og:title" content="[^"]*">/,
  `<meta property="og:title" content="Deposit guides · ${COVERAGE_LABEL}">`
);
indexHtml = indexHtml.replace(
  /<meta name="twitter:title" content="[^"]*">/,
  `<meta name="twitter:title" content="Deposit guides · ${COVERAGE_LABEL}">`
);
indexHtml = indexHtml.replace(
  /<meta property="og:image:alt" content="[^"]*">/,
  `<meta property="og:image:alt" content="${OG_IMAGE_ALT}">`
);
indexHtml = indexHtml.replace(
  /<meta name="twitter:image:alt" content="[^"]*">/,
  `<meta name="twitter:image:alt" content="${OG_IMAGE_ALT}">`
);
writeFileSync(indexPath, indexHtml);
console.log("updated blog/index.html clusters");

const hubLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: `Deposit guides · ${COVERAGE_LABEL}`,
      url: `${site}/blog`,
      description: "State and city deposit guides for small landlords · not legal advice.",
      isPartOf: { "@type": "WebSite", name: "Simple Property Tools", url: site },
    },
    {
      "@type": "ItemList",
      numberOfItems: Math.min(24, manifest.posts.length),
      itemListElement: [...manifest.posts]
        .sort((a, b) => (a.published < b.published ? 1 : -1))
        .slice(0, 24)
        .map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${site}/blog/${p.slug}`,
          name: p.title,
        })),
    },
  ],
};
let hubHtml = readFileSync(indexPath, "utf8");
hubHtml = hubHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
hubHtml = hubHtml.replace(
  "</head>",
  `  <script type="application/ld+json">${JSON.stringify(hubLd)}</script>\n</head>`
);
writeFileSync(indexPath, hubHtml);
console.log("blog hub JSON-LD (CollectionPage + ItemList)");

const sorted = [...manifest.posts].sort((a, b) => (a.published < b.published ? 1 : -1));
let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
rss += `<title>Simple Property Tools · deposit guides</title>\n`;
rss += `<link>${site}/blog</link>\n`;
rss += `<description>Deposit guides for ${COVERAGE_LABEL} · small landlords · not legal advice.</description>\n`;
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

const staticEntries = [
  { loc: `${site}/`, lastmod: SITE_LASTMOD, changefreq: "weekly", priority: "1.0" },
  { loc: `${site}/pricing`, lastmod: SITE_LASTMOD, changefreq: "monthly", priority: "0.9" },
  { loc: `${site}/blog`, lastmod: SITE_LASTMOD, changefreq: "daily", priority: "0.95" },
  { loc: `${site}/launch-stack`, lastmod: SITE_LASTMOD, changefreq: "monthly", priority: "0.7" },
  { loc: `${site}/feedback`, lastmod: SITE_LASTMOD, changefreq: "monthly", priority: "0.5" },
  { loc: `${site}/legal`, lastmod: SITE_LASTMOD, changefreq: "yearly", priority: "0.4" },
  { loc: `${site}/legal/deposit-statutes`, lastmod: SITE_LASTMOD, changefreq: "monthly", priority: "0.85" },
  { loc: `${site}/privacy`, lastmod: SITE_LASTMOD, changefreq: "yearly", priority: "0.3" },
  { loc: `${site}/terms`, lastmod: SITE_LASTMOD, changefreq: "yearly", priority: "0.3" },
];
const blogEntries = manifest.posts.map((p) => ({
  loc: `${site}/blog/${p.slug}`,
  lastmod: p.updated || p.published || "2026-09-01",
  changefreq: "monthly",
  priority: p.intent === "pain" || p.category === "pain" ? "0.8" : "0.65",
}));
const allEntries = [...staticEntries, ...blogEntries];
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const e of allEntries) {
  sm += `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>\n`;
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
