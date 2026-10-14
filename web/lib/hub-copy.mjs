/** Customer-facing copy for Condition hub (/hub) · no backend jargon on UI strings. */

export const HUB_PRODUCT_NAME = "Condition hub";
export const HUB_EYEBROW = "Move-in & move-out proof · up to 40 units";
export const HUB_INTRO =
  "Walk the unit room by room, save a dated record, and keep locked copies when turnover gets disputed. Works in this browser today · sign-in and cloud save coming soon.";
export const HUB_DISCLAIMER = "Documentation only · not legal advice.";

export const VERDICT_LABELS = {
  CLEAR: "Unit ready · no open issues",
  FIX_LIST: "Send tenant a fix list",
  FILE: "Keep for your files",
};

export function verdictLabel(code) {
  return VERDICT_LABELS[code] || code;
}

export function receiptStatusLabel(status) {
  if (status === "finalized") return "Locked";
  if (status === "draft") return "In progress";
  return status;
}
