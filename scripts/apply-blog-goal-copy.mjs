#!/usr/bin/env node
/**
 * Apply goal-oriented pain + CTA blocks to every manifest blog post.
 * Run: node scripts/apply-blog-goal-copy.mjs && node scripts/audit-blog-goal-copy.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripBlogCourtCard } from "./lib/blog-article-shell.mjs";
import { ensureBlogGoalCopy } from "./lib/blog-goal-copy.mjs";
import { ensureRelatedGuides } from "./lib/blog-related.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
const stateLabels = manifest.stateLabels || {};

let updated = 0;
let skipped = 0;

for (const post of manifest.posts) {
  const path = join(blogDir, `${post.slug}.html`);
  let html;
  try {
    html = readFileSync(path, "utf8");
  } catch {
    console.warn("missing file", post.slug);
    skipped++;
    continue;
  }
  const mainMatch = html.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) {
    console.warn("no main", post.slug);
    skipped++;
    continue;
  }
  const inner = mainMatch[1];
  const courtMatch = inner.match(/<!-- spt-court-record -->[\s\S]*?<!-- \/spt-court-record -->/);
  const court = courtMatch ? `${courtMatch[0]}\n` : "";
  const bodyOnly = stripBlogCourtCard(inner);
  let nextBody = ensureBlogGoalCopy(bodyOnly, { states: post.states, stateLabels });
  nextBody = ensureRelatedGuides(nextBody, post, manifest);
  if (nextBody === bodyOnly.trim()) {
    skipped++;
    continue;
  }
  const nextMain = `${court}${nextBody}`;
  const nextHtml = html.replace(mainMatch[0], `<main id="main" class="prose">\n\n${nextMain}\n    </main>`);
  writeFileSync(path, nextHtml);
  updated++;
}

const orphans = readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html");
for (const file of orphans) {
  const slug = file.replace(".html", "");
  if (manifest.posts.some((p) => p.slug === slug)) continue;
  console.warn("orphan html (not in manifest)", slug);
}

console.log(`apply-blog-goal-copy · ${updated} updated · ${skipped} unchanged · ${manifest.posts.length} manifest posts`);
