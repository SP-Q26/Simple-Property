import { createReceiptDraft, emptyOrg, newId, todayIso } from "./receipt-spine.mjs";
import { defaultSectionsForTemplate } from "./hub-templates.mjs";

export function seedHubState() {
  const org = emptyOrg("Greystone demo portfolio");
  const property = {
    id: newId("prop"),
    orgId: org.id,
    label: "Two-flat · Logan Square",
    address: "1234 N Example Ave",
    state: "IL",
    city: "Chicago",
  };
  const unitA = { id: newId("unit"), propertyId: property.id, label: "Unit 1 (front)" };
  const unitB = { id: newId("unit"), propertyId: property.id, label: "Unit 2 (rear)" };
  const tenancyA = {
    id: newId("ten"),
    unitId: unitA.id,
    tenantName: "A. Renter",
    leaseStart: "2025-09-01",
    leaseEnd: "2026-08-31",
    surrenderDate: "",
  };
  const tenancyB = {
    id: newId("ten"),
    unitId: unitB.id,
    tenantName: "B. Renter",
    leaseStart: "2024-06-01",
    leaseEnd: "",
    surrenderDate: todayIso(),
  };

  const moveIn = createReceiptDraft({
    orgId: org.id,
    tenancyId: tenancyA.id,
    templateId: "move_in_baseline",
    sections: defaultSectionsForTemplate("move_in_baseline"),
  });
  moveIn.sections[2].condition = "fair";
  moveIn.sections[2].notes = "Minor cabinet wear noted at move-in.";

  const moveOutDraft = createReceiptDraft({
    orgId: org.id,
    tenancyId: tenancyB.id,
    templateId: "move_out_condition",
    sections: defaultSectionsForTemplate("move_out_condition"),
  });
  moveOutDraft.sections[2].condition = "poor";
  moveOutDraft.sections[2].notes = "Burn mark on counter · photo link in wizard.";

  return {
    org,
    properties: [property],
    units: [unitA, unitB],
    tenancies: [tenancyA, tenancyB],
    receipts: [moveIn, moveOutDraft],
    meta: { seededAt: new Date().toISOString(), version: 1 },
  };
}
