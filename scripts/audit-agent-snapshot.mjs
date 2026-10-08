#!/usr/bin/env node
/**
 * Wizard live agent snapshot · schema unit test + wiring gates.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWizardAgentSnapshot,
  WIZARD_SNAPSHOT_SCHEMA,
  WIZARD_SNAPSHOT_VERSION,
  WIZARD_STEPS,
} from "../web/lib/wizard-agent-snapshot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("AGENT SNAPSHOT FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

const mockDraft = {
  id: "pkt-test-001",
  property: { state: "IL", cityPreset: "chicago-il", city: "Chicago", street: "1 N Test", unitCount: 2, inChicago: true },
  tenant: { name: "Tenant", email: "t@example.com" },
  landlord: { email: "l@example.com" },
  lease: { start: "2025-01-01", end: "2026-01-01" },
  deposit: { amount: "1500" },
  surrenderDate: "2026-03-01",
  photoAlbumLink: "",
  rooms: [{ name: "Kitchen", photoLink: "https://example.com/p" }],
  deductions: [{ category: "Cleaning", description: "x", amount: "50" }],
};

const snap = buildWizardAgentSnapshot({
  step: 5,
  draft: mockDraft,
  canExport: false,
  hasTurnUnlock: false,
  isProSubscription: false,
  isDemoPro: false,
  subscriptionMeta: null,
  deadline: { jurisdiction: "Chicago RLTO", deadline: "2026-04-15", returnDays: 45, cite: "RLTO" },
  savedPacketCount: 2,
});

need("schema constant", snap.schema === WIZARD_SNAPSHOT_SCHEMA);
need("version", snap.version === WIZARD_SNAPSHOT_VERSION);
need("five steps canon", WIZARD_STEPS.length === 5);
need("step key export on 5", snap.wizard.stepKey === "export");
need("paywall when locked step 5", snap.entitlement.paywallVisible === true);
need("no tenant name in snapshot", snap.tenancy.hasTenantName === true && !("tenantName" in snap.tenancy));
need("deposit math", snap.deposit.withheld === 50 && snap.deposit.returnToTenant === 1450);
need("blocked print when locked", snap.actions.blocked.includes("print_pdf"));
need("agent readOrder", Array.isArray(snap.agent.readOrder) && snap.agent.readOrder[0].includes("__SPT_AGENT__"));

const appJs = readFileSync(join(web, "app.js"), "utf8");
need("app imports snapshot module", appJs.includes("wizard-agent-snapshot.mjs"));
need("app publishes snapshot", appJs.includes("publishWizardAgentSnapshot"));

const bus = JSON.parse(readFileSync(join(web, "spt-ai-bus.json"), "utf8"));
need("ai-bus wizard_live", bus.wizard_live?.schema === WIZARD_SNAPSHOT_SCHEMA);
need("ai-bus wizard_live dom id", bus.wizard_live?.dom_id === "spt-wizard-snapshot");

const llms = readFileSync(join(web, "llms.txt"), "utf8");
need("llms.txt mentions __SPT_AGENT__", llms.includes("__SPT_AGENT__"));

const appHtml = readFileSync(join(web, "app.html"), "utf8");
need("app.html agent snapshot link", appHtml.includes("spt-wizard-snapshot"));

console.log(fail ? `\nAgent snapshot audit FAILED (${fail})` : "\nAgent snapshot audit OK");
process.exit(fail ? 1 : 0);
