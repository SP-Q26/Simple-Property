#!/usr/bin/env node
/**
 * Re-wrap every blog post body in articleShell (CSS v40 · dual brand tag · nav scripts).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const manifest = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "web", "data", "blog-manifest.json"), "utf8")
);

let refreshed = 0;
for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const path = join(blogDir, file);
  const html = readFileSync(path, "utf8");
  const slug = file.replace(".html", "");
  const post = manifest.posts.find((p) => p.slug === slug);
  if (!post) {
    console.warn("skip (no manifest row)", slug);
    continue;
  }
  const mainMatch = html.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) {
    console.warn("skip (no main)", slug);
    continue;
  }
  let bodyHtml = mainMatch[1].trim();
  // Keep in-body CTAs; sync-blog-article-seo adds disclaimer if absent.

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = (titleMatch ? titleMatch[1] : post.title).replace(/ · Simple Property Tools$/, "");
  const descMatch = html.match(/name="description" content="([^"]+)"/);
  const description = post.description || (descMatch ? descMatch[1] : title);
  const dateMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  const published = dateMatch ? dateMatch[1] : post.published;

  const next = articleShell({ title, description, slug, published, bodyHtml });
  if (next !== html) {
    writeFileSync(path, next);
    refreshed++;
    console.log("refresh", slug);
  }
}

console.log(`refresh-all-blog-shells · ${refreshed} updated`);
