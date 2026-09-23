#!/usr/bin/env node
/** Article JSON-LD · citation / isBasedOn from manifest + statute-urls. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { STATUTE_URLS } from "../web/lib/statute-urls.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifest = JSON.parse(readFileSync(join(root, "web", "data", "blog-manifest.json"), "utf8"));
const DISCLAIMER =
  '<p class="disclaimer">Not legal advice. Confirm facts and deadlines with qualified counsel.</p>';

function legislationForPost(post) {
  const codes = post?.states?.length === 1 ? [post.states[0]] : [];
  if (!codes.length && post?.statutes?.length) {
    for (const [code, pack] of Object.entries(STATE_PACKS)) {
      if (post.statutes.some((s) => pack.cite.startsWith(s) || s.startsWith(pack.cite.slice(0, 8)))) {
        codes.push(code);
      }
    }
  }
  const code = codes[0];
  if (!code) return null;
  const pack = STATE_PACKS[code];
  const url = STATUTE_URLS[code];
  if (!pack || !url) return null;
  return { name: pack.cite, url, code };
}

for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const path = join(blogDir, file);
  let html = readFileSync(path, "utf8");
  const slug = file.replace(".html", "");
  const post = manifest.posts.find((p) => p.slug === slug);
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/ · Simple Property Tools$/, "") : slug;
  const descMatch = html.match(/name="description" content="([^"]+)"/);
  const desc = post?.description || (descMatch ? descMatch[1].replace(/<[^>]+>/g, "") : title);
  const url = `https://simple-property.com/blog/${slug}`;
  const dateMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  const published = dateMatch ? dateMatch[1] : post?.published || "2026-09-01";

  const law = legislationForPost(post);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: published,
    dateModified: post?.updated || published,
    author: { "@type": "Organization", name: "Simple Property Tools" },
    publisher: { "@type": "Organization", name: "Simple Property Tools" },
    mainEntityOfPage: url,
    description: desc,
  };
  if (law) {
    article.citation = [{ "@type": "CreativeWork", name: law.name, url: law.url }];
    article.isBasedOn = { "@type": "Legislation", name: law.name, url: law.url };
  }

  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
  const block = `<script type="application/ld+json">${JSON.stringify(article)}</script>\n`;
  html = html.replace("</head>", block + "</head>");

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
