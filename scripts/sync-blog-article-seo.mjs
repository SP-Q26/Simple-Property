#!/usr/bin/env node
/** Article JSON-LD (single block) · og:image · disclaimer line on every guide. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const DISCLAIMER =
  '<p class="disclaimer">Not legal advice. Confirm facts and deadlines with qualified counsel.</p>';

for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const path = join(blogDir, file);
  let html = readFileSync(path, "utf8");
  const slug = file.replace(".html", "");
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/ · Simple Property Tools$/, "") : slug;
  const descMatch = html.match(/name="description" content="([^"]+)"/);
  const desc = descMatch ? descMatch[1] : title;
  const url = `https://simple-property.com/blog/${slug}`;
  const dateMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  const published = dateMatch ? dateMatch[1] : "2026-09-01";

  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
  const block = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":${JSON.stringify(title)},"datePublished":${JSON.stringify(published)},"dateModified":${JSON.stringify(published)},"author":{"@type":"Organization","name":"Simple Property Tools"},"publisher":{"@type":"Organization","name":"Simple Property Tools"},"mainEntityOfPage":${JSON.stringify(url)},"description":${JSON.stringify(desc)}}</script>\n`;
  html = html.replace("</head>", block + "</head>");

  /* og/twitter: npm run sync:seo (sync-social-meta.mjs) */
  if (!html.match(/not legal advice/i)) {
    html = html.replace("</main>", `\n      ${DISCLAIMER}\n    </main>`);
  }
  if (!html.includes("feed.rss")) {
    html = html.replace(
      "<link rel=\"canonical\"",
      `<link rel="alternate" type="application/rss+xml" title="Simple Property Tools guides" href="/blog/feed.rss">\n  <link rel="canonical"`
    );
  }
  writeFileSync(path, html);
  console.log("synced", file);
}
