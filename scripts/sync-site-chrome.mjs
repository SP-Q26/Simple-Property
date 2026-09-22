#!/usr/bin/env node
/**
 * Inject shared atmosphere + body scripts before deploy · run: npm run sync-chrome
 * Vercel Web Analytics + Speed Insights — enable both in project dashboard (static site).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const atmosphere = readFileSync(join(web, "brand/atmosphere.html"), "utf8").trimEnd();
const ATMOSPHERE_MARKER = 'class="spt-atmosphere"';

/** Dashboard: Analytics → Web Analytics → Enable */
const VERCEL_WEB_ANALYTICS = `  <script defer src="/_vercel/insights/script.js"></script>`;
/** Dashboard: Analytics → Speed Insights → Enable */
const VERCEL_SPEED_INSIGHTS = `  <script defer src="/_vercel/speed-insights/script.js"></script>`;

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

function syncAtmosphere(html, canon) {
  const re = /  <div class="spt-atmosphere"[\s\S]*?(?=  <a class="skip-link")/;
  if (re.test(html)) return html.replace(re, `${canon.trimEnd()}\n`);
  return injectAfterBody(html, canon, ATMOSPHERE_MARKER);
}

function injectAfterBody(html, snippet, marker) {
  if (html.includes(marker)) return html;
  if (!html.includes("<body>")) return html;
  return html.replace("<body>", `<body>\n${snippet}`);
}

function injectBeforeBody(html, snippet, marker) {
  if (html.includes(marker)) return html;
  if (!html.includes("</body>")) return html;
  return html.replace("</body>", `${snippet}\n</body>`);
}

let changed = 0;
for (const file of walkHtml(web)) {
  let html = readFileSync(file, "utf8");
  const before = html;
  html = syncAtmosphere(html, atmosphere);
  html = injectBeforeBody(html, VERCEL_WEB_ANALYTICS, "/_vercel/insights/script.js");
  html = injectBeforeBody(html, VERCEL_SPEED_INSIGHTS, "/_vercel/speed-insights/script.js");
  if (html !== before) {
    writeFileSync(file, html);
    changed++;
    console.log("updated", file.replace(web + "/", ""));
  }
}

console.log(changed ? `sync-chrome · ${changed} file(s)` : "sync-chrome · already current");
