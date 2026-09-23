#!/usr/bin/env node
/** Sync font link, CSS cache bust, favicon companions across public HTML. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TAG, CSS_VERSION, FONT_GOOGLE } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const OLD_FONT =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;1,500&display=swap";
const NEW_FONT = FONT_GOOGLE;
const CSS_HREF = `/simple-property.css?v=${CSS_VERSION}`;
const ICON_BLOCK = `  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">`;

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

let changed = 0;
for (const file of walkHtml(web)) {
  let html = readFileSync(file, "utf8");
  const before = html;
  html = html.replaceAll(OLD_FONT, NEW_FONT);
  html = html.replace(/\/simple-property\.css\?v=\d+/g, CSS_HREF);
  if (!html.includes("apple-touch-icon")) {
    html = html.replace(
      /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/,
      ICON_BLOCK
    );
  }
  if (html.includes(OLD_FONT.split("?")[0]) && html.includes("Inter")) {
    html = html.replace(
      /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]+" rel="stylesheet">/g,
      `<link href="${NEW_FONT}" rel="stylesheet">`
    );
  }
  if (html !== before) {
    writeFileSync(file, html);
    changed++;
  }
}

console.log(`sync-site-head · css v${CSS_VERSION} · fonts · ${changed} html file(s)`);
console.log("BRAND_TAG:", BRAND_TAG);
