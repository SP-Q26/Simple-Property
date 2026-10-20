#!/usr/bin/env node
/** Guides hub search + cluster filters. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("BLOG HUB FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const index = readFileSync(join(web, "blog/index.html"), "utf8");
const js = readFileSync(join(web, "blog-hub-filter.js"), "utf8");
const css = readFileSync(join(web, "simple-property.css"), "utf8");

need("blog hub script linked", index.includes("blog-hub-filter.js"));
need("blog_hub page marker", index.includes('data-spt-page="blog_hub"'));
need("filter script", js.includes("blog-hub-search") && js.includes("data-cluster"));
need("dedupe by href", js.includes("byHref") && js.includes("elements"));
need("cluster-route compare", js.includes("cluster-route"));
need("toolbar CSS", css.includes(".blog-hub-toolbar"));

console.log(fail ? `audit-blog-hub-filter FAILED (${fail})` : "audit-blog-hub-filter OK");
process.exit(fail ? 1 : 0);
