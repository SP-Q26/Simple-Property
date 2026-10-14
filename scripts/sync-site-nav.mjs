#!/usr/bin/env node
/** Canonical header nav on every public HTML page. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { HEADER_NAV_BLOCK, HEADER_NAV_HUB_BLOCK } from "./lib/site-nav.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const NAV_RE = /<nav class="header-nav" aria-label="Primary">[\s\S]*?<\/nav>/;

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "brand" || name === "node_modules") continue;
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

let updated = 0;
for (const file of walkHtml(web)) {
  const rel = file.replace(web + "/", "");
  if (rel.startsWith("brand/")) continue;
  let html = readFileSync(file, "utf8");
  if (!NAV_RE.test(html)) continue;
  const block = rel === "hub.html" ? HEADER_NAV_HUB_BLOCK : HEADER_NAV_BLOCK;
  const next = html.replace(NAV_RE, block);
  if (next !== html) {
    writeFileSync(file, next);
    updated++;
  }
}

const shellHeader = join(web, "brand/shell-header.html");
if (statSync(shellHeader).isFile()) {
  let sh = readFileSync(shellHeader, "utf8");
  const next = sh.replace(NAV_RE, HEADER_NAV_BLOCK);
  if (next !== sh) {
    writeFileSync(shellHeader, next);
    updated++;
  }
}

console.log(`sync-site-nav · ${updated} files updated`);
