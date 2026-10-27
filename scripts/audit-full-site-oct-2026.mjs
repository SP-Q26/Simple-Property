#!/usr/bin/env node
/**
 * Full site audit swarm · SEO · blogs · spacing · growth · links.
 * Run before proud-ship deploy: node scripts/audit-full-site-oct-2026.mjs
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const STEPS = [
  ["assign-compare-route-series.mjs", "compare category + routeSeries"],
  ["audit-seo-sweep.mjs", "SEO meta sweep"],
  ["audit-blog-seo.mjs", "blog SEO swarm"],
  ["audit-discovery-seo.mjs", "discovery lane"],
  ["audit-mcp.mjs", "MCP / ai-bus"],
  ["audit-responsive-spacing.mjs", "spacing breakpoints"],
  ["audit-mobile-responsive.mjs", "mobile layout"],
  ["audit-ios-brand-spacing.mjs", "iOS spacing"],
  ["audit-mobile-extreme.mjs", "mobile extreme"],
  ["audit-social-share.mjs", "OG / social"],
  ["audit-blog-hub-filter.mjs", "blog hub filter"],
  ["audit-route-series.mjs", "route series"],
  ["audit-links-full.mjs", "internal links"],
  ["audit-fb-growth.mjs", "FB growth"],
  ["audit-court-record-strip.mjs", "court strip"],
  ["audit-blog-goal-copy.mjs", "blog goal copy"],
  ["audit-swarm.mjs", "swarm scoreboard"],
  ["audit-spt-web.mjs", "proud-ship P0"],
];

console.log("── Full site audit Oct 2026 ──\n");

for (const [script, label] of STEPS) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(process.execPath, [join(root, "scripts", script)], { stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`\nFAILED: ${script}`);
    process.exit(r.status ?? 1);
  }
}

console.log("\n── Full site audit OK ──\n");
