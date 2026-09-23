#!/usr/bin/env node
/** Link plain statute cites in blog HTML · deposit-rules + statute-urls. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { linkifyCiteInHtml } from "./lib/cite-link-html.mjs";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const manifest = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "web", "data", "blog-manifest.json"), "utf8")
);

let changed = 0;
for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const path = join(blogDir, file);
  let html = readFileSync(path, "utf8");
  const slug = file.replace(".html", "");
  const post = manifest.posts.find((p) => p.slug === slug);
  const mainMatch = html.match(/<main[\s\S]*<\/main>/);
  if (!mainMatch) continue;
  let main = mainMatch[0];
  const codes = new Set(post?.states || []);
  for (const code of codes) {
    main = linkifyCiteInHtml(main, code);
  }
  for (const code of SUPPORTED_STATES) {
    const cite = STATE_PACKS[code].cite;
    if (main.includes(cite) && !main.includes(`">${cite}</a>`)) {
      main = linkifyCiteInHtml(main, code);
    }
  }
  if (main === mainMatch[0]) continue;
  html = html.replace(mainMatch[0], main);
  writeFileSync(path, html);
  changed++;
  console.log("linked cites", file);
}
console.log(`patch-blog-statute-links · ${changed} file(s)`);
