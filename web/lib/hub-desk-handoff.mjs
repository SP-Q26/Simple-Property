/**
 * Condition hub → Deposit Desk handoff (sessionStorage · no PII beyond address lines).
 */
export const HUB_DESK_HANDOFF_KEY = "spt_hub_desk_handoff_v1";

export function readHubDeskHandoff() {
  try {
    const raw = sessionStorage.getItem(HUB_DESK_HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.ref !== "condition_hub") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearHubDeskHandoff() {
  try {
    sessionStorage.removeItem(HUB_DESK_HANDOFF_KEY);
  } catch {
    /* ignore */
  }
}

function isEmpty(v) {
  return v == null || String(v).trim() === "";
}

/**
 * @param {object} draft
 * @param {object} handoff
 * @returns {string[]} fields touched
 */
export function applyHubDeskHandoffToDraft(draft, handoff) {
  const applied = [];
  if (!draft || !handoff) return applied;

  const prop = handoff.property || {};
  if (isEmpty(draft.property.street) && prop.street) {
    draft.property.street = String(prop.street).trim();
    applied.push("property.street");
  }
  if (isEmpty(draft.property.city) && prop.city) {
    draft.property.city = String(prop.city).trim();
    applied.push("property.city");
  }
  if (prop.state) {
    const st = String(prop.state).trim().toUpperCase();
    if (st && (isEmpty(draft.property.state) || draft.property.state === "IL")) {
      draft.property.state = st;
      applied.push("property.state");
    }
  }

  const ten = handoff.tenancy || {};
  if (isEmpty(draft.surrenderDate) && ten.surrenderDate) {
    draft.surrenderDate = String(ten.surrenderDate).slice(0, 10);
    applied.push("surrenderDate");
  }
  if (isEmpty(draft.lease?.end) && ten.leaseEnd) {
    draft.lease.end = String(ten.leaseEnd).slice(0, 10);
    applied.push("lease.end");
  }

  if (handoff.templateId === "move_out_condition" && !draft.turnoverMode) {
    draft.turnoverMode = true;
    applied.push("turnoverMode");
  }

  draft.hubHandoff = {
    receiptId: handoff.receiptId || "",
    templateId: handoff.templateId || "",
    at: handoff.at || "",
  };
  return applied;
}
