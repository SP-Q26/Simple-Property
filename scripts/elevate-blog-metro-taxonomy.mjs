#!/usr/bin/env node
/**
 * Elevate blog SEO · assign metro pillar posts (was 0 → score penalty).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function isMetroPost(post) {
  if (post.series && String(post.series).includes("metro-oct-2026")) return true;
  if (/-deposit-local-guide$/.test(post.slug)) return true;
  if (
    /^(logan-square|pilsen|portage-park|hyde-park|brickell|wynwood|little-havana|petworth|shaw-|columbia-heights|capitol-hill)-/.test(
      post.slug
    )
  ) {
    return true;
  }
  return false;
}

let moved = 0;
for (const post of manifest.posts) {
  if (!isMetroPost(post)) continue;
  if (post.category === "metro") continue;
  post.category = "metro";
  if (!post.intent || post.intent === "city") post.intent = "city";
  moved++;
}

const chicagoAnchor = manifest.posts.find((p) => p.slug === "chicago-45-day-deposit-deadline");
if (chicagoAnchor && chicagoAnchor.category !== "city") {
  chicagoAnchor.category = "city";
  moved++;
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`elevate-blog-metro-taxonomy · recategorized ${moved} posts (metro + city anchors)`);
