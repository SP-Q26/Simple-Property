#!/usr/bin/env node
/**
 * Product sweep · customer voice + SEO layers + blog/discovery (organic growth gate).
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const steps = [
  "audit-customer-voice.mjs",
  "audit-seo-sweep.mjs",
  "audit-blog-seo.mjs",
  "audit-discovery-seo.mjs",
  "audit-pain-copy.mjs",
  "audit-state-blog-coverage.mjs",
];

console.log("── Product sweep (SEO + customer voice) ──\n");
for (const script of steps) {
  console.log(`\n▶ ${script}`);
  const r = spawnSync(process.execPath, [join(root, "scripts", script)], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log("\nProduct sweep OK");
