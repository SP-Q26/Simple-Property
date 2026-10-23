#!/usr/bin/env node
/** Expect 5 route-series guides per marketing route in blog-manifest. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "web/data/blog-manifest.json"), "utf8"));

const ROUTES = [
  "home",
  "deposit-desk",
  "pricing",
  "condition-hub",
  "modules",
  "operator-logs",
  "launch-stack",
  "compare",
  "deposit-statutes",
];

let fail = 0;
for (const series of ROUTES) {
  const posts = manifest.posts.filter((p) => p.routeSeries === series);
  const ok = posts.length >= 5;
  if (!ok) {
    console.error("ROUTE SERIES FAIL:", series, "have", posts.length, "want ≥5");
    fail++;
  } else {
    console.log("ok:", series, posts.length);
  }
  for (const p of posts) {
    const htmlPath = join(root, "web/blog", `${p.slug}.html`);
    if (!existsSync(htmlPath)) {
      console.error("ROUTE SERIES FAIL: missing html", p.slug);
      fail++;
    }
  }
}

console.log(fail ? `\nRoute series audit FAILED (${fail})` : "\nRoute series audit OK");
process.exit(fail ? 1 : 0);
