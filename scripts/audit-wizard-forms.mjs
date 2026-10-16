#!/usr/bin/env node
/**
 * Wizard + satellite forms · field order, duplicates, speed paths, turnover canon.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WIZARD_STEPS } from "../web/lib/wizard-agent-snapshot.mjs";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("WIZARD FORMS FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

const appJs = readFileSync(join(web, "app.js"), "utf8");
const appHtml = readFileSync(join(web, "app.html"), "utf8");
const logsJs = readFileSync(join(web, "logs.js"), "utf8");
const feedbackHtml = readFileSync(join(web, "feedback.html"), "utf8");

const expectedOrder = ["property", "turnover", "move_out", "move_in", "export"];
const keys = WIZARD_STEPS.map((s) => s.key);
need("wizard step keys order", keys.join(",") === expectedOrder.join(","));

for (let i = 0; i < WIZARD_STEPS.length; i++) {
  const tab = appHtml.match(new RegExp(`data-step="${i + 1}"[^>]*>([^<]+)`));
  const label = tab?.[1]?.toLowerCase() || "";
  need(`tab ${i + 1} label mentions ${WIZARD_STEPS[i].label.toLowerCase()}`, label.includes(WIZARD_STEPS[i].label.toLowerCase().split(" ")[0]));
}

/** Single source per packet field (re-type on export is intentional for signatures). */
const wizardFields = {
  step1: ["prop-state", "prop-city-preset", "prop-street", "prop-city", "prop-zip", "prop-units"],
  step2: ["surrender", "dep-amt", "dep-held", "tn-name", "tn-email", "lease-start", "lease-end"],
  step3: ["btn-full-return", "btn-add-ded"],
  step4: ["photo-album", "btn-skip-move-in", "btn-add-room"],
  step5: [
    "ll-name",
    "ll-email",
    "ll-addr",
    "sig-ll",
    "sig-tn",
    "sig-date",
    "mail-mailed",
    "mail-method",
    "mail-tracking",
    "rem-use-pm",
    "rem-pm-email",
  ],
};

for (const [step, ids] of Object.entries(wizardFields)) {
  for (const id of ids) {
    if (id.startsWith("btn-")) {
      need(`${step} ${id}`, appJs.includes(`"${id}"`) || appJs.includes(`'${id}'`));
    } else {
      need(`${step} field ${id}`, appJs.includes(`id="${id}"`));
    }
  }
}

need("landlord deferred to export step", /landlord.*export/i.test(appJs) && appJs.includes("wizardStepHead"));
need("no landlord fields step 1-4", !appJs.match(/id="ll-name"/) || appJs.indexOf('id="ll-name"') > appJs.indexOf("renderStep5"));
need("tenant name once before export", appJs.indexOf('id="tn-name"') < appJs.indexOf("renderStep5"));
need("signature autofill landlord", appJs.includes("sig-ll") && appJs.includes("draft.landlord.name"));
need("signature autofill tenant", appJs.includes("sig-tn") && appJs.includes("draft.tenant.name"));
need("reminders delivery resolver", appJs.includes("reminderDeliveryEmailFromDom"));
need("reminders pm toggle", appJs.includes('id="rem-use-pm"') && appJs.includes('id="rem-pm-email"'));
need("no legacy rem-email field", !appJs.includes('id="rem-email"'));

need("full return skips to export", appJs.includes("btn-full-return") && appJs.includes("step = MAX_STEPS"));
need("skip move-in to export", appJs.includes("btn-skip-move-in") && appJs.includes("step = MAX_STEPS"));
need("duplicate last keeps landlord", appJs.includes("duplicateFromLastPacket") && appJs.includes("landlord:"));
need("turnover deep link step 2", appJs.includes("enableTurnoverMode") && appJs.includes("minStep: 2"));

need("logs maintenance form order", logsJs.indexOf("mnt-unit") < logsJs.indexOf("mnt-desc"));
need("logs ticket form order", logsJs.indexOf("tkt-unit") < logsJs.indexOf("tkt-subject"));
need("logs inspection form order", logsJs.indexOf("ins-unit") < logsJs.indexOf("ins-summary"));
need("feedback honeypot", feedbackHtml.includes('name="website"') && feedbackHtml.includes("feedback-honeypot"));
need("feedback category first", feedbackHtml.indexOf('name="category"') < feedbackHtml.indexOf('name="message"'));
need("feedback agent form marker", feedbackHtml.includes('data-spt-agent-form="feedback"'));

need("supported state count documented", SUPPORTED_STATES.length >= 32);
need(
  "intro flow matches steps",
  appHtml.includes("Five steps") &&
    appHtml.includes("surrender clock") &&
    appHtml.includes("line items") &&
    appHtml.includes("move-in proof")
);
need("wizard progress rail", appHtml.includes("wizard-progress"));
need("wizard step head in app.js", appJs.includes("wizardStepHead"));
need("export deadline urgency paywall", appJs.includes("paywall--urgency") && appJs.includes("exportDeadlineUrgency"));
need("pm handoff sheet step 5", appJs.includes("pm-handoff-sheet"));
need("condition hub handoff consumer", appJs.includes("consumeConditionHubHandoff"));
need("urgent reminder panel", appJs.includes("reminder-panel--urgent"));

console.log(fail ? `\nWizard forms audit FAILED (${fail})` : "\nWizard forms audit OK");
process.exit(fail ? 1 : 0);
