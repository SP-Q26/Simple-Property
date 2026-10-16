#!/usr/bin/env node
/**
 * Inject shared atmosphere + body scripts before deploy · run: npm run sync-chrome
 * Vercel Web Analytics + Speed Insights — enable both in project dashboard (static site).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const CSS_LINK = `simple-property.css?v=${CSS_VERSION}`;
const atmosphere = readFileSync(join(web, "brand/atmosphere.html"), "utf8").trimEnd();
const ATMOSPHERE_MARKER = 'class="spt-atmosphere"';

/** Dashboard: Analytics → Web Analytics → Enable */
const VERCEL_WEB_ANALYTICS = `  <script defer src="/_vercel/insights/script.js"></script>`;
/** Dashboard: Analytics → Speed Insights → Enable */
const VERCEL_SPEED_INSIGHTS = `  <script defer src="/_vercel/speed-insights/script.js"></script>`;
/** Client event bus · must load before page boot scripts that call sptTrack */
const SP_EVENTS = `  <script src="/sp-events.js" defer></script>`;

/** data-spt-page for marketing telemetry (app.html sets deposit_desk separately). */
const PAGE_ATTR_BY_REL = {
  "index.html": "home",
  "pricing.html": "pricing",
  "modules.html": "modules",
  "launch-stack.html": "launch_stack",
  "logs.html": "operator_logs",
  "feedback.html": "feedback",
  "hub.html": "condition_hub",
  "legal.html": "legal",
  "privacy.html": "privacy",
  "terms.html": "terms",
  "success.html": "checkout_success",
  "blog/index.html": "blog_hub",
  "legal/deposit-statutes.html": "deposit_statutes",
};

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

const VIEWPORT_CANON =
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">';
const VIEWPORT_LEGACY =
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">';

let changed = 0;
for (const file of walkHtml(web)) {
  let html = readFileSync(file, "utf8");
  const before = html;
  html = syncAtmosphere(html, atmosphere);
  html = injectBeforeBody(html, SP_EVENTS, "/sp-events.js");
  html = injectBeforeBody(html, VERCEL_WEB_ANALYTICS, "/_vercel/insights/script.js");
  html = injectBeforeBody(html, VERCEL_SPEED_INSIGHTS, "/_vercel/speed-insights/script.js");
  const rel = file.replace(web + "/", "");
  const pageAttr = PAGE_ATTR_BY_REL[rel] || (rel.startsWith("blog/") && rel !== "blog/index.html" ? "blog_post" : "");
  if (pageAttr && !html.includes("data-spt-page=")) {
    if (html.includes("<body>")) {
      html = html.replace("<body>", `<body data-spt-page="${pageAttr}">`);
    } else if (/<body\s/.test(html) && !/data-spt-page=/.test(html)) {
      html = html.replace(/<body\s/, `<body data-spt-page="${pageAttr}" `);
    }
  }
  if (html.includes(VIEWPORT_LEGACY) && !html.includes("viewport-fit=cover")) {
    html = html.replace(VIEWPORT_LEGACY, VIEWPORT_CANON);
  }
  if (html.includes("simple-property.css?v=")) {
    html = html.replace(/simple-property\.css\?v=\d+/g, CSS_LINK);
  }
  if (html !== before) {
    writeFileSync(file, html);
    changed++;
    console.log("updated", file.replace(web + "/", ""));
  }
}

console.log(changed ? `sync-chrome · ${changed} file(s)` : "sync-chrome · already current");
