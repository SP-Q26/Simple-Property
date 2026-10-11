#!/usr/bin/env node
/**
 * Vercel-facing brand assets · favicon, manifest, OG logo URLs, tracking snippets.
 * Vercel dashboard project icon: set manually to match /favicon.svg (no API in repo).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION, STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const COVERAGE = `${STATE_ONLY_COUNT} states + DC`;
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("VERCEL/FAVICON FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const faviconPath = join(web, "favicon.svg");
need("favicon.svg exists", existsSync(faviconPath));
need("favicon.ico exists", existsSync(join(web, "favicon.ico")));
need("favicon-32.png exists", existsSync(join(web, "favicon-32.png")));
need("apple-touch-icon.png exists", existsSync(join(web, "apple-touch-icon.png")));
const favicon = readFileSync(faviconPath, "utf8");
need("favicon xmlns", favicon.includes('xmlns="http://www.w3.org/2000/svg"'));
need("favicon aria-label", favicon.includes("aria-label="));
need("favicon viewBox 32", favicon.includes('viewBox="0 0 32 32"'));

const manifestPath = join(web, "site.webmanifest");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
need("manifest name", manifest.name?.includes("Deposit Desk"));
need("manifest coverage copy", manifest.description?.includes(COVERAGE));
need("manifest theme_color greystone", manifest.theme_color === "#f4f0e6" || manifest.theme_color === "#4a6741");
need("manifest icon favicon.svg", manifest.icons?.some((i) => i.src === "/favicon.svg"));
need("manifest start_url /", manifest.start_url === "/");

const index = readFileSync(join(web, "index.html"), "utf8");
need("home favicon.ico link", index.includes('rel="icon" href="/favicon.ico"'));
need("home favicon link svg", index.includes('rel="icon" href="/favicon.svg"'));
need("home webmanifest", index.includes('rel="manifest" href="/site.webmanifest"'));
need("home apple-touch-icon png", index.includes('rel="apple-touch-icon" href="/apple-touch-icon.png"'));
need("home theme-color", index.includes('name="theme-color"'));
need("home JSON-LD logo favicon", index.includes('"logo": "https://simple-property.com/favicon.svg"'));
need(`home css v${CSS_VERSION}`, index.includes(`simple-property.css?v=${CSS_VERSION}`));

need("OG share door png", existsSync(join(web, "og/spt-share-door.png")));
need("OG card svg", existsSync(join(web, "og/spt-card.svg")));

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules") walkHtml(p, out);
    } else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

let missingIcon = 0;
for (const file of walkHtml(web)) {
  const rel = file.replace(web + "/", "");
  if (rel.startsWith("brand/")) continue;
  const html = readFileSync(file, "utf8");
  if (!html.includes("/favicon.svg") || !html.includes("/favicon.ico")) {
    console.error("VERCEL/FAVICON FAIL: missing favicon on", rel);
    missingIcon++;
  }
}
need("all public html favicon.svg", missingIcon === 0);

const tracking = readFileSync(join(web, "index.html"), "utf8");
need("vercel insights defer", tracking.includes('defer src="/_vercel/insights/script.js"'));
need("vercel speed insights defer", tracking.includes('defer src="/_vercel/speed-insights/script.js"'));

console.log(
  fail || missingIcon
    ? `Vercel/favicon audit FAILED (${fail + missingIcon})`
    : "Vercel/favicon audit OK",
);
process.exit(fail || missingIcon ? 1 : 0);
