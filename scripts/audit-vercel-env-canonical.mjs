#!/usr/bin/env node
/**
 * Repo-side Vercel env audit · keys, roles, Stripe catalog parity, .env.example coverage.
 * Live Vercel state: filter_project_env (MCP) or Dashboard · smoke: GET /api/health/services
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  VERCEL_ENV_CANON,
  stripePriceEnvCanon,
  allCanonKeys,
} from "./lib/vercel-env-canon.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envExample = readFileSync(join(root, "web/.env.example"), "utf8");
const kvClient = readFileSync(join(root, "web/lib/kv-client.mjs"), "utf8");

let fail = 0;
function need(label, ok) {
  if (!ok) {
    console.error("VERCEL ENV FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

console.log("── Vercel env canonical audit (git) ──\n");

need("kv-client uses KV_REST_API_URL", kvClient.includes("KV_REST_API_URL"));
need("kv-client uses KV_REST_API_TOKEN", kvClient.includes("KV_REST_API_TOKEN"));
need("kv-client does not read REDIS_URL", !kvClient.includes("REDIS_URL"));
need("kv-client does not read KV_URL", !kvClient.includes("KV_URL"));

const requiredKeys = VERCEL_ENV_CANON.filter((r) => r.role === "required").map((r) => r.key);
for (const key of requiredKeys) {
  if (key.startsWith("STRIPE_") || key === "RESEND_API_KEY") continue;
  if (envExample.includes(`${key}=`) || envExample.includes(`# ${key}`)) {
    need(`env.example documents ${key}`, true);
  } else {
    need(`env.example documents ${key}`, false);
  }
}

for (const row of stripePriceEnvCanon()) {
  need(
    `env.example ${row.key} matches catalog ${row.sku}`,
    envExample.includes(row.key) && envExample.includes(row.livePriceId),
  );
}

const removeFromVercel = VERCEL_ENV_CANON.filter((r) => r.vercelRemove);
console.log("\nRemove from Vercel if still listed (not used by this repo):");
for (const row of removeFromVercel) {
  console.log(`  · ${row.key} — ${row.usedBy}`);
}
console.log(
  "\nKV runtime needs only KV_REST_API_URL + KV_REST_API_TOKEN.",
  "Mark KV_REST_API_TOKEN Sensitive in Dashboard if flagged readable-secret.",
);

console.log(`\nCanonical key count: ${allCanonKeys().length} (${stripePriceEnvCanon().length} Stripe prices)`);

console.log(fail ? `\nVercel env audit FAILED (${fail})` : "\nVercel env audit OK");
process.exit(fail ? 1 : 0);
