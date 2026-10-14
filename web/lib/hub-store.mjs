import { createReceiptDraft, emptyOrg, newId, todayIso } from "./receipt-spine.mjs";
import { defaultSectionsForTemplate } from "./hub-templates.mjs";
import { seedHubState } from "./hub-fixtures.mjs";

export const HUB_STORAGE_KEY = "spt_hub_v1";

export function loadHubState() {
  try {
    const raw = localStorage.getItem(HUB_STORAGE_KEY);
    if (!raw) return seedHubState();
    const parsed = JSON.parse(raw);
    if (!parsed?.org?.id) return seedHubState();
    return parsed;
  } catch {
    return seedHubState();
  }
}

export function saveHubState(state) {
  localStorage.setItem(HUB_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function resetHubState() {
  const seeded = seedHubState();
  saveHubState(seeded);
  return seeded;
}

export function upsertReceipt(state, receipt) {
  const receipts = state.receipts.filter((r) => r.id !== receipt.id);
  receipts.push({ ...receipt, updatedAt: new Date().toISOString() });
  return { ...state, receipts };
}

export function getReceipt(state, id) {
  return state.receipts.find((r) => r.id === id) || null;
}

export function getTenancy(state, id) {
  return state.tenancies.find((t) => t.id === id) || null;
}

export function getUnit(state, id) {
  return state.units.find((u) => u.id === id) || null;
}

export function getProperty(state, id) {
  return state.properties.find((p) => p.id === id) || null;
}

export function chainForTenancy(state, tenancyId) {
  const tenancy = getTenancy(state, tenancyId);
  if (!tenancy) return null;
  const unit = getUnit(state, tenancy.unitId);
  const property = unit ? getProperty(state, unit.propertyId) : null;
  return { org: state.org, property, unit, tenancy };
}

export function createDraftReceipt(state, { tenancyId, templateId }) {
  const sections = defaultSectionsForTemplate(templateId);
  const receipt = createReceiptDraft({
    orgId: state.org.id,
    tenancyId,
    templateId,
    sections,
  });
  const next = upsertReceipt(state, receipt);
  return { state: next, receipt };
}

export function addPropertyWithUnit(state, { label, address, stateCode, city, unitLabel }) {
  const property = {
    id: newId("prop"),
    orgId: state.org.id,
    label,
    address,
    state: stateCode || "IL",
    city: city || "Chicago",
  };
  const unit = {
    id: newId("unit"),
    propertyId: property.id,
    label: unitLabel || "Unit 1",
  };
  const tenancy = {
    id: newId("ten"),
    unitId: unit.id,
    tenantName: "Tenant (sample)",
    leaseStart: todayIso(),
    leaseEnd: "",
    surrenderDate: "",
  };
  return {
    ...state,
    properties: [...state.properties, property],
    units: [...state.units, unit],
    tenancies: [...state.tenancies, tenancy],
  };
}

export function ensureOrg(state) {
  if (state.org?.id) return state;
  return { ...state, org: emptyOrg() };
}
