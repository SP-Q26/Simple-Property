#!/usr/bin/env node
/**
 * Live smoke · Resend + KV + reminders subscribe + cron gate.
 * Requires production redeploy after Vercel env changes.
 */
const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");

function fail(msg) {
  console.error("REMINDERS SMOKE FAIL:", msg);
  process.exit(1);
}

console.log("Reminders smoke base:", BASE);

const healthRes = await fetch(`${BASE}/api/health/services`, { headers: { Accept: "application/json" } });
const health = await healthRes.json().catch(() => ({}));
if (!healthRes.ok) fail(`health HTTP ${healthRes.status}`);

console.log("health checks:", JSON.stringify(health.checks, null, 2));
if (!health.checks?.resend) fail("resend not configured on deployment (add RESEND_API_KEY + redeploy)");
if (!health.checks?.kv) fail("kv not configured on deployment (connect Upstash + redeploy)");

const subRes = await fetch(`${BASE}/api/reminders/subscribe`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "smoke-probe@example.com",
    deadline: "2027-09-01",
    label: "live-smoke",
    jurisdiction: "IL",
  }),
});
const sub = await subRes.json().catch(() => ({}));
console.log("subscribe:", subRes.status, sub);
if (subRes.status !== 200 || !sub.ok || typeof sub.scheduled !== "number" || sub.scheduled < 1) {
  fail(`subscribe expected 200 ok + scheduled>=1, got ${subRes.status} ${JSON.stringify(sub)}`);
}

const pastRes = await fetch(`${BASE}/api/reminders/subscribe`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "smoke-probe@example.com", deadline: "2020-01-01", label: "x" }),
});
const past = await pastRes.json().catch(() => ({}));
if (pastRes.status !== 400 || past.error !== "deadline_in_past") {
  fail(`past deadline expected 400 deadline_in_past, got ${pastRes.status} ${JSON.stringify(past)}`);
}
console.log("subscribe validation (past deadline): OK");

const cronRes = await fetch(`${BASE}/api/cron/deadline-reminders`);
const cron = await cronRes.json().catch(() => ({}));
if (cronRes.status !== 401 || cron.error !== "unauthorized") {
  fail(`cron without auth expected 401 unauthorized, got ${cronRes.status}`);
}
console.log("cron auth gate: OK");

const getSub = await fetch(`${BASE}/api/reminders/subscribe`);
if (getSub.status !== 405) fail(`GET subscribe expected 405, got ${getSub.status}`);
console.log("subscribe method gate: OK");

console.log("\nReminders live smoke OK (resend + kv + enqueue)");
process.exit(0);
