#!/usr/bin/env node
/** Related reading blocks · state clusters · news cross-links. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("BLOG RELATED FAIL:", label);
    fail++;
  }
}

for (const post of manifest.posts) {
  const path = join(web, "blog", `${post.slug}.html`);
  if (!existsSync(path)) {
    need(`missing ${post.slug}`, false);
    continue;
  }
  const html = readFileSync(path, "utf8");
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;

  if (post.states?.length) {
    need(`${post.slug} related block`, main.includes("spt-related-guides"));
    const liCount = (main.match(/guide-related[\s\S]*?<\/aside>/i)?.[0] || "").match(/<li>/g)?.length || 0;
    need(`${post.slug} related links >= 2`, liCount >= 2);
  }

  if (post.category === "news") {
    need(`${post.slug} news links guides`, /href="\/blog\//.test(main));
    need(`${post.slug} news app or modules CTA`, /href="\/(app|modules|pricing)"/.test(main));
  }
}

const blogIndex = readFileSync(join(web, "blog/index.html"), "utf8");
need(
  "blog index news or updates cluster",
  blogIndex.includes("deposit-desk-new-states") ||
    blogIndex.includes("law-watch") ||
    blogIndex.includes("News") ||
    blogIndex.includes("October 2026")
);

console.log(fail ? `\nBlog related audit FAILED (${fail})` : "\nBlog related audit OK");
process.exit(fail ? 1 : 0);
