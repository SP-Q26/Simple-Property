#!/usr/bin/env node
/**
 * Form flow · step color states, banners, and fill order across wizard, logs, feedback.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";
import { WIZARD_STEPS } from "../web/lib/wizard-agent-snapshot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("FORM FLOW FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

const appJs = readFileSync(join(web, "app.js"), "utf8");
const appHtml = readFileSync(join(web, "app.html"), "utf8");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
const logsJs = readFileSync(join(web, "logs.js"), "utf8");
const feedbackHtml = readFileSync(join(web, "feedback.html"), "utf8");

need(`css v${CSS_VERSION} header`, css.includes(`v${CSS_VERSION}`));
need("wizard progress bar in app.html", appHtml.includes('id="wizard-progress"'));
need("wizard progress fill id", appHtml.includes('id="wizard-progress-fill"'));
need("wizard flow status class", appHtml.includes("wizard-flow-status"));

need("setStepLabels uses upcoming class", appJs.includes('"upcoming"') && appJs.includes("isUpcoming"));
need("setStepLabels done only when n < step", appJs.includes("const isDone = n < step"));
need("setStepLabels no false-done bug", !appJs.includes("n <= max && n !== step"));

need("wizardStepHead helper", appJs.includes("function wizardStepHead"));
need("wizard flow status line", appJs.includes("function wizardFlowStatusLine"));
need("WIZARD_STEPS import", appJs.includes("WIZARD_STEPS"));
need("panel data-wizard-step", appJs.includes('setAttribute("data-wizard-step"'));
need("panel data-step-key", appJs.includes('setAttribute("data-step-key"'));
need("tab data-step-key in setStepLabels", appJs.includes('el.setAttribute("data-step-key"'));
need("progress bar data-wizard-step", appJs.includes('bar.setAttribute("data-wizard-step"'));

for (const s of WIZARD_STEPS) {
  need(`step banner key ${s.key}`, appJs.includes(`data-spt-step-key`) || appJs.includes("wizard-step-banner"));
  need(`css panel step ${s.n}`, css.includes(`[data-wizard-step="${s.n}"]`));
  need(`css active tab ${s.key}`, css.includes(`[data-step-key="${s.key}"]`));
}

need("css wizard progress", css.includes(".wizard-progress"));
need("css wizard step banner", css.includes(".wizard-step-banner"));
need("css wizard active surface", css.includes(".wizard-step.active") && css.includes("quant-blue-surface"));
need("css wizard done state", css.includes(".wizard-step.done"));
need("css wizard upcoming state", css.includes(".wizard-step.upcoming"));
need("css wizard locked state", css.includes(".wizard-step.locked"));
need("css form flow banner", css.includes(".form-flow-banner"));
need("css form flow rail", css.includes(".form-flow-rail"));
need("css log tab flow states", css.includes(".log-tab--done"));

need("logs form flow banner", logsJs.includes("logFormFlowBanner"));
need("logs tab step numbers", logsJs.includes("${t.n} ·"));
need("feedback form flow rail", feedbackHtml.includes("form-flow-rail"));
need("feedback flow hint", feedbackHtml.includes("feedback-flow-hint"));
need("feedback data-flow-step fields", feedbackHtml.includes('data-flow-step="1"') && feedbackHtml.includes('data-flow-step="5"'));

const feedbackJs = readFileSync(join(web, "sp-feedback.js"), "utf8");
const pricingHtml = readFileSync(join(web, "pricing.html"), "utf8");
const railLib = readFileSync(join(web, "lib/form-flow-rail.mjs"), "utf8");

need("form flow rail module", railLib.includes("bindFormFlowRail"));
need("feedback binds form flow rail", feedbackJs.includes("bindFormFlowRail"));
need("css form flow rail current", css.includes(".form-flow-rail__item--current"));
need("css field-stack focus step", css.includes(".field-stack[data-flow-step]:focus-within"));
need("logs panel agent marker", logsJs.includes('data-spt-agent-form", "logs"'));
need("logs panel data-log-step", logsJs.includes("data-log-step"));
need("pricing finder rail", pricingHtml.includes("form-flow-rail") && pricingHtml.includes("pricing-finder-form"));
need("pricing finder mjs", readFileSync(join(web, "sp-pricing-finder.mjs"), "utf8").includes("bindFormFlowRail"));

console.log(fail ? `\nForm flow audit FAILED (${fail})` : "\nForm flow audit OK");
process.exit(fail ? 1 : 0);
