#!/usr/bin/env node
/** P0 · public HTML includes Vercel tracking snippets (no-op until dashboard enabled). */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function pages(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => join(dir, f));
}

const files = [...pages(web), ...pages(join(web, "blog"))];

for (const file of files) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  if (!html.includes("/_vercel/insights/script.js")) {
    console.error("TRACK FAIL missing Web Analytics script:", rel);
    fail++;
  }
  if (!html.includes("/_vercel/speed-insights/script.js")) {
    console.error("TRACK FAIL missing Speed Insights script:", rel);
    fail++;
  }
}

console.log(fail ? `Vercel tracking audit FAILED (${fail})` : "Vercel tracking audit OK");
process.exit(fail ? 1 : 0);
