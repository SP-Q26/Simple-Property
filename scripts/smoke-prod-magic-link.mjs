#!/usr/bin/env node
/** Live smoke · magic-link POST returns generic OK (no real mail sent). */
const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");

console.log("Magic-link smoke base:", BASE);

const res = await fetch(BASE + "/api/auth/magic-link", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "smoke-probe@example.com" }),
});
const data = await res.json().catch(() => ({}));
console.log("HTTP", res.status, data.ok ? "ok:true" : "ok:missing");

if (res.status !== 200 || !data.ok) {
  console.error("Magic-link smoke FAILED (expected 200 + ok:true)");
  process.exit(1);
}
if (!String(data.message || "").includes("15-minute")) {
  console.error("Magic-link smoke FAILED (unexpected message shape)");
  process.exit(1);
}
console.log("Magic-link smoke OK");
process.exit(0);
