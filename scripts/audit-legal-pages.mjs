#!/usr/bin/env node
/** Legal pages live on apex · footers · sitemap */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

function need(label, ok) {
  if (!ok) {
    console.error("LEGAL FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

for (const page of ["terms.html", "privacy.html", "legal.html"]) {
  const h = read(page);
  need(`${page} canonical`, h.includes("simple-property.com"));
  need(`${page} prose-legal`, h.includes("prose-legal"));
  need(`${page} footer privacy+terms`, h.includes('href="/privacy"') && h.includes('href="/terms"'));
}

const sm = read("sitemap.xml");
need("sitemap privacy", sm.includes("/privacy"));
need("sitemap terms", sm.includes("/terms"));
need("sitemap legal", sm.includes("/legal"));

const vercel = read("vercel.json");
need("vercel rewrite privacy", vercel.includes('"/privacy"'));
need("vercel rewrite terms", vercel.includes('"/terms"'));
need("vercel rewrite legal", vercel.includes('"/legal"'));

for (const page of ["index.html", "pricing.html", "app.html"]) {
  const h = read(page);
  need(`${page} footer terms`, h.includes('href="/terms"'));
  need(`${page} footer privacy`, h.includes('href="/privacy"'));
}

console.log(fail ? `\nLegal audit FAILED (${fail})` : "\nLegal audit OK");
process.exit(fail ? 1 : 0);
