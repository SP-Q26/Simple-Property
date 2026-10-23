#!/usr/bin/env node
/**
 * P1 money path · move-in/out → finalize → PDF → share → Stripe (isles_brand=deposit_desk).
 * P2 compare is explicitly out of scope until this audit passes.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WIZARD_STEPS } from "../web/lib/wizard-agent-snapshot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("MONEY PATH FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

const plan = readFileSync(join(root, "docs/receipt-rail/MONEY_PATH_P1.md"), "utf8");
const appJs = read("app.js");
const appHtml = read("app.html");
const checkout = read("api/stripe/checkout.js");
const webhook = read("api/stripe/webhook.js");
const meta = read("lib/isles-checkout-metadata.mjs");
const bar = read("lib/packet-bar.mjs");
const hub = read("hub-app.js");

need("MONEY_PATH_P1 doc", plan.includes("P2 compare") && plan.includes("isles_brand=deposit_desk"));
need("attack order move-out before move-in", plan.includes("Move-out") && plan.includes("Move-in"));

const steps = WIZARD_STEPS.map((s) => s.key);
need("wizard move_out step 3", steps[2] === "move_out");
need("wizard move_in step 4", steps[3] === "move_in");
need("wizard export step 5", steps[4] === "export");

need("step 5 packet bar", appJs.includes("renderPacketBarHtml") && appHtml.includes("wizard-panel"));
need("packet bar button order", bar.includes("copy-link") && bar.includes("copy-tsv") && bar.includes('data-pbs="print"'));
need("finalize telemetry", appJs.includes("sp_finalize_attempt") && appJs.includes("sp_finalize_success"));
need("final print finalize success", appJs.includes('via: "print_final"'));
need("mail route panel", appJs.includes("mail-ready-route"));
need("turn checkout packet id", appJs.includes('data-packet-id="${esc(draft.id)}"'));
need("paywall economics copy", appJs.includes("paywall-economics"));
need("checkout binds sp-checkout", appJs.includes("sptStartCheckout"));

need("isles metadata helper", meta.includes("isles_brand") && meta.includes("deposit_desk"));
need("checkout uses isles metadata", checkout.includes("buildDepositDeskCheckoutMetadata"));
need("checkout isles_brand in builder", meta.includes('ISLES_BRAND_DEPOSIT_DESK = "deposit_desk"'));
need("webhook foreign brand guard", webhook.includes("isDepositDeskCheckoutMetadata"));
need("webhook checkout_complete isles_brand", webhook.includes("isles_brand"));

need("hub no compare_report ship", !hub.includes("compare_report") || hub.includes("P2"));
need("SWARM plan P2 after P1", readFileSync(join(root, "docs/receipt-rail/SWARM_DEPLOY_PLAN.md"), "utf8").includes("Train 4+"));

console.log(fail ? `\nMoney path audit FAILED (${fail})` : "\nMoney path audit OK · P1 before P2 compare");
process.exit(fail ? 1 : 0);
