#!/usr/bin/env node
/**
 * Release train A+B · product depth + discovery (run before main deploy).
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  ["audit-packet-import.mjs", "packet import v2"],
  ["audit-logs-packet-columns.mjs", "logs packet CSV"],
  ["audit-blog-hub-filter.mjs", "blog hub filter"],
  ["sync-mcp-discovery.mjs", "AI bus sync"],
  ["audit-mcp.mjs", "MCP / llms"],
  ["audit-agent-snapshot.mjs", "wizard agent snapshot"],
  ["audit-agent-form-fill.mjs", "feedback agent form"],
  ["audit-seo-sweep.mjs", "SEO sweep"],
  ["audit-blog-seo.mjs", "blog SEO"],
  ["audit-discovery-seo.mjs", "discovery SEO"],
  ["audit-analytics-coverage.mjs", "analytics coverage"],
];

console.log("── Release train A+B ──\n");
for (const [script, label] of steps) {
  console.log(`▶ ${label}`);
  const r = spawnSync(process.execPath, [join(root, "scripts", script)], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("\n▶ smoke:prod");
let r = spawnSync("npm", ["run", "smoke:prod"], { cwd: root, stdio: "inherit", shell: true });
if (r.status !== 0) process.exit(r.status ?? 1);

console.log("\n▶ smoke:feedback");
r = spawnSync("npm", ["run", "smoke:feedback"], { cwd: root, stdio: "inherit", shell: true });
if (r.status !== 0) process.exit(r.status ?? 1);

console.log("\n▶ smoke:states-blogs");
r = spawnSync("npm", ["run", "smoke:states-blogs"], { cwd: root, stdio: "inherit", shell: true });
if (r.status !== 0) process.exit(r.status ?? 1);

console.log("\nRelease train A+B OK");
