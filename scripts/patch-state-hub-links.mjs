#!/usr/bin/env node
/** Inject state hub footer on guides that list a single primary state. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { hubFooterHtml } from "./lib/state-hub-links.mjs";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const manifest = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "web", "data", "blog-manifest.json"), "utf8")
);

const MARK = 'class="state-hub-links"';
let changed = 0;

for (const file of readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html")) {
  const path = join(blogDir, file);
  let html = readFileSync(path, "utf8");
  if (html.includes(MARK)) continue;
  const slug = file.replace(".html", "");
  const post = manifest.posts.find((p) => p.slug === slug);
  if (!post?.states?.length) continue;
  const code = post.states.length === 1 ? post.states[0] : post.states.find((c) => slug.includes(STATE_PACKS[c]?.label?.split(" ")[0]?.toLowerCase() || "zzz"));
  const primary = post.states.length === 1 ? post.states[0] : code || post.states[0];
  const label = STATE_PACKS[primary]?.label || primary;
  const block = hubFooterHtml(primary, label);
  if (!block) continue;
  if (!html.includes('class="disclaimer"')) continue;
  html = html.replace(/(\s*<p class="disclaimer">)/, `\n      ${block}\n$1`);
  writeFileSync(path, html);
  changed++;
  console.log("hub footer", file);
}
console.log(`patch-state-hub-links · ${changed} file(s)`);
