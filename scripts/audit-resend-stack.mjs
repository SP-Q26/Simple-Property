#!/usr/bin/env node
/**
 * Resend + Deposit Desk email stack · code gates + optional live health smoke.
 * MCP domain verification is manual in Resend dashboard or via Resend MCP after OAuth.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const BASE = (process.env.SMOKE_BASE || "https://simple-property.com").replace(/\/$/, "");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("RESEND STACK FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

const resendJs = readFileSync(join(web, "lib/resend.mjs"), "utf8");
const feedbackJs = readFileSync(join(web, "api/feedback.js"), "utf8");
const envEx = readFileSync(join(web, ".env.example"), "utf8");

need("resend.mjs send helper", resendJs.includes("api.resend.com/emails"));
need("resend reply_to support", resendJs.includes("reply_to"));
need("feedback uses replyTo", feedbackJs.includes("replyTo: email"));
need("magic link sender", resendJs.includes("sendMagicLinkEmail"));
need("reminder sender", resendJs.includes("sendDeadlineReminderEmail"));
need("env example RESEND_API_KEY", envEx.includes("RESEND_API_KEY"));
need("env example SPT_EMAIL_FROM", envEx.includes("SPT_EMAIL_FROM"));

for (const route of [
  "api/auth/magic-link.js",
  "api/reminders/subscribe.js",
  "api/cron/[job].js",
  "api/feedback.js",
  "api/packet/email-tenant.js",
]) {
  need(`route ${route}`, existsSync(join(web, route)));
}

console.log("\n── Live health (", BASE, ") ──\n");
try {
  const res = await fetch(`${BASE}/api/health/services`, { headers: { Accept: "application/json" } });
  const health = await res.json();
  need("GET /api/health/services 200", res.status === 200);
  need("health resend key present", health.checks?.resend === true);
  need("health emailFrom set", health.checks?.emailFrom === true);
  need("health kv (feedback backup)", health.checks?.kv === true);
  need("health ready aggregate", health.ready === true);
} catch (e) {
  need("health fetch", false, String(e.message || e));
}

console.log(fail ? `\nResend stack audit FAILED (${fail})` : "\nResend stack audit OK");
process.exit(fail ? 1 : 0);
