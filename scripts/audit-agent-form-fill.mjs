#!/usr/bin/env node
/**
 * Feedback agent form fill · wiring + schema unit tests.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FEEDBACK_FORM_SCHEMA,
  FEEDBACK_FORM_VERSION,
  feedbackFormIsValid,
  LANDLORD_FEEDBACK_SMOKE_FILL,
  normalizeFeedbackCategory,
  parseFeedbackFillFromSearch,
} from "../web/lib/agent-form-fill.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("AGENT FORM FILL FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

need("smoke persona valid", feedbackFormIsValid(LANDLORD_FEEDBACK_SMOKE_FILL));
need("category normalize", normalizeFeedbackCategory("ruleset") === "ruleset");
need("category reject", normalizeFeedbackCategory("bogus") === null);

const params = new URLSearchParams(
  "category=wizard&state=IL&message=Please%20add%20a%20field%20for%20forwarding."
);
const parsed = parseFeedbackFillFromSearch(params);
need("query parse category", parsed?.category === "wizard");
need("query parse message", (parsed?.message || "").length >= 12);

const feedbackHtml = readFileSync(join(web, "feedback.html"), "utf8");
const feedbackJs = readFileSync(join(web, "sp-feedback.js"), "utf8");
need("feedback data-spt-agent-form", feedbackHtml.includes('data-spt-agent-form="feedback"'));
need("feedback module script", feedbackHtml.includes('type="module"') && feedbackHtml.includes("/sp-feedback.js"));
need("sp-feedback registers agent", feedbackJs.includes("registerFeedbackAgentApi"));

const bus = JSON.parse(readFileSync(join(web, "spt-ai-bus.json"), "utf8"));
need("ai-bus feedback_form", bus.feedback_form?.schema === FEEDBACK_FORM_SCHEMA);
need("ai-bus feedback fill_api", bus.feedback_form?.fill_api === "window.sptAgentFormFill");

const llms = readFileSync(join(web, "llms.txt"), "utf8");
need("llms sptAgentFormFill", llms.includes("sptAgentFormFill"));

need("schema version", FEEDBACK_FORM_VERSION === 1);

console.log(fail ? `\nAgent form fill audit FAILED (${fail})` : "\nAgent form fill audit OK");
process.exit(fail ? 1 : 0);
