#!/usr/bin/env node
/**
 * Sweep operator adoption voice across manifest blog posts.
 * Run: npm run apply:adoption-voice && npm run audit:blog-goal-copy
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripBlogCourtCard } from "./lib/blog-article-shell.mjs";
import { ensureBlogGoalCopy, guideCtaHtml } from "./lib/blog-goal-copy.mjs";
import { ensureRelatedGuides } from "./lib/blog-related.mjs";
import { sweepBlogMainHtml } from "./lib/adoption-voice.mjs";

const CTA_MARKERS = /<!-- spt-guide-cta -->[\s\S]*?<!-- \/spt-guide-cta -->/;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
const stateLabels = manifest.stateLabels || {};

let updated = 0;

for (const post of manifest.posts) {
  const path = join(blogDir, `${post.slug}.html`);
  let html;
  try {
    html = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  const mainMatch = html.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) continue;

  const inner = mainMatch[1];
  const courtMatch = inner.match(/<!-- spt-court-record -->[\s\S]*?<!-- \/spt-court-record -->/);
  const court = courtMatch ? `${courtMatch[0]}\n` : "";
  let bodyOnly = stripBlogCourtCard(inner);
  bodyOnly = sweepBlogMainHtml(bodyOnly);

  const stateCode = post.states?.[0] || "";
  const stateLabel = stateCode && stateLabels[stateCode] ? stateLabels[stateCode] : "";
  bodyOnly = bodyOnly.replace(CTA_MARKERS, guideCtaHtml({ stateCode, stateLabel }));
  bodyOnly = ensureBlogGoalCopy(bodyOnly, { states: post.states, stateLabels });
  bodyOnly = ensureRelatedGuides(bodyOnly, post, manifest);

  const nextMain = `${court}${bodyOnly}`;
  const nextHtml = html.replace(mainMatch[0], `<main id="main" class="prose">\n\n${nextMain}\n    </main>`);
  if (nextHtml !== html) {
    writeFileSync(path, nextHtml);
    updated++;
  }
}

console.log(`refresh-adoption-voice · ${updated} posts updated · ${manifest.posts.length} in manifest`);
