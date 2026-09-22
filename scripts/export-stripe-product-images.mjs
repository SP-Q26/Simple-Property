#!/usr/bin/env node
/**
 * Rasterize web/stripe/*.svg → 512×512 PNG for Stripe product images.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stripeDir = join(root, "web/stripe");

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

for (const file of svgs) {
  const svgPath = join(stripeDir, file);
  const pngPath = join(stripeDir, file.replace(/\.svg$/, ".png"));
  const svg = readFileSync(svgPath, "utf8");
  const renderer = new resvg.Resvg(svg, { fitTo: { mode: "width", value: 512 } });
  const pngBuffer = renderer.render().asPng();
  writeFileSync(pngPath, pngBuffer);
  const kb = Math.round(statSync(pngPath).size / 1024);
  console.log(`ok ${file} → ${file.replace(/\.svg$/, ".png")} (${kb} KB)`);
}
console.log("export-stripe-product-images OK");
