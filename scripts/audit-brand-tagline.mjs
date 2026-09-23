#!/usr/bin/env node
/**
 * Brand tagline gate · Beat the clock (not Keep the clock) on customer surfaces.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TAG, BRAND_TAGLINE } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const KEEP_CLOCK = /\bKeep the clock\b/i;
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("TAGLINE FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(html|txt|json|svg|md|mjs|js)$/i.test(name)) out.push(p);
  }
  return out;
}

const skipUnderWeb = ["data/blog-manifest.json"];

for (const file of walk(web)) {
  const rel = file.slice(web.length + 1);
  if (skipUnderWeb.some((s) => rel.endsWith(s))) continue;
  const text = readFileSync(file, "utf8");
  if (KEEP_CLOCK.test(text)) {
    console.error("  found in", rel);
    fail++;
  }
}

need("canon BRAND_TAGLINE", BRAND_TAGLINE.includes("Beat the clock"));
need("canon BRAND_TAG", BRAND_TAG.includes("Beat the clock"));
need("no Keep the clock under web/", fail === 0);

console.log(fail ? `\nBrand tagline audit FAILED (${fail})` : "\nBrand tagline audit OK");
process.exit(fail ? 1 : 0);
