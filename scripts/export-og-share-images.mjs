#!/usr/bin/env node
/** Rasterize web/og/*.svg → 1200×630 PNG for Facebook / LinkedIn link previews. */
import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "og");

let resvg;
try {
  resvg = await import("@resvg/resvg-js");
} catch {
  console.error("Missing @resvg/resvg-js · run: npm install");
  process.exit(1);
}

const svgs = readdirSync(ogDir).filter((f) => f.endsWith(".svg"));
if (!svgs.length) {
  console.error("No SVG in web/og/");
  process.exit(1);
}

for (const file of svgs) {
  const svg = readFileSync(join(ogDir, file), "utf8");
  const renderer = new resvg.Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const pngBuffer = renderer.render().asPng();
  const pngName = file.replace(/\.svg$/, ".png");
  const pngPath = join(ogDir, pngName);
  writeFileSync(pngPath, pngBuffer);
  const kb = Math.round(statSync(pngPath).size / 1024);
  console.log(`ok ${file} → og/${pngName} (${kb} KB)`);
}

console.log("OG PNG export OK");
