#!/usr/bin/env node
/**
 * Agent / MCP discoverability audit · ai-bus · gospel · ai-discovery · llms · blog bus.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("MCP FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  const p = join(web, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

console.log("── MCP · agent discovery audit ──\n");

const r = spawnSync(process.execPath, [join(root, "scripts", "audit-discovery-seo.mjs")], {
  stdio: "inherit",
});
if (r.status !== 0) fail++;

let bus;
try {
  bus = JSON.parse(read("spt-ai-bus.json"));
  need("ai-bus JSON valid", bus.schema === "spt-ai-bus");
  need("ai-bus blog_feed", Boolean(bus.blog_feed));
  need("ai-bus guides URL", bus.guides?.includes("/blog"));
  need("ai-bus primary_cta /app", bus.primary_cta?.includes("/app"));
} catch {
  need("ai-bus JSON parse", false);
}

let gospel;
try {
  gospel = JSON.parse(read(".well-known/spt-gospel.json"));
  need("gospel tagline Beat the clock", String(gospel.tagline || "").includes("Beat the clock"));
  need("gospel surfaces include bus", (gospel.surfaces || []).some((u) => u.includes("spt-ai-bus")));
} catch {
  need("gospel JSON parse", false);
}

let discovery;
try {
  discovery = JSON.parse(read(".well-known/ai-discovery.json"));
  need("ai-discovery blog_feed endpoint", Boolean(discovery.endpoints?.blog_feed));
  need("ai-discovery read_order has blog", (discovery.read_order || []).some((u) => u.includes("/blog")));
} catch {
  need("ai-discovery JSON parse", false);
}

const manifest = JSON.parse(read("data/blog-manifest.json") || "{}");
const postCount = manifest.posts?.length || 0;
need("manifest posts ≥ 100", postCount >= 100);
if (bus && typeof bus.blog_post_count === "number") {
  need("ai-bus blog_post_count matches manifest", bus.blog_post_count === postCount);
} else {
  console.log("note: run sync:mcp-discovery to set ai-bus blog_post_count");
}

const llms = read("llms.txt");
need("llms.txt blog path", llms.includes("/blog"));
need("llms.txt ai-bus ref", llms.includes("spt-ai-bus.json"));

console.log(fail ? `\nMCP audit FAILED (${fail})` : `\nMCP audit OK · ${postCount} blog posts in manifest`);
process.exit(fail ? 1 : 0);
