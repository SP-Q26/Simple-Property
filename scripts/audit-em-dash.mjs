#!/usr/bin/env node
/** Customer web surfaces must not contain U+2014 em dash (Innsegall / WW canon). */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const EM = "\u2014";
let fail = 0;

const allow = new Set(["node_modules"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (allow.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(html|txt|json|rss|js|mjs|css)$/.test(name) && !p.includes("/api/")) out.push(p);
  }
  return out;
}

for (const file of walk(web)) {
  const rel = relative(web, file);
  if (rel.startsWith("node_modules")) continue;
  const text = readFileSync(file, "utf8");
  if (!text.includes(EM)) continue;
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (line.includes(EM)) {
      console.error(`EM DASH ${rel}:${i + 1}`);
      fail++;
    }
  });
}

console.log(fail ? `Em dash audit FAILED (${fail} lines)` : "Em dash audit OK · no U+2014 in web/");
process.exit(fail ? 1 : 0);
