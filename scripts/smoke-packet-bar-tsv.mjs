#!/usr/bin/env node
/**
 * PBS v1 · TSV row shape smoke (no browser).
 * Operator path: Copy row (TSV) → Sheets cell A1 → paste (≤2 clicks after copy).
 */
import {
  PBS_TSV_COLUMNS,
  buildDepositDeskPbsRow,
  formatPbsTsvRow,
  buildAiPasteV1,
} from "../web/lib/packet-bar.mjs";

const draft = {
  id: "pkt_smoke_00000000-0000-4000-8000-000000000001",
  property: { street: "123 Demo St", city: "Chicago", state: "IL", zip: "60601" },
  tenant: { name: "Demo Tenant" },
  deposit: { amount: "1200" },
  surrenderDate: "2026-10-01",
  rooms: [{ name: "Kitchen", condition: "Good", notes: "" }],
  deductions: [{ category: "Cleaning", description: "Turnover clean", amount: "150" }],
  signatures: { date: "2026-10-14" },
  mailProof: {},
};

const shareUrl = "https://simple-property.com/app?packet_id=pkt_smoke&step=5";
const deadline = { deadline: "2026-10-31", days: 30, jurisdiction: "Illinois" };

const row = await buildDepositDeskPbsRow({ draft, deadline, shareUrl });
const tsv = formatPbsTsvRow(row);
const cells = tsv.split("\t");

if (cells.length !== PBS_TSV_COLUMNS.length) {
  console.error("SMOKE FAIL: TSV column count", cells.length, "expected", PBS_TSV_COLUMNS.length);
  process.exit(1);
}

for (const key of PBS_TSV_COLUMNS) {
  if (row[key] === undefined || row[key] === "") {
    console.error("SMOKE FAIL: missing field", key);
    process.exit(1);
  }
}

if (!row.content_hash.startsWith("sha256:")) {
  console.error("SMOKE FAIL: content_hash prefix");
  process.exit(1);
}

const ai = buildAiPasteV1(row, "# smoke markdown");
if (ai.schema !== "ai_paste_v1" || !ai.exports?.ai_paste_v1) {
  console.error("SMOKE FAIL: ai_paste_v1 shape");
  process.exit(1);
}

console.log("ok: PBS TSV columns", PBS_TSV_COLUMNS.join(","));
console.log("ok: sample row", tsv.slice(0, 80) + "…");
console.log("smoke-packet-bar-tsv OK");
