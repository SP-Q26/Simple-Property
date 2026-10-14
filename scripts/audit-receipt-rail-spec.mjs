#!/usr/bin/env node
/**
 * Receipt Rail expansion · spec canon gate (docs only, not P1 product code).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs", "receipt-rail");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("RECEIPT RAIL SPEC FAIL:", label, detail);
    fail++;
  } else console.log("ok:", label);
}

function readDoc(name) {
  const p = join(docs, name);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

const bible = readDoc("SIMPLE_PROPERTY_EXPANSION.md");
const lane = readDoc("LANE.md");
const readme = readDoc("README.md");
const audit = readDoc("SPEC_AUDIT.md");
const plan = readDoc("SWARM_DEPLOY_PLAN.md");
const canon = readFileSync(join(root, "docs", "CANON.md"), "utf8");
const rootReadme = readFileSync(join(root, "README.md"), "utf8");

need("README.md", readme.includes("Receipt Rail"));
need("LANE.md", lane.length > 500);
need("SIMPLE_PROPERTY_EXPANSION.md", bible.includes("Organization"));
need("SPEC_AUDIT.md", audit.includes("Executive summary"));
need("SWARM_DEPLOY_PLAN.md", plan.includes("Train 0"));

need("CANON links receipt-rail", canon.includes("docs/receipt-rail/"));
need("root README links receipt-rail", rootReadme.includes("docs/receipt-rail/README.md"));

need("lane finalize amend", /finalize/i.test(lane) && /amend/i.test(lane));
need("lane template_id", lane.includes("template_id"));
need("lane not PMS", /not a pms|not a PMS/i.test(lane) || lane.includes("Out of lane"));

need("bible P1 gate 10 receipts", bible.includes("10 finalized"));
need("bible modules table", bible.includes("move_in_baseline") && bible.includes("move_out_condition"));
need("bible stripe isles", bible.includes("isles_brand"));
need("bible stack vercel", bible.includes("Vercel"));
need("bible deposit desk mapping", bible.includes("Deposit Desk mapping"));

need("plan train 0", plan.includes("Train 0"));
need("plan program A B split", plan.includes("Program A") && plan.includes("Program B"));
need("plan deploy checklist", plan.includes("audit-receipt-rail-spec"));

need("pricing 40 units doc", readDoc("PRICING_40_UNITS.md").includes("40 units"));
need("achievable now audit", readDoc("ACHIEVABLE_NOW.md").includes("Program A"));

const templateIds = [
  "move_in_baseline",
  "move_out_condition",
  "deposit_deduction_exhibit",
  "key_fob_handoff",
  "compare_report",
  "maintenance_visit",
  "str_turnover",
  "owner_job_diary",
];
for (const id of templateIds) {
  need(`bible template ${id}`, bible.includes(id));
}

need("no weweb required", !/WeWeb only/i.test(bible) || bible.includes("only if"));

console.log(fail ? `\nReceipt Rail spec audit FAILED (${fail})` : "\nReceipt Rail spec audit OK");
process.exit(fail ? 1 : 0);
