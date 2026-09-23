#!/usr/bin/env node
/** Push manifest title + description into each blog article head. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));

for (const post of manifest.posts) {
  const path = join(web, "blog", `${post.slug}.html`);
  let html = readFileSync(path, "utf8");
  const title = `${post.title} · Simple Property Tools`;
  const desc = post.description;
  const url = `https://simple-property.com/blog/${post.slug}`;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace(/name="description" content="[^"]*"/, `name="description" content="${desc.replace(/"/g, "&quot;")}"`);
  html = html.replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${post.title.replace(/"/g, "&quot;")}"`);
  html = html.replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${post.title.replace(/"/g, "&quot;")}"`);
  if (html.includes('property="og:description"')) {
    html = html.replace(
      /property="og:description" content="[^"]*"/,
      `property="og:description" content="${desc.replace(/"/g, "&quot;")}"`
    );
  }
  if (html.includes('name="twitter:description"')) {
    html = html.replace(
      /name="twitter:description" content="[^"]*"/,
      `name="twitter:description" content="${desc.replace(/"/g, "&quot;")}"`
    );
  }
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      datePublished: post.published,
      dateModified: post.updated || post.published,
      author: { "@type": "Organization", name: "Simple Property Tools" },
      publisher: { "@type": "Organization", name: "Simple Property Tools" },
      mainEntityOfPage: url,
      description: desc,
    })}</script>`
  );
  writeFileSync(path, html);
  console.log("meta", post.slug);
}
