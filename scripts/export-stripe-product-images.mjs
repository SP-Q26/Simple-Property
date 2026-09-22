#!/usr/bin/env node
/**
 * Rasterize web/stripe/*.svg → 512×512 PNG for Stripe product images.
 * Also copies PNGs to docs/stripe/upload-for-stripe/ for manual Dashboard drag-in.
 */
import { readFileSync, writeFileSync, statSync, readdirSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stripeDir = join(root, "web/stripe");
const uploadDir = join(root, "docs/stripe/upload-for-stripe");

let resvg;
try {
  resvg = await import("@resvg/resvg-js");
} catch {
  console.error("Missing @resvg/resvg-js · run: npm install");
  process.exit(1);
}

const svgs = readdirSync(stripeDir).filter((f) => f.endsWith(".svg"));
if (!svgs.length) {
  console.error("No SVG files in web/stripe/");
  process.exit(1);
}

mkdirSync(uploadDir, { recursive: true });

for (const file of svgs) {
  const svgPath = join(stripeDir, file);
  const pngName = file.replace(/\.svg$/, ".png");
  const pngPath = join(stripeDir, pngName);
  const svg = readFileSync(svgPath, "utf8");
  const renderer = new resvg.Resvg(svg, { fitTo: { mode: "width", value: 512 } });
  const pngBuffer = renderer.render().asPng();
  writeFileSync(pngPath, pngBuffer);
  copyFileSync(pngPath, join(uploadDir, pngName));
  const kb = Math.round(statSync(pngPath).size / 1024);
  console.log(`ok ${file} → web/stripe/${pngName} (${kb} KB)`);
  console.log(`   copy docs/stripe/upload-for-stripe/${pngName}`);
}
console.log("export-stripe-product-images OK");
