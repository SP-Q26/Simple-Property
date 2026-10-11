#!/usr/bin/env node
/** One-off: blog-court-rotate.js → court-record-rotate.js + snippet preload in existing shells. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const preload =
  '<link rel="preload" href="/data/court-record-snippets.json" as="fetch" crossorigin>';
let n = 0;

for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html"))) {
  const path = join(blogDir, file);
  let html = readFileSync(path, "utf8");
  const before = html;
  html = html.replaceAll("/blog-court-rotate.js", "/court-record-rotate.js");
  if (!html.includes("court-record-snippets.json") && html.includes("simple-property.css")) {
    html = html.replace(
      /(<link rel="stylesheet" href="\/simple-property\.css\?v=\d+">)/,
      `$1\n  ${preload}`
    );
  }
  if (html !== before) {
    writeFileSync(path, html);
    n++;
  }
}

console.log("patch-court-rotate-script ·", n, "blog file(s)");
