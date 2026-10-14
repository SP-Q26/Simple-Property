/**
 * Receipt Rail · entity spine (client alpha).
 * Mirrors docs/receipt-rail/LANE.md · server-backed target uses the same shapes.
 */

export const RECEIPT_STATUS = ["draft", "finalized", "superseded"];
export const CONDITION_VALUES = ["good", "fair", "poor", "na"];
export const VERDICT_VALUES = ["CLEAR", "FIX_LIST", "FILE"];

export function newId(prefix = "id") {
  const tail =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${tail}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function nowIso() {
  return new Date().toISOString();
}

/** @typedef {{ id: string, name: string, plan: string, unitCap: number }} Organization */
/** @typedef {{ id: string, orgId: string, label: string, address: string, state: string, city: string }} Property */
/** @typedef {{ id: string, propertyId: string, label: string }} Unit */
/** @typedef {{ id: string, unitId: string, tenantName: string, leaseStart: string, leaseEnd: string, surrenderDate: string }} Tenancy */
/** @typedef {{ id: string, key: string, label: string, condition: string, notes: string, photoUrl: string }} ReceiptSection */
/** @typedef {{ id: string, path: string, caption: string, capturedAt: string }} ReceiptMedia */
/** @typedef {{ id: string, receiptId: string, at: string, channel: string, status: string, note: string }} DeliveryLogEntry */
/** @typedef {{ id: string, receiptId: string, createdAt: string, watermarked: boolean }} ExportRecord */

/**
 * @typedef {Object} Receipt
 * @property {string} id
 * @property {string} orgId
 * @property {string} tenancyId
 * @property {string} templateId
 * @property {string} status
 * @property {string|null} parentReceiptId
 * @property {string|null} finalizedAt
 * @property {string|null} verdict
 * @property {ReceiptSection[]} sections
 * @property {ReceiptMedia[]} media
 * @property {Record<string, unknown>} metadata
 * @property {ExportRecord[]} exports
 * @property {DeliveryLogEntry[]} deliveryLog
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export function emptyOrg(name = "My portfolio") {
  return {
    id: newId("org"),
    name,
    plan: "alpha_preview",
    unitCap: 40,
  };
}

export function createReceiptDraft({ orgId, tenancyId, templateId, sections, parentReceiptId = null }) {
  const t = nowIso();
  return {
    id: newId("rcpt"),
    orgId,
    tenancyId,
    templateId,
    status: "draft",
    parentReceiptId,
    finalizedAt: null,
    verdict: null,
    sections: sections.map((s) => ({ ...s, id: s.id || newId("sec") })),
    media: [],
    metadata: {},
    exports: [],
    deliveryLog: [],
    createdAt: t,
    updatedAt: t,
  };
}

export function suggestVerdict(sections) {
  const conditions = (sections || []).map((s) => s.condition).filter((c) => c && c !== "na");
  if (conditions.some((c) => c === "poor")) return "FIX_LIST";
  if (conditions.some((c) => c === "fair")) return "FIX_LIST";
  if (conditions.length && conditions.every((c) => c === "good")) return "CLEAR";
  return "FILE";
}

export function finalizeReceipt(receipt, verdict) {
  if (receipt.status === "finalized") return receipt;
  const t = nowIso();
  return {
    ...receipt,
    status: "finalized",
    finalizedAt: t,
    verdict: verdict || suggestVerdict(receipt.sections),
    updatedAt: t,
    exports: [
      ...receipt.exports,
      {
        id: newId("exp"),
        receiptId: receipt.id,
        createdAt: t,
        watermarked: true,
      },
    ],
  };
}

export function amendReceipt(parent) {
  if (parent.status !== "finalized") return null;
  const sections = parent.sections.map((s) => ({
    ...s,
    id: newId("sec"),
    notes: s.notes ? `${s.notes} (amend draft)` : "",
  }));
  return createReceiptDraft({
    orgId: parent.orgId,
    tenancyId: parent.tenancyId,
    templateId: parent.templateId,
    sections,
    parentReceiptId: parent.id,
  });
}

export function spineChainLabel() {
  return "Organization → Property → Unit → Tenancy → Receipt";
}
