#!/usr/bin/env node
/** Restore plain-text meta descriptions from blog-manifest (fixes accidental HTML in head). */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const manifest = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "web", "data", "blog-manifest.json"), "utf8")
);

function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

let n = 0;
for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const post = manifest.posts.find((p) => p.slug === file.replace(".html", ""));
  if (!post?.description) continue;
  const path = join(blogDir, file);
  let html = readFileSync(path, "utf8");
  const plain = escAttr(post.description);
  let next = html
    .replace(/^  <meta name="description".*$/m, `  <meta name="description" content="${plain}">`)
    .replace(/^  <meta property="og:description".*$/m, `  <meta property="og:description" content="${plain}">`)
    .replace(/^  <meta name="twitter:description".*$/m, `  <meta name="twitter:description" content="${plain}">`);
  if (next !== html) {
    writeFileSync(path, next);
    n++;
  }
}
console.log(`fix-blog-meta-descriptions · ${n} file(s)`);
