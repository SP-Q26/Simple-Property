#!/usr/bin/env node
/**
 * Feedback agent form fill · prod/static smoke (landlord persona · no browser).
 */
import {
  FEEDBACK_FORM_SCHEMA,
  feedbackFormIsValid,
  LANDLORD_FEEDBACK_SMOKE_FILL,
} from "../web/lib/agent-form-fill.mjs";

const BASE = (process.env.SMOKE_BASE || "https://simple-property.com").replace(/\/$/, "");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("SMOKE FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

console.log("Feedback agent smoke · base:", BASE);

need("landlord persona payload valid", feedbackFormIsValid(LANDLORD_FEEDBACK_SMOKE_FILL));

const htmlRes = await fetch(`${BASE}/feedback`);
need("GET /feedback 200", htmlRes.status === 200);
const html = await htmlRes.text();
need("feedback form id", html.includes("spt-feedback-form"));
need("agent form marker", html.includes('data-spt-agent-form="feedback"'));
need("module sp-feedback", html.includes('type="module"') && html.includes("/sp-feedback.js"));

const jsRes = await fetch(`${BASE}/sp-feedback.js`);
need("GET sp-feedback.js 200", jsRes.status === 200);
const js = await jsRes.text();
need("registerFeedbackAgentApi", js.includes("registerFeedbackAgentApi"));
need("sptAgentFormFill wiring", js.includes("sptAgentFormFill"));

const busRes = await fetch(`${BASE}/spt-ai-bus.json`);
const bus = await busRes.json();
need("ai-bus feedback_form schema", bus.feedback_form?.schema === FEEDBACK_FORM_SCHEMA);

const dryPayload = {
  ...LANDLORD_FEEDBACK_SMOKE_FILL,
  website: "",
};
const apiRes = await fetch(`${BASE}/api/feedback`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(dryPayload),
});
console.log(`HTTP ${apiRes.status} POST /api/feedback (landlord persona · expect 200)`);
const apiJson = await apiRes.json().catch(() => ({}));
need("feedback API accepts persona", apiRes.status === 200 && apiJson.ok === true);

if (fail) {
  console.error(`\nFeedback agent smoke FAILED (${fail})`);
  process.exit(1);
}
console.log("\nFeedback agent smoke OK");
