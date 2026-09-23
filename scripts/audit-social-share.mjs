#!/usr/bin/env node
/** P0: PNG OG images + social meta markers on drop pages and blog. */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";
import { STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";
import { OG_CACHE_VERSION, OG_IMAGE_PATH, OG_IMAGE_COVERAGE_PATH } from "./lib/social-share.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
let fail = 0;

function need(path, label) {
  const p = join(web, path);
  if (!existsSync(p)) {
    console.error("MISSING", label, path);
    fail++;
    return;
  }
  console.log("ok", label);
}

function needContent(label, ok) {
  if (!ok) {
    console.error("SOCIAL FAIL:", label);
    fail++;
  } else console.log("ok", label);
}

need("og/spt-share-door.png", "OG share door PNG");
need("og/spt-share-door.svg", "OG share door SVG");
need("og/spt-share-coverage-expansion.png", "OG coverage expansion PNG");
need("og/spt-share-coverage-expansion.svg", "OG coverage expansion SVG");
need("og/spt-card.png", "OG card PNG");

const doorSvg = readFileSync(join(web, "og/spt-share-door.svg"), "utf8");
needContent("share door SVG 18 states copy", doorSvg.includes(`${STATE_ONLY_COUNT} states + DC`));
needContent("share door SVG no Midwest-only line", !doorSvg.includes("Midwest deposit packets"));
needContent("share door SVG no six-state-only line", !doorSvg.includes("IL · IN · OH · MI · IA · MO"));
needContent(`share door SVG ${SUPPORTED_STATES.length} chips`, (doorSvg.match(/class="coverage-chip"/g) || []).length === SUPPORTED_STATES.length);

const coverageSvg = readFileSync(join(web, "og/spt-share-coverage-expansion.svg"), "utf8");
needContent("coverage SVG thank-you headline", coverageSvg.includes("New state coverage"));
needContent("coverage SVG iOS tease", /iOS app incoming/i.test(coverageSvg));

const dropPages = [
  "index.html",
  "app.html",
  "pricing.html",
  "launch-stack.html",
  "feedback.html",
  "blog/index.html",
];

const ogNeedle = `${OG_IMAGE_PATH}?v=${OG_CACHE_VERSION}`;

for (const rel of dropPages) {
  const html = readFileSync(join(web, rel), "utf8");
  if (!html.includes("<!-- spt-social -->")) {
    console.error("MISSING spt-social block", rel);
    fail++;
  } else console.log("ok social block", rel);
  if (!html.includes(ogNeedle)) {
    console.error("MISSING versioned share door PNG in og:image", rel, ogNeedle);
    fail++;
  } else console.log("ok og png", rel);
  if (html.includes("spt-card.svg")) {
    console.error("STALE spt-card.svg in", rel);
    fail++;
  }
}

const coveragePost = manifest.posts.find((p) => p.slug === "deposit-desk-new-states-thanks-sep-2026");
const coverageHtml = readFileSync(
  join(web, "blog/deposit-desk-new-states-thanks-sep-2026.html"),
  "utf8"
);
const covImg = `${OG_IMAGE_COVERAGE_PATH}?v=${OG_CACHE_VERSION}`;
needContent("coverage post manifest ogImage", coveragePost?.ogImage === OG_IMAGE_COVERAGE_PATH);
needContent("coverage post og:image", coverageHtml.includes(covImg));
needContent("coverage post article:published_time", coverageHtml.includes("article:published_time"));

if (fail) {
  console.error(`Social share audit FAIL (${fail})`);
  process.exit(1);
}
console.log("Social share audit OK");
