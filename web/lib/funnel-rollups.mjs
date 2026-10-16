/**
 * Funnel counters in KV · no PII · powers weekly ROI report.
 * Canon: docs/receipt-rail/SIMPLE_PROPERTY_TELEMETRY_PBS_v1.md
 */
import { kvIncr, kvConfigured } from "./kv-incr.mjs";
import { kvGet } from "./kv-client.mjs";

const ALLOWED = new Set([
  "spt_page_view",
  "spt_blog_view",
  "spt_start_intent",
  "spt_module_click",
  "spt_guide_cta_click",
  "sp_wizard_start",
  "sp_wizard_step",
  "sp_finalize_attempt",
  "sp_finalize_success",
  "sp_finalize_fail",
  "paywall_view",
  "paywall_urgency",
  "unlock_scroll",
  "purchase_success",
  "hub_receipt_finalized",
  "hub_desk_handoff_click",
  "hub_spa_view",
  "spt_hub_handoff_applied",
  "packet_bar_copy_link",
  "packet_bar_copy_tsv",
  "packet_bar_pdf",
  "packet_bar_ics",
  "packet_bar_email_tenant",
  "checkout_intent",
  "checkout_click",
  "checkout_complete",
  "subscription_updated",
  "subscription_deleted",
  "subscription_renewal",
  "reminder_subscribe",
  "feedback_submit",
  "magic_link_request",
]);

export function funnelEventAllowed(name) {
  return ALLOWED.has(String(name || ""));
}

function utcDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function dayKeys(name, day) {
  return {
    total: `spt:funnel:total:${name}`,
    day: `spt:funnel:day:${day}:${name}`,
  };
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} [data]
 */
export async function recordFunnelEvent(name, data = {}) {
  if (!funnelEventAllowed(name)) return false;
  if (!kvConfigured()) return false;
  const day = utcDay();
  const keys = dayKeys(name, day);
  await kvIncr(keys.total);
  await kvIncr(keys.day);
  if (name === "spt_start_intent" && data.ref) {
    const ref = String(data.ref)
      .slice(0, 48)
      .replace(/[^a-z0-9_-]/gi, "_")
      .toLowerCase();
    if (ref) await kvIncr(`spt:funnel:ref:${ref}`);
  }
  return true;
}

async function readCounter(key) {
  const v = await kvGet(key);
  return Number(v) || 0;
}

/**
 * @param {number} days
 */
export async function buildFunnelReport(days = 7) {
  const names = [
    "spt_page_view",
    "spt_blog_view",
    "spt_start_intent",
    "sp_wizard_start",
    "sp_finalize_success",
    "paywall_view",
    "paywall_urgency",
    "checkout_intent",
    "checkout_complete",
    "purchase_success",
    "reminder_subscribe",
    "spt_hub_handoff_applied",
    "hub_desk_handoff_click",
    "hub_receipt_finalized",
  ];
  const totals = {};
  for (const n of names) {
    totals[n] = await readCounter(`spt:funnel:total:${n}`);
  }
  const daily = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const day = utcDay(d);
    const row = { day };
    for (const n of names) {
      row[n] = await readCounter(`spt:funnel:day:${day}:${n}`);
    }
    daily.push(row);
  }
  const starts = totals.spt_start_intent || totals.sp_wizard_start || 0;
  const conversions = {
    wizard_from_start: starts ? totals.sp_wizard_start / starts : null,
    finalize_from_wizard: totals.sp_wizard_start
      ? totals.sp_finalize_success / totals.sp_wizard_start
      : null,
    checkout_from_finalize: totals.sp_finalize_success
      ? totals.checkout_complete / totals.sp_finalize_success
      : null,
    checkout_from_start: starts ? totals.checkout_complete / starts : null,
  };
  return {
    generatedAt: new Date().toISOString(),
    kv: kvConfigured(),
    totals,
    daily,
    conversions,
    notes: "Ratios are approximate · server checkout_complete is source of truth for revenue",
  };
}
