#!/usr/bin/env node
/**
 * National slug migration · 301 from legacy *-midwest* blog paths.
 * Run once: node scripts/migrate-national-blog-slugs.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const manifestPath = join(web, "data", "blog-manifest.json");
const vercelPath = join(web, "vercel.json");

const MAP = {
  "missed-deposit-deadline-midwest-small-landlord": "missed-deposit-deadline-small-landlord-multi-state",
  "move-in-move-out-fees-midwest-landlords": "move-in-move-out-fees-vs-security-deposit",
  "pet-deposits-security-deposit-midwest": "pet-deposits-vs-security-deposit-withholds",
  "application-fees-vs-security-deposit-midwest": "application-fees-vs-security-deposit",
};

function walkReplace(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules") continue;
      walkReplace(p);
      continue;
    }
    if (!/\.(html|json|mjs|md|rss|txt|yml|yaml)$/.test(name.name)) continue;
    let text = readFileSync(p, "utf8");
    let next = text;
    for (const [oldSlug, newSlug] of Object.entries(MAP)) {
      next = next.split(`/blog/${oldSlug}`).join(`/blog/${newSlug}`);
      next = next.split(oldSlug).join(newSlug);
    }
    if (next !== text) writeFileSync(p, next);
  }
}

for (const [oldSlug, newSlug] of Object.entries(MAP)) {
  const oldPath = join(blogDir, `${oldSlug}.html`);
  const newPath = join(blogDir, `${newSlug}.html`);
  if (!existsSync(oldPath)) continue;
  if (!existsSync(newPath)) {
    copyFileSync(oldPath, newPath);
  }
  let html = readFileSync(newPath, "utf8");
  html = html.replaceAll(`https://simple-property.com/blog/${oldSlug}`, `https://simple-property.com/blog/${newSlug}`);
  html = html.replaceAll(oldSlug, newSlug);
  writeFileSync(newPath, html);
  if (existsSync(oldPath) && oldSlug !== newSlug) unlinkSync(oldPath);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.posts = manifest.posts.map((p) => {
  if (MAP[p.slug]) return { ...p, slug: MAP[p.slug] };
  return p;
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

walkReplace(web);

const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const existing = new Set((vercel.redirects || []).map((r) => r.source));
for (const [oldSlug, newSlug] of Object.entries(MAP)) {
  const source = `/blog/${oldSlug}`;
  if (existing.has(source)) continue;
  vercel.redirects.push({
    source,
    destination: `/blog/${newSlug}`,
    permanent: true,
  });
  existing.add(source);
}
writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");

if (vercel.rewrites) {
  for (const [oldSlug, newSlug] of Object.entries(MAP)) {
    for (const rw of vercel.rewrites) {
      if (rw.destination === `/blog/${oldSlug}.html`) rw.destination = `/blog/${newSlug}.html`;
      if (rw.source === `/blog/${oldSlug}`) rw.source = `/blog/${newSlug}`;
    }
  }
  writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");
}
console.log("migrate-national-blog-slugs OK");
