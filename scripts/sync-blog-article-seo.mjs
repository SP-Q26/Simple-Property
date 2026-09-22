#!/usr/bin/env node
/** Ensure each blog post has Article JSON-LD (idempotent). */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");

for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const path = join(blogDir, file);
  let html = readFileSync(path, "utf8");
  if (html.includes('"@type": "Article"')) continue;
  const slug = file.replace(".html", "");
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/ · Simple Property Tools$/, "") : slug;
  const descMatch = html.match(/name="description" content="([^"]+)"/);
  const desc = descMatch ? descMatch[1] : title;
  const url = `https://simpleproperty.tools/blog/${slug}`;
  const block = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":${JSON.stringify(title)},"author":{"@type":"Organization","name":"Simple Property Tools"},"publisher":{"@type":"Organization","name":"Simple Property Tools"},"mainEntityOfPage":${JSON.stringify(url)},"description":${JSON.stringify(desc)}}</script>\n`;
  html = html.replace("</head>", block + "</head>");
  if (!html.includes("og:image")) {
    html = html.replace(
      "<link rel=\"canonical\"",
      `<meta property="og:image" content="https://simpleproperty.tools/og/spt-card.svg">\n  <link rel="canonical"`
    );
  }
  writeFileSync(path, html);
  console.log("patched", file);
}
