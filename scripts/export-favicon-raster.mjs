#!/usr/bin/env node
/** Rasterize web/favicon.svg → PNG + ICO for /favicon.ico and apple-touch-icon. */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const svgPath = join(web, "favicon.svg");

let resvg;
try {
  resvg = await import("@resvg/resvg-js");
} catch {
  console.error("Missing @resvg/resvg-js · run: npm install");
  process.exit(1);
}

const svg = readFileSync(svgPath, "utf8");

function renderPng(size) {
  const renderer = new resvg.Resvg(svg, { fitTo: { mode: "width", value: size } });
  return renderer.render().asPng();
}

/** Single 32×32 PNG embedded in ICO (Vista+). */
function pngToIco(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const dir = Buffer.alloc(16);
  dir[0] = 32;
  dir[1] = 32;
  dir[2] = 0;
  dir[3] = 0;
  dir.writeUInt16LE(1, 4);
  dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(pngBuffer.length, 8);
  dir.writeUInt32LE(6 + 16, 12);

  return Buffer.concat([header, dir, pngBuffer]);
}

const png32 = renderPng(32);
const png180 = renderPng(180);
const ico = pngToIco(png32);

const out = [
  ["favicon-32.png", png32],
  ["apple-touch-icon.png", png180],
  ["favicon.ico", ico],
];

for (const [name, buf] of out) {
  const p = join(web, name);
  writeFileSync(p, buf);
  console.log(`ok favicon.svg → ${name} (${Math.round(statSync(p).size / 1024)} KB)`);
}

console.log("Favicon raster export OK");
