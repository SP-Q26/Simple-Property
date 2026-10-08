#!/usr/bin/env node
/**
 * Wizard speed-to-done gates · shortcuts, nav, keyboard, sticky chrome.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("WIZARD SPEED FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

const appJs = readFileSync(join(web, "app.js"), "utf8");
const appHtml = readFileSync(join(web, "app.html"), "utf8");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
const snap = readFileSync(join(web, "lib/wizard-agent-snapshot.mjs"), "utf8");

need("turnover before move-in step order", snap.includes('key: "move_out"') && snap.includes('key: "move_in"'));
need("skip move-in control", appJs.includes("btn-skip-move-in"));
need("duplicate last packet", appJs.includes("btn-duplicate-packet") && appJs.includes("duplicateFromLastPacket"));
need("wizard step jump", appJs.includes("goToStep") && appJs.includes("wizardMaxStep"));
need("surrender today shortcut", appJs.includes("btn-surrender-today"));
need("full deposit return shortcut", appJs.includes("btn-full-return"));
need("deduction quick-add", appJs.includes("ded-quick"));
need("enter advances wizard", appJs.includes("bindWizardKeyboard") && appJs.includes("advanceWizard"));
need("focus first field per step", appJs.includes("focusStepField"));
need("infer max step from draft", appJs.includes("inferWizardMaxStep"));
need("sticky wizard nav css", css.includes("wizard-nav--sticky"));
need("step tabs are buttons", appHtml.includes('class="wizard-step"') && appHtml.includes("role=\"tab\""));
need("locale compact on app", appJs.includes("locale-bar--wizard") || readFileSync(join(web, "sp-nav.js"), "utf8").includes("locale-bar--wizard"));
need("two-button print export", appHtml.includes("btn-print-preview") && appHtml.includes("btn-print-final"));
need("watermarked print packet", appJs.includes("print-packet--preview") && css.includes(".print-packet--preview"));
need("mail-ready route copy", appJs.includes("mail-ready-route") && appJs.includes("attorney"));
need("turnover deep link", appJs.includes("isTurnoverQuery") && appJs.includes("enableTurnoverMode"));
need("packet json backup", appJs.includes("PACKET_BACKUP_SCHEMA") && appJs.includes("importPacketBackupObject"));
need("mail proof fields", appJs.includes("mail-mailed") && appJs.includes("mailProof"));
need("statement preview unlocked", appJs.includes("renderItemizationPreview(false)"));
need("packet import export ui", appHtml.includes("btn-export-packet") && appHtml.includes("btn-import-packet"));
need("return link copy", appJs.includes("btn-copy-return-link") && appJs.includes("packetReturnUrl"));
need("home turnover cta", readFileSync(join(web, "home-cta.js"), "utf8").includes("turnover=1"));

console.log(fail ? `\nWizard speed audit FAILED (${fail})` : "\nWizard speed audit OK");
process.exit(fail ? 1 : 0);
