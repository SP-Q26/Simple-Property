#!/usr/bin/env node
/**
 * Isles public contact · simple-property.com only.
 * P0: disallowed mailto addresses. P1: hello@ mailto outside site footer (warn).
 * Plain-text hello@ in legal copy is OK; JSON-LD email without mailto is OK.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { FOOTER_CONTACT_EMAIL } from "./lib/site-footer.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const allowed = new Set([FOOTER_CONTACT_EMAIL.toLowerCase()]);

const SOURCE_OK = [/scripts\/lib\/site-footer\.mjs$/];
const FILE_OK = [/web\/api\//, /web\/lib\/resend\.mjs$/, /web\/feedback\.html$/];

const MAILTO_RE = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

const p0 = [];
const p1 = [];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".git" || name === "vendor") continue;
      walk(full, files);
    } else if (/\.(html|js|mjs)$/.test(name)) files.push(full);
  }
  return files;
}

function stripSiteFooters(html) {
  return html.replace(/<footer class="site-footer[^"]*">[\s\S]*?<\/footer>/gi, "");
}

for (const file of [...walk(web), join(root, "scripts/lib/site-footer.mjs")]) {
  const rel = relative(root, file);
  if (FILE_OK.some((re) => re.test(rel))) continue;

  let text = readFileSync(file, "utf8");
  if (rel.endsWith(".html")) text = stripSiteFooters(text);

  const isSource = SOURCE_OK.some((re) => re.test(rel));
  let m;
  MAILTO_RE.lastIndex = 0;
  while ((m = MAILTO_RE.exec(text)) !== null) {
    const addr = m[1].toLowerCase();
    if (!allowed.has(addr)) {
      p0.push(`Disallowed mailto ${addr} in ${rel}`);
      continue;
    }
    if (!isSource && !rel.endsWith(".html")) {
      p1.push(`mailto in non-footer source: ${rel} (${addr})`);
    } else if (rel.endsWith(".html")) {
      p1.push(`mailto in page body (outside footer): ${rel} (${addr})`);
    }
  }
}

if (p0.length) {
  console.error("P0:");
  p0.forEach((l) => console.error(" ", l));
}
if (p1.length) {
  console.warn("P1 (footer-only mailto):");
  p1.slice(0, 25).forEach((l) => console.warn(" ", l));
  if (p1.length > 25) console.warn(`  … and ${p1.length - 25} more`);
}

if (p0.length) process.exit(1);
console.log(`Isles inbox audit OK · allowed=${FOOTER_CONTACT_EMAIL}`);
if (p1.length) console.log(`Warn: ${p1.length} body mailto(s) — use footer or /feedback`);
process.exit(0);
