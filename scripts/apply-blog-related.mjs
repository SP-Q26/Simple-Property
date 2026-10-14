#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripBlogCourtCard } from "./lib/blog-article-shell.mjs";
import { ensureRelatedGuides } from "./lib/blog-related.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));

let updated = 0;
for (const post of manifest.posts) {
  const path = join(blogDir, `${post.slug}.html`);
  const html = readFileSync(path, "utf8");
  const mainMatch = html.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) continue;
  const inner = mainMatch[1];
  const courtMatch = inner.match(/<!-- spt-court-record -->[\s\S]*?<!-- \/spt-court-record -->/);
  const court = courtMatch ? `${courtMatch[0]}\n` : "";
  const bodyOnly = stripBlogCourtCard(inner);
  const nextBody = ensureRelatedGuides(bodyOnly, post, manifest);
  if (nextBody === bodyOnly.trim()) continue;
  const nextMain = `${court}${nextBody}`;
  writeFileSync(path, html.replace(mainMatch[0], `<main id="main" class="prose">\n\n${nextMain}\n    </main>`));
  updated++;
}
console.log(`apply-blog-related · ${updated} updated`);
