#!/usr/bin/env node
/** Bump ai-bus + ai-discovery blog counts from manifest · run after build-blog-seo. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TAGLINE, STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
const count = manifest.posts.length;

const busPath = join(web, "spt-ai-bus.json");
const bus = JSON.parse(readFileSync(busPath, "utf8"));
bus.version = 3;
bus.blog_post_count = count;
bus.blog_pillars = ["law", "landlord", "renter", "news", "pain", "city"];
bus.hook = `${BRAND_TAGLINE} · ${STATE_ONLY_COUNT} states + DC deposit packets.`;
if (!bus.agent_read_order.includes("https://simple-property.com/blog/feed.rss")) {
  bus.agent_read_order.splice(3, 0, "https://simple-property.com/blog/feed.rss");
}
writeFileSync(busPath, JSON.stringify(bus, null, 2) + "\n");

const discPath = join(web, ".well-known/ai-discovery.json");
const disc = JSON.parse(readFileSync(discPath, "utf8"));
disc.blog_post_count = count;
disc.updated = new Date().toISOString().slice(0, 10);
writeFileSync(discPath, JSON.stringify(disc, null, 2) + "\n");

console.log("sync-mcp-discovery · ai-bus v3 · blog_post_count", count);
