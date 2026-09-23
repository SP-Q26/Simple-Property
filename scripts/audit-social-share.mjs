#!/usr/bin/env node
/** P0: PNG OG images + social meta markers on drop pages and blog. */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(path, label) {
  const p = join(web, path);
  if (!existsSync(p)) {
    console.error("MISSING", label, path);
    fail++;
    return;
  }
  console.log("ok", label);
}

need("og/spt-share-door.png", "OG share door PNG");
need("og/spt-share-door.svg", "OG share door SVG");
need("og/spt-card.png", "OG card PNG");

const dropPages = [
  "index.html",
  "app.html",
  "pricing.html",
  "launch-stack.html",
  "feedback.html",
  "blog/index.html",
];

for (const rel of dropPages) {
  const html = readFileSync(join(web, rel), "utf8");
  if (!html.includes("<!-- spt-social -->")) {
    console.error("MISSING spt-social block", rel);
    fail++;
  } else console.log("ok social block", rel);
  if (!html.includes("og/spt-share-door.png")) {
    console.error("MISSING share door PNG in og:image", rel);
    fail++;
  } else console.log("ok og png", rel);
  if (html.includes("spt-card.svg")) {
    console.error("STALE spt-card.svg in", rel);
    fail++;
  }
}

if (fail) {
  console.error(`Social share audit FAIL (${fail})`);
  process.exit(1);
}
console.log("Social share audit OK");
