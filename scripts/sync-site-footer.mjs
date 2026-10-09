#!/usr/bin/env node
/** Apply canonical footer shell (Isles Collective · AJ Nichols credit) to all HTML. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  wrapFooter,
  FOOTER_NAV_FULL,
  FOOTER_NAV_BLOG_POST,
  FOOTER_NAV_BLOG_HUB,
  FOOTER_NAV_APP,
  FOOTER_NAV_LOGS,
  FOOTER_NAV_STATUTES,
  FOOTER_COLLECTIVE,
} from "./lib/site-footer.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");

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

function pickNav(rel) {
  if (rel === "app.html") return FOOTER_NAV_APP;
  if (rel === "logs.html") return FOOTER_NAV_LOGS;
  if (rel === "legal/deposit-statutes.html") return FOOTER_NAV_STATUTES;
  if (rel === "blog/index.html") return FOOTER_NAV_BLOG_HUB;
  if (rel.startsWith("blog/")) return FOOTER_NAV_BLOG_POST;
  return FOOTER_NAV_FULL;
}

const FOOTER_RE = /<footer class="([^"]+)">[\s\S]*?<\/footer>/;

let changed = 0;
for (const file of walkHtml(web)) {
  const rel = relative(web, file).replace(/\\/g, "/");
  let html = readFileSync(file, "utf8");
  const m = html.match(FOOTER_RE);
  if (!m) continue;
  const footerClass = m[1];
  const next = wrapFooter(footerClass, pickNav(rel));
  const out = html.replace(FOOTER_RE, next);
  if (out !== html) {
    writeFileSync(file, out);
    changed++;
  }
}

console.log(`sync-site-footer · ${FOOTER_COLLECTIVE} · ${changed} html file(s)`);
