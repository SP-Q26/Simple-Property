#!/usr/bin/env node
/**
 * Inject guide ↔ dispute story cross-warnings on pain, news, and canonical guides.
 * Run: node scripts/refresh-guide-story-warnings.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  STORY_BY_STATE,
  stripGuideWarning,
  guideWarningBlock,
  disputeGuideRefsBlock,
  insertAfterFirstH1,
  stateLabel,
  isCanonicalGuide,
  isDisputeLane,
} from "./lib/guide-story-warnings.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const TODAY = "2026-10-08";

let changed = 0;

for (const post of manifest.posts) {
  const path = join(blogDir, `${post.slug}.html`);
  let html;
  try {
    html = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  const mainMatch = html.match(/<main id="main" class="prose">([\s\S]*?)<\/main>/);
  if (!mainMatch) continue;

  const code = post.states?.[0];
  const label = code ? stateLabel(code) : "";
  const story = code ? STORY_BY_STATE[code] : null;

  let block = "";
  if (isCanonicalGuide(post) && code && story) {
    const painTitle = manifest.posts.find((p) => p.slug === story.painSlug)?.title || `${label} dispute story`;
    block = guideWarningBlock({
      risk: story.risk,
      story: story.story,
      painSlug: story.painSlug,
      painTitle,
    });
  } else if (isDisputeLane(post)) {
    if (code) {
      block = disputeGuideRefsBlock(code, label);
    } else if (post.slug === "missed-deposit-deadline-small-landlord-multi-state") {
      block = `${"<!-- spt-guide-warning -->"}
      <aside class="guide-story-warning" role="note">
        <p class="section-label">Guide references</p>
        <p><strong>This could happen:</strong> the wrong state clock on a shared spreadsheet.</p>
        <p><strong>Because:</strong> surrender dates drift between tabs. Start with <a href="/blog/missed-illinois-deposit-deadline-what-now">Illinois missed deadline</a> · <a href="/blog/deposit-desk-vs-spreadsheet">spreadsheet traps</a> · your state hub on <a href="/blog">Guides</a>.</p>
      </aside>
${"<!-- /spt-guide-warning -->"}`;
    }
  }

  if (!block) continue;

  let main = stripGuideWarning(mainMatch[1]);
  main = insertAfterFirstH1(main, block);
  const nextMain = `<main id="main" class="prose">${main}    </main>`;
  const nextHtml = html.replace(mainMatch[0], nextMain);
  if (nextHtml === html) continue;
  writeFileSync(path, nextHtml);
  post.updated = TODAY;
  changed++;
  console.log("guide-warning", post.slug);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`refresh-guide-story-warnings · ${changed} post(s)`);
