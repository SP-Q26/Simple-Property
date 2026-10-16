#!/usr/bin/env node
/**
 * Deadline reminders stack · Resend + KV + cron + wizard UI.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("REMINDERS SYSTEM FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

const paths = [
  "api/ops.js",
  "api/reminders/subscribe.js",
  "api/cron/[job].js",
  "lib/reminder-store.mjs",
  "lib/resend.mjs",
  "lib/kv-client.mjs",
];

for (const p of paths) need(`file ${p}`, existsSync(join(web, p)));

const subscribe = readFileSync(join(web, "api/reminders/subscribe.js"), "utf8");
const cron = readFileSync(join(web, "lib/cron-jobs.mjs"), "utf8");
const vercel = readFileSync(join(web, "vercel.json"), "utf8");
const appJs = readFileSync(join(web, "app.js"), "utf8");
const envEx = readFileSync(join(web, ".env.example"), "utf8");

need("subscribe checks resend", subscribe.includes("resendConfigured"));
need("subscribe checks kv", subscribe.includes("kvConfigured"));
need("subscribe schedules offsets", subscribe.includes("[7, 1]") || subscribe.includes("offsets"));
need("reminder store kv persist", readFileSync(join(web, "lib/reminder-store.mjs"), "utf8").includes("kv_set_failed"));
need("subscribe kv write error", subscribe.includes("reminders_storage_failed"));
need("cron auth bearer", cron.includes("authorization") && cron.includes("CRON_SECRET"));
need("cron sends via resend", cron.includes("sendDeadlineReminderEmail"));
need("vercel cron path", vercel.includes("/api/cron/deadline-reminders"));
need("env example resend", envEx.includes("RESEND_API_KEY"));
need("env example kv", envEx.includes("KV_REST_API"));
need("wizard remind button", appJs.includes("btn-remind"));
need("wizard pm toggle", appJs.includes("rem-use-pm") && appJs.includes("rem-pm-email"));
need("wizard reminder resolver", appJs.includes("reminderDeliveryEmailFromDom"));
need("draft reminders shape", appJs.includes("reminders: { usePmEmail"));

console.log(fail ? `\nReminders system audit FAILED (${fail})` : "\nReminders system audit OK");
process.exit(fail ? 1 : 0);
