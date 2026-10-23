#!/usr/bin/env node
/**
 * Growth train · compare + statutes series · FB attribution · full audit gate.
 * Run before deploy when FB/paid traffic is active.
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(nodeScript, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(process.execPath, [join(root, "scripts", nodeScript)], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function npm(script, label) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync("npm", ["run", script], { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("── Growth train Oct 2026 ──\n");

run("assign-compare-route-series.mjs", "tag compare routeSeries");
run("generate-route-series-statutes-oct-2026.mjs", "statutes route series");
run("apply-blog-goal-copy.mjs", "goal copy + compare CTAs");
run("build-blog-seo.mjs", "blog hub + sitemap + vercel rewrites");
run("sync-site-chrome.mjs", "site chrome + analytics");
run("sync-site-head.mjs", "CSS v bump on pages");

run("audit-money-path.mjs", "money path P1");
run("audit-fb-growth.mjs", "FB growth wiring");
run("audit-route-series.mjs", "route series counts");
run("audit-links-full.mjs", "full internal links");
run("audit-blog-hub-filter.mjs", "blog hub filter");
run("audit-analytics-coverage.mjs", "analytics coverage");

npm("audit", "full npm audit swarm");

npm("smoke:prod", "production smoke");

console.log("\n── Growth train OK ──");
