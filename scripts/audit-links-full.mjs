#!/usr/bin/env node
/**
 * Full internal link audit · HTML + JS + RSS + vercel redirects + manifest parity.
 * Prod optional: SPT_LINK_AUDIT_PROD=1 node scripts/audit-links-full.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");
const PROD = process.env.SPT_LINK_AUDIT_PROD === "1";

let fail = 0;

function failMsg(msg) {
  console.error(msg);
  fail++;
}

const vercel = JSON.parse(readFileSync(join(web, "vercel.json"), "utf8"));
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));

const ROUTES = new Set(["/"]);

function addRoute(raw) {
  if (!raw || typeof raw !== "string") return;
  if (!raw.startsWith("/")) return;
  if (raw.includes(":") || raw.includes("*")) return;
  const bare = raw.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  ROUTES.add(bare);
}

for (const r of vercel.rewrites || []) addRoute(r.source);
for (const r of vercel.redirects || []) {
  if (r.source === r.destination) failMsg(`LINK FAIL identity redirect loop: ${r.source}`);
  const dest = r.destination;
  if (dest?.startsWith("https://")) {
    try {
      const u = new URL(dest);
      if (u.hostname === "simple-property.com" || u.hostname === "www.simple-property.com") addRoute(u.pathname);
    } catch {
      failMsg(`LINK FAIL bad redirect URL: ${dest}`);
    }
  } else addRoute(dest);
}

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) {
      const rel = p.replace(`${web}/`, "");
      if (rel === "index.html") addRoute("/");
      else if (rel.endsWith("/index.html")) addRoute(`/${rel.replace(/\/index\.html$/, "")}`);
      else if (rel.endsWith(".html")) addRoute(`/${rel.replace(/\.html$/, "")}`);
      out.push(p);
    }
  }
  return out;
}

const htmlFiles = walkHtml(web);
for (const post of manifest.posts) addRoute(`/blog/${post.slug}`);

function isAsset(path) {
  return (
    path.startsWith("/brand/") ||
    path.startsWith("/og/") ||
    path.startsWith("/lottie/") ||
    path.startsWith("/data/") ||
    path.startsWith("/api/") ||
    path.startsWith("/favicon") ||
    path.startsWith("/apple-touch") ||
    path.startsWith("/simple-property") ||
    /\.(css|js|svg|json|png|webp|ico|webmanifest|woff2?|rss|xml|txt)$/i.test(path)
  );
}

function pathOnly(href) {
  return href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
}

const linkRes = [
  /href="(\/[^"]*)"/g,
  /href='(\/[^']*)'/g,
];

const seen = new Set();

function checkInternal(rel, href, kind) {
  if (href.includes("${") || href.includes("$")) return;
  const p = pathOnly(href);
  if (isAsset(p)) return;
  const key = `${rel}|${p}`;
  if (seen.has(key)) return;
  seen.add(key);
  if (!ROUTES.has(p)) failMsg(`LINK FAIL ${kind} ${rel} → ${p}`);
}

function scanText(rel, text, kind) {
  for (const re of linkRes) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) checkInternal(rel, m[1], kind);
  }
  const blogRe = /["'](\/blog\/[a-z0-9-]+)["']/g;
  blogRe.lastIndex = 0;
  let m;
  while ((m = blogRe.exec(text))) checkInternal(rel, m[1], kind);
}

for (const file of htmlFiles) {
  const rel = file.replace(`${web}/`, "");
  scanText(rel, readFileSync(file, "utf8"), "html");
}

function walkJs(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkJs(p);
    else if (name.endsWith(".js") && !name.endsWith(".min.js")) {
      const rel = p.replace(`${web}/`, "");
      scanText(rel, readFileSync(p, "utf8"), "js");
    }
  }
}
walkJs(web);

for (const post of manifest.posts) {
  const fp = join(web, "blog", `${post.slug}.html`);
  if (!existsSync(fp)) failMsg(`LINK FAIL manifest missing HTML: /blog/${post.slug}`);
}

const manifestSlugs = new Set(manifest.posts.map((p) => p.slug));
for (const name of readdirSync(join(web, "blog"))) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const slug = name.replace(/\.html$/, "");
  if (!manifestSlugs.has(slug)) failMsg(`LINK FAIL orphan blog HTML (not in manifest): /blog/${slug}`);
}

const feedPath = join(web, "blog", "feed.rss");
if (existsSync(feedPath)) {
  const feed = readFileSync(feedPath, "utf8");
  for (const m of feed.matchAll(/<link>https:\/\/simple-property\.com(\/[^<]+)<\/link>/g)) {
    const p = pathOnly(m[1]);
    if (p.startsWith("/blog/") && !ROUTES.has(p)) failMsg(`LINK FAIL rss → ${p}`);
  }
}

// vercel blog rewrites vs manifest
const rewriteBlog = new Set(
  (vercel.rewrites || [])
    .map((r) => r.source)
    .filter((s) => s?.startsWith("/blog/") && s !== "/blog" && s !== "/blog/feed.rss")
);
for (const post of manifest.posts) {
  const route = `/blog/${post.slug}`;
  if (!rewriteBlog.has(route)) failMsg(`LINK FAIL vercel rewrite missing: ${route}`);
}
for (const route of rewriteBlog) {
  const slug = route.replace("/blog/", "");
  if (!manifestSlugs.has(slug)) failMsg(`LINK FAIL vercel rewrite orphan: ${route}`);
}

console.log(`Routes indexed: ${ROUTES.size} · internal checks: ${seen.size}`);

async function prodSample() {
  const paths = [
    "/",
    "/app",
    "/logs",
    "/pricing",
    "/hub",
    "/modules",
    "/blog",
    "/legal",
    "/privacy",
    "/terms",
    ...manifest.posts.map((p) => `/blog/${p.slug}`),
  ];
  const uniq = [...new Set(paths)];
  let prodFail = 0;
  console.log(`\nProduction HEAD crawl (${BASE}) · ${uniq.length} paths…`);
  for (const path of uniq) {
    const url = BASE + path;
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      if (res.status !== 200) {
        console.error(`PROD FAIL ${res.status} ${path}`);
        prodFail++;
      }
    } catch (e) {
      console.error(`PROD FAIL ${path}: ${e.message}`);
      prodFail++;
    }
  }
  if (prodFail) fail += prodFail;
  else console.log("Production crawl OK");
}

if (PROD) await prodSample();

console.log(fail ? `\nFull links audit FAILED (${fail})` : "\nFull links audit OK");
process.exit(fail ? 1 : 0);
