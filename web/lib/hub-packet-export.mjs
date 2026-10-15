/**
 * Condition hub · PBS row + print + Deposit Desk handoff (alpha).
 * Canon: docs/receipt-rail/CONDITION_HUB_ROADMAP_2026-10.md
 */
import { sha256ContentHash } from "./packet-bar.mjs";
import { suggestVerdict } from "./receipt-spine.mjs";

import { HUB_DESK_HANDOFF_KEY } from "./hub-desk-handoff.mjs";

export const CONDITION_HUB_BRAND = "condition_hub";
export { HUB_DESK_HANDOFF_KEY };

export function hubShareUrl(receiptId) {
  const origin = typeof location !== "undefined" ? location.origin : "https://simple-property.com";
  return `${origin}/hub#/receipts/${receiptId}/done`;
}

function stableHubHashPayload(receipt) {
  return {
    receipt_id: receipt.id,
    template_id: receipt.templateId,
    brand: CONDITION_HUB_BRAND,
    sections: (receipt.sections || []).map((s) => ({
      key: s.key,
      condition: s.condition,
      notes: s.notes,
    })),
    verdict: receipt.verdict,
    finalizedAt: receipt.finalizedAt,
  };
}

/** @param {import("./receipt-spine.mjs").Receipt} receipt finalized */
export async function buildHubPbsRow(receipt) {
  const share_url = hubShareUrl(receipt.id);
  const content_hash = await sha256ContentHash(stableHubHashPayload(receipt));
  return {
    receipt_id: receipt.id,
    brand: CONDITION_HUB_BRAND,
    template_id: receipt.templateId,
    captured_at: receipt.finalizedAt || new Date().toISOString(),
    verdict: receipt.verdict || suggestVerdict(receipt.sections),
    share_url,
    verify_url: share_url,
    content_hash,
  };
}

/**
 * Stash non-PII property hints for a future Deposit Desk import (session only).
 * @param {{ property?: { address?: string, city?: string, state?: string }, tenancy?: { leaseEnd?: string, surrenderDate?: string } } | null} chain
 */
export function writeHubDeskHandoff(chain, receipt) {
  const payload = {
    ref: "condition_hub",
    receiptId: receipt.id,
    templateId: receipt.templateId,
    at: new Date().toISOString(),
    property: chain?.property
      ? {
          street: chain.property.address,
          city: chain.property.city,
          state: chain.property.state,
        }
      : null,
    tenancy: chain?.tenancy
      ? { leaseEnd: chain.tenancy.leaseEnd || "", surrenderDate: chain.tenancy.surrenderDate || "" }
      : null,
  };
  try {
    sessionStorage.setItem(HUB_DESK_HANDOFF_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function depositDeskHandoffUrl() {
  return "/app?ref=condition-hub";
}

/**
 * @param {{ moveIn: object, moveOut: object }} pair finalized receipts
 */
export function compareReceiptSections(moveIn, moveOut) {
  const index = (receipt) => {
    const m = new Map();
    for (const s of receipt?.sections || []) {
      m.set(s.key || s.label, s);
    }
    return m;
  };
  const a = index(moveIn);
  const b = index(moveOut);
  const keys = [...new Set([...a.keys(), ...b.keys()])];
  return keys.map((key) => {
    const sIn = a.get(key);
    const sOut = b.get(key);
    const changed = (sIn?.condition || "") !== (sOut?.condition || "");
    return {
      key,
      label: sIn?.label || sOut?.label || key,
      moveInCondition: sIn?.condition || "-",
      moveOutCondition: sOut?.condition || "-",
      changed,
      moveInNotes: sIn?.notes || "",
      moveOutNotes: sOut?.notes || "",
    };
  });
}

/**
 * @param {{ receipt: object, chain: object|null, templateLabel: string }} ctx
 */
export function buildHubPrintHtml(ctx) {
  const { receipt, chain, templateLabel } = ctx;
  const place = [chain?.property?.label, chain?.unit?.label].filter(Boolean).join(" · ");
  const rows = (receipt.sections || [])
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.label)}</td><td>${escapeHtml(s.condition)}</td><td>${escapeHtml(s.notes || "")}</td><td>${escapeHtml(s.photoUrl || "")}</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(templateLabel)}</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;color:#111}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}h1{font-size:20px}p.meta{color:#444;font-size:13px}</style></head><body>
<h1>${escapeHtml(templateLabel)}</h1>
<p class="meta">${escapeHtml(place)} · Locked ${escapeHtml(receipt.finalizedAt?.slice(0, 10) || "")} · Outcome ${escapeHtml(receipt.verdict || "")}</p>
<p class="meta">Documentation only · not legal advice · Simple Property Tools · Condition hub</p>
<table><thead><tr><th>Room</th><th>Condition</th><th>Notes</th><th>Photo link</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}
