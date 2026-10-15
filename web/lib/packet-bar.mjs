/**
 * Packet Bar Sweep · PBS v1 · shared receipt finalize actions.
 * Canon: docs/receipt-rail/PACKET_BAR_SWEEP_v1.md
 */
import { suggestVerdict } from "./receipt-spine.mjs";
import { sumPacketDeductions, copyTextForAi } from "./packet-report.mjs";
import { trackPacketBar, hashReceiptId } from "./spt-telemetry.mjs";

export const PBS_V1 = "pbs_v1";
export const PBS_TSV_COLUMNS = [
  "receipt_id",
  "brand",
  "template_id",
  "captured_at",
  "verdict",
  "share_url",
  "verify_url",
  "content_hash",
];

export const DEPOSIT_DESK_BRAND = "deposit_desk";
export const DEPOSIT_DESK_TEMPLATE_ID = "deposit_deduction_exhibit";

export function depositDeskVerdict(draft) {
  const sections = (draft?.rooms || []).map((r) => {
    const c = String(r.condition || "good").toLowerCase();
    if (c === "poor") return { condition: "poor" };
    if (c === "fair") return { condition: "fair" };
    return { condition: "good" };
  });
  let verdict = suggestVerdict(sections);
  if (sumPacketDeductions(draft?.deductions) > 0) return "FILE";
  return verdict || "FILE";
}

export function stablePacketHashPayload(draft, deadline) {
  return {
    receipt_id: draft?.id,
    template_id: DEPOSIT_DESK_TEMPLATE_ID,
    brand: DEPOSIT_DESK_BRAND,
    property: {
      street: draft?.property?.street,
      city: draft?.property?.city,
      state: draft?.property?.state,
      zip: draft?.property?.zip,
    },
    tenant: draft?.tenant?.name,
    surrenderDate: draft?.surrenderDate,
    deadline: deadline?.deadline,
    jurisdiction: deadline?.jurisdiction,
    deposit: draft?.deposit?.amount,
    deductions: (draft?.deductions || []).map((d) => ({
      category: d.category,
      description: d.description,
      amount: d.amount,
    })),
    signatures: draft?.signatures,
    mailProof: draft?.mailProof,
  };
}

export async function sha256ContentHash(payload) {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256:${hex}`;
}

function tsvCell(value) {
  const s = String(value ?? "");
  if (/[\t\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * @param {object} row keys matching PBS_TSV_COLUMNS
 */
export function formatPbsTsvRow(row) {
  return PBS_TSV_COLUMNS.map((key) => tsvCell(row[key])).join("\t");
}

/**
 * @param {{ draft: object, deadline: object|null, shareUrl: string, verifyUrl?: string, capturedAt?: string }} input
 */
export async function buildDepositDeskPbsRow(input) {
  const captured_at = input.capturedAt || new Date().toISOString();
  const share_url = input.shareUrl;
  const verify_url = input.verifyUrl || share_url;
  const content_hash = await sha256ContentHash(stablePacketHashPayload(input.draft, input.deadline));
  return {
    receipt_id: input.draft.id,
    brand: DEPOSIT_DESK_BRAND,
    template_id: DEPOSIT_DESK_TEMPLATE_ID,
    captured_at,
    verdict: depositDeskVerdict(input.draft),
    share_url,
    verify_url,
    content_hash,
  };
}

/**
 * @param {object} row PBS row object
 * @param {string} aiMarkdown from buildPacketAiReport
 */
export function buildAiPasteV1(row, aiMarkdown) {
  return {
    schema: "ai_paste_v1",
    receipt_id: row.receipt_id,
    brand: row.brand,
    template_id: row.template_id,
    captured_at: row.captured_at,
    verdict: row.verdict,
    share_url: row.share_url,
    verify_url: row.verify_url,
    content_hash: row.content_hash,
    exports: {
      ai_paste_v1: aiMarkdown,
    },
  };
}

/**
 * @param {{ showIcs?: boolean, printLocked?: boolean }} opts
 */
export function renderPacketBarHtml(opts = {}) {
  const showIcs = Boolean(opts.showIcs);
  const printLabel = opts.printLocked ? "Print / PDF (preview)" : "Print / PDF";
  const icsBtn = showIcs
    ? `<button type="button" class="btn btn-secondary" data-pbs="ics">Download .ics</button>`
    : "";
  const hint =
    opts.hint ||
    "Portfolio row pastes into Google Sheets in one step · link reopens this packet on step 5 · not legal advice.";
  const barId = opts.barId || "spt-packet-bar";
  return `<div class="packet-bar" id="${barId}" role="toolbar" aria-label="Packet actions">
  <button type="button" class="btn btn-secondary" data-pbs="copy-link">Copy link</button>
  <button type="button" class="btn btn-secondary" data-pbs="copy-tsv">Copy row (TSV)</button>
  <button type="button" class="btn btn-primary" data-pbs="print">${printLabel}</button>
  ${icsBtn}
</div>
<p class="field-hint packet-bar-hint">${hint}</p>`;
}

/**
 * @param {HTMLElement} root
 * @param {{
 *   getRow: () => Promise<object>,
 *   onPrint: (mode: "preview"|"final") => void,
 *   onIcs?: () => void,
 *   printLocked?: boolean,
 *   onStatus?: (msg: string) => void,
 * }} handlers
 */
export function bindPacketBar(root, handlers) {
  if (!root) return;

  const status = (msg) => handlers.onStatus?.(msg);

  root.querySelector('[data-pbs="copy-link"]')?.addEventListener("click", async () => {
    const row = await handlers.getRow();
    handlers.onFinalizeAttempt?.(row);
    try {
      await copyTextForAi(row.share_url);
      trackPacketBar("copy_link", handlers.telemetryExtra || {});
      status("Link copied · share with counsel or paste into email.");
    } catch {
      handlers.onFinalizeFail?.("copy_link");
      status("Could not copy link · allow clipboard access.");
    }
  });

  root.querySelector('[data-pbs="copy-tsv"]')?.addEventListener("click", async () => {
    const row = await handlers.getRow();
    const line = formatPbsTsvRow(row);
    handlers.onFinalizeAttempt?.(row);
    try {
      await copyTextForAi(line);
      trackPacketBar("copy_tsv", handlers.telemetryExtra || {});
      const receipt_id_hash = await hashReceiptId(row.receipt_id);
      handlers.onFinalizeSuccess?.({ receipt_id_hash, verdict: row.verdict });
      status("TSV row copied · paste into Google Sheets (cell A1).");
    } catch {
      handlers.onFinalizeFail?.("copy_tsv");
      status("Could not copy TSV row.");
    }
  });

  root.querySelector('[data-pbs="print"]')?.addEventListener("click", () => {
    const mode = handlers.printLocked ? "preview" : "final";
    trackPacketBar("pdf", handlers.telemetryExtra || {});
    handlers.onPrint(mode);
  });

  root.querySelector('[data-pbs="ics"]')?.addEventListener("click", () => {
    trackPacketBar("ics");
    handlers.onIcs?.();
  });
}
