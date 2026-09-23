#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const manifest = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "web", "data", "blog-manifest.json"), "utf8")
);

let fail = 0;
for (const code of SUPPORTED_STATES) {
  const slug = manifest.posts.find((p) => p.states?.includes(code) && p.slug.includes("checklist"))?.slug;
  if (!slug) continue;
  const html = readFileSync(join(blogDir, `${slug}.html`), "utf8");
  if (!html.includes('class="state-hub-links"')) {
    console.error("FAIL hub missing on", slug);
    fail++;
  }
}
const sample = readFileSync(join(blogDir, "ohio-30-day-deposit-deadline.html"), "utf8");
if (!sample.includes("isBasedOn") && !sample.includes('"citation"')) {
  console.error("FAIL ohio deadline missing citation JSON-LD (run sync-blog-article-seo)");
  fail++;
}
console.log(fail ? `State hub audit FAILED (${fail})` : "State hub audit OK");
process.exit(fail ? 1 : 0);
