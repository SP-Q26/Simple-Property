#!/usr/bin/env node
/**
 * Sitewide CTA + microcopy alignment · operator voice canon.
 * Run: npm run apply:cta-brand && npm run sync:seo
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");

/** @type {[string, string][]} */
const REPLACEMENTS = [
  ["Start free deposit packet · Deposit Desk", "Open Deposit Desk · free draft packet"],
  ["Start free packet", "Open Deposit Desk"],
  ["start free ·", "free draft ·"],
  ["Start free. See statutory deadlines", "Open Deposit Desk free. See statutory deadlines"],
  ["Open the wizard", "Open Deposit Desk"],
  ["tap opens desk", "tap opens Deposit Desk"],
];

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html") || name.endsWith(".js") || name.endsWith(".mjs")) out.push(p);
  }
  return out;
}

let files = 0;
let subs = 0;

for (const file of walkHtml(web)) {
  if (file.includes("node_modules")) continue;
  let text = readFileSync(file, "utf8");
  let next = text;
  for (const [from, to] of REPLACEMENTS) {
    if (next.includes(from)) {
      next = next.split(from).join(to);
      subs++;
    }
  }
  if (next !== text) {
    writeFileSync(file, next);
    files++;
  }
}

console.log(`sweep-cta-brand · ${files} files · ${subs} replacements`);
