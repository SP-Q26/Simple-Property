#!/usr/bin/env node
/**
 * Print funnel rollup report from KV (local or prod via env).
 * Usage: node scripts/report-funnel-weekly.mjs [days]
 * Needs KV_REST_API_URL + KV_REST_API_TOKEN in web/.env.local or env.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, "web", ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const days = Math.min(30, Math.max(1, parseInt(process.argv[2] || "7", 10) || 7));
const mod = await import(pathToFileURL(join(root, "web", "lib", "funnel-rollups.mjs")).href);
const report = await mod.buildFunnelReport(days);

console.log(JSON.stringify(report, null, 2));

if (!report.kv) {
  console.error("\nKV not configured · set KV_REST_* on Vercel or web/.env.local");
  process.exit(2);
}
