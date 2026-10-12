#!/usr/bin/env node
/**
 * Packet wizard smoke · fixtures + prod /app.js contract checks.
 * Usage: SPT_SMOKE_URL=https://simple-property.com node scripts/smoke-packet-live.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPrintPacketInnerHtml } from "../web/lib/packet-report.mjs";
import { computeDeadline, normalizeStateCode } from "../web/lib/deposit-rules.mjs";

const BASE = (process.env.SPT_SMOKE_URL || "https://simple-property.com").replace(/\/$/, "");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("PACKET SMOKE FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sampleDraft(state) {
  const st = normalizeStateCode(state);
  return {
    id: `smoke-${st.toLowerCase()}-${Date.now()}`,
    property: {
      street: "1200 W Argyle St",
      city: "Chicago",
      state: st,
      zip: "60640",
      cityPreset: st === "IL" ? "chicago-il" : "",
      inChicago: st === "IL",
      unitCount: 4,
    },
    tenant: { name: "Jordan Lee", email: "tenant@example.com" },
    landlord: {
      name: "Oak Park Holdings LLC",
      email: "hello@simple-property.com",
      address: "PO Box 100, Chicago IL 60601",
    },
    lease: { start: "2025-04-01", end: "2026-03-31" },
    surrenderDate: "2026-03-15",
    deposit: { amount: "1450", heldAt: "First month's rent office" },
    deductions: [
      { category: "Cleaning", description: "Kitchen grease", amount: "120" },
      { category: "Repair", description: "Blind cord", amount: "45" },
    ],
    rooms: [
      { name: "Kitchen", condition: "Fair", notes: "Scuff on tile", photoLink: "", photo: null },
    ],
    photoAlbumLink: "",
    signatures: { landlordPrinted: "Oak Park Holdings LLC", tenantPrinted: "Jordan Lee", date: "2026-03-20" },
    mailProof: { mailedAt: "", method: "", tracking: "" },
  };
}

const STATES = ["IL", "FL", "CO", "WA", "TX", "NC"];

for (const st of STATES) {
  const draft = sampleDraft(st);
  const deadline = computeDeadline({
    surrenderDate: draft.surrenderDate,
    state: draft.property.state,
    inChicago: draft.property.inChicago,
    cityPreset: draft.property.cityPreset,
  });
  const html = buildPrintPacketInnerHtml(draft, deadline, esc);
  need(`${st} packet has property line`, html.includes("1200 W Argyle"));
  need(`${st} packet has tenant`, html.includes("Jordan Lee"));
  need(`${st} packet has deductions`, html.includes("Itemized deductions"));
  need(`${st} packet has return total`, html.includes("Return to tenant"));
  need(`${st} deadline line`, Boolean(deadline.deadline) && html.includes("Return or itemize"));
}

const localApp = readFileSync(join(root, "web/app.js"), "utf8");
need("local finishWizard", localApp.includes("function finishWizard"));
need("local screen packet preview", localApp.includes("packet-screen-preview"));
need("local done calls finishWizard", /step >= MAX_STEPS[\s\S]{0,80}finishWizard/.test(localApp));

let remoteApp = "";
try {
  const res = await fetch(`${BASE}/app.js`, { redirect: "follow" });
  remoteApp = await res.text();
  need("prod app.js 200", res.ok);
} catch (e) {
  need("prod app.js fetch", false);
  console.error(e.message);
}

if (remoteApp) {
  need("prod finishWizard", remoteApp.includes("function finishWizard"));
  need("prod packet-screen-preview", remoteApp.includes("packet-screen-preview"));
  need("prod btn-print-preview", remoteApp.includes("btn-print-preview"));
  need("prod preview refresh hook", remoteApp.includes("refreshExportStepPreviews"));
  need("prod screen preview marker", remoteApp.includes("data-spt-preview-body"));
  need("prod full itemization on export", remoteApp.includes("renderItemizationPreview(false)"));
}

const doorCss = readFileSync(join(root, "web/spt-door-arrival.css"), "utf8");
need("door hides hero SP during lock", doorCss.includes("spt-door-arrival-lock") && doorCss.includes("spt-door-monogram"));

const fallback = readFileSync(join(root, "web/lottie/spt-door-arrival-fallback.svg"), "utf8");
need("fallback svg no SP text", !fallback.includes(">SP<"));

console.log(fail ? `\nPacket smoke FAILED (${fail})` : "\nPacket smoke OK");
process.exit(fail ? 1 : 0);
