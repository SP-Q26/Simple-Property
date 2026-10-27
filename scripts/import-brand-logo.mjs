#!/usr/bin/env node
/**
 * Import artist logo (docs/brand/spt-logo-mark-v1.jpg) → web/brand PNGs + favicon.svg + raster icons.
 * Run before build-og-share-svg / sync:seo when the mark changes.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const brandDir = join(web, "brand");
const src = join(root, "docs/brand/spt-logo-mark-v1.jpg");

if (!existsSync(src)) {
  console.error("Missing source logo:", src);
  process.exit(1);
}

mkdirSync(brandDir, { recursive: true });
mkdirSync(join(root, "docs/brand"), { recursive: true });

const jpgWeb = join(brandDir, "spt-logo-mark.jpg");
copyFileSync(src, jpgWeb);

function rasterPng(size, outPath) {
  const r = spawnSync("sips", ["-s", "format", "png", "-z", String(size), String(size), jpgWeb, "--out", outPath], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    console.error("sips failed", size, r.stderr || r.stdout);
    process.exit(r.status ?? 1);
  }
}

for (const size of [512, 256, 128]) {
  rasterPng(size, join(brandDir, `spt-logo-mark-${size}.png`));
}

const png128 = readFileSync(join(brandDir, "spt-logo-mark-128.png"));
const b64 = png128.toString("base64");
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Simple Property Tools door notebook mark">
  <image width="32" height="32" href="data:image/png;base64,${b64}"/>
</svg>
`;
writeFileSync(join(web, "favicon.svg"), faviconSvg);

const raster = spawnSync(process.execPath, [join(root, "scripts/export-favicon-raster.mjs")], { stdio: "inherit" });
if (raster.status !== 0) process.exit(raster.status ?? 1);

const kb = Math.round(statSync(jpgWeb).size / 1024);
console.log(`import-brand-logo OK · source ${kb} KB · favicon.svg + ICO/PNG companions`);
