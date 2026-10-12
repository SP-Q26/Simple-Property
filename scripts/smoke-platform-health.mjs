#!/usr/bin/env node
/**
 * Production platform readiness · GET /api/health/services
 */
const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");

const res = await fetch(`${BASE}/api/health/services`, { headers: { Accept: "application/json" } });
const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  console.error("HEALTH FAIL: invalid JSON", res.status, text.slice(0, 200));
  process.exit(1);
}

if (!res.ok) {
  console.error("HEALTH FAIL: HTTP", res.status, data);
  process.exit(1);
}

console.log("health:", JSON.stringify(data.checks, null, 2));
if (!data.ready) {
  console.error("\nPlatform not fully ready · missing:", Object.entries(data.checks || {})
    .filter(([, v]) => !v)
    .map(([k]) => k)
    .join(", "));
  process.exit(1);
}
console.log("\nPlatform health OK");
process.exit(0);
