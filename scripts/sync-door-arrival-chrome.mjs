#!/usr/bin/env node
/** Bump door arrival ?v= and preload hints on index + app. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ARRIVAL_CHROME_VER } from "./lib/door-arrival-canon.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const ver = String(ARRIVAL_CHROME_VER);
const preload = `  <link rel="preload" href="/lottie/spt-door-arrival-lottie.json?v=${ver}" as="fetch" crossorigin>`;

for (const page of ["index.html", "app.html"]) {
  const path = join(web, page);
  let html = readFileSync(path, "utf8");
  const before = html;
  html = html.replace(/\/spt-door-arrival\.css\?v=\d+/g, `/spt-door-arrival.css?v=${ver}`);
  html = html.replace(/\/spt-door-arrival-lottie\.js\?v=\d+/g, `/spt-door-arrival-lottie.js?v=${ver}`);
  html = html.replace(/\s*<link rel="preload" href="\/lottie\/spt-door-arrival-lottie\.json[^>]*>\n?/g, "\n");
  html = html.replace(
    /(<script src="\/spt-door-arrival-lottie\.js\?v=\d+" defer><\/script>)/,
    `${preload}\n  $1`
  );
  if (html !== before) writeFileSync(path, html);
}

console.log(`sync-door-arrival-chrome · v${ver} · index + app`);
