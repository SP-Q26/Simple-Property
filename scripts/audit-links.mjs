#!/usr/bin/env node
/** Internal links · public HTML only (Innsegall audit-links pattern). */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));

const ROUTES = new Set([
  "/",
  "/app",
  "/pricing",
  "/launch-stack",
  "/blog",
  "/blog/feed.rss",
  "/privacy",
  "/terms",
  "/success",
  "/llms.txt",
  "/spt-ai-bus.json",
  "/.well-known/spt-gospel.json",
  "/.well-known/ai-discovery.json",
]);

for (const p of manifest.posts) {
  ROUTES.add(`/blog/${p.slug}`);
}

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function pathOnly(href) {
  const bare = href.split("#")[0].split("?")[0];
  return bare.replace(/\/$/, "") || "/";
}

function isAsset(path) {
  return (
    path.startsWith("/brand/") ||
    path.startsWith("/og/") ||
    path.endsWith(".css") ||
    path.endsWith(".js") ||
    path.endsWith(".svg") ||
    path.endsWith(".webmanifest") ||
    path.startsWith("/favicon") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  );
}

for (const file of walkHtml(web)) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  const re = /href="(\/[^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const p = pathOnly(m[1]);
    if (isAsset(p)) continue;
    if (!ROUTES.has(p)) {
      console.error("LINK FAIL", rel, "→", p);
      fail++;
    }
  }
}

console.log(fail ? `Links audit FAILED (${fail})` : "Links audit OK");
process.exit(fail ? 1 : 0);
