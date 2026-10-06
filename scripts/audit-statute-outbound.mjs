#!/usr/bin/env node
/** Outbound statute hrefs in web/ must match statute-urls canon (+ Chicago RLTO). */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATUTE_URLS, CHICAGO_RLTO_URL } from "../web/lib/statute-urls.mjs";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const canon = new Set([...Object.values(STATUTE_URLS), CHICAGO_RLTO_URL]);
const skipHosts = new Set([
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "simple-property.com",
  "www.simple-property.com",
  "buy.stripe.com",
  "checkout.stripe.com",
]);

let fail = 0;
function bad(msg) {
  console.error("FAIL", msg);
  fail++;
}
function ok(msg) {
  console.log("OK", msg);
}

const statutesPage = readFileSync(join(web, "legal/deposit-statutes.html"), "utf8");
for (const code of SUPPORTED_STATES) {
  const url = STATUTE_URLS[code];
  if (!statutesPage.includes(url)) bad(`deposit-statutes missing ${code} URL`);
  else ok(`deposit-statutes ${code}`);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(html|js|json|rss)$/.test(name)) out.push(p);
  }
  return out;
}

const stray = new Map();
for (const file of walk(web)) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  const re = /href="(https:\/\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const u = m[1].replace(/&amp;/g, "&");
    let host;
    try {
      host = new URL(u).hostname;
    } catch {
      continue;
    }
    if (skipHosts.has(host) || host.includes("google") || host.includes("gstatic")) continue;
    if (canon.has(u)) continue;
    if (u.startsWith("https://www.ilga.gov") || u.startsWith("https://codes.ohio.gov")) {
      if (canon.has(u)) continue;
    }
    if (!stray.has(u)) stray.set(u, []);
    stray.get(u).push(rel);
  }
}

if (stray.size) {
  for (const [u, files] of [...stray.entries()].sort()) {
    bad(`non-canon outbound ${u} (${files.slice(0, 2).join(", ")}${files.length > 2 ? "…" : ""})`);
  }
} else ok("all outbound statute hrefs match canon");

console.log(fail ? `Statute outbound audit FAILED (${fail})` : "Statute outbound audit OK");
process.exit(fail ? 1 : 0);
