#!/usr/bin/env node
/**
 * Inject shared body scripts before deploy · run: npm run sync-chrome
 * Vercel Web Analytics + Speed Insights — enable both in project dashboard (static site).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");

/** Dashboard: Analytics → Web Analytics → Enable */
const VERCEL_WEB_ANALYTICS = `  <script defer src="/_vercel/insights/script.js"></script>`;
/** Dashboard: Analytics → Speed Insights → Enable */
const VERCEL_SPEED_INSIGHTS = `  <script defer src="/_vercel/speed-insights/script.js"></script>`;

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name.endsWith(".html") && !p.includes("/brand/")) out.push(p);
  }
  return out;
}

function injectBeforeBody(html, snippet, marker) {
  if (html.includes(marker)) return html;
  if (!html.includes("</body>")) return html;
  return html.replace("</body>", `${snippet}\n</body>`);
}

let changed = 0;
for (const file of [...walkHtml(web), ...walkHtml(join(web, "blog"))]) {
  let html = readFileSync(file, "utf8");
  const before = html;
  html = injectBeforeBody(html, VERCEL_WEB_ANALYTICS, "/_vercel/insights/script.js");
  html = injectBeforeBody(html, VERCEL_SPEED_INSIGHTS, "/_vercel/speed-insights/script.js");
  if (html !== before) {
    writeFileSync(file, html);
    changed++;
    console.log("updated", file.replace(web + "/", ""));
  }
}

console.log(changed ? `sync-chrome · ${changed} file(s)` : "sync-chrome · already current");
