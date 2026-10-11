#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCourtRecordSnippets } from "./lib/court-record-snippets-source.mjs";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const outPath = join(web, "data", "court-record-snippets.json");
const data = buildCourtRecordSnippets();

const byState = {};
for (const code of SUPPORTED_STATES) byState[code] = 0;
for (const s of data.snippets) {
  for (const code of s.states || []) byState[code] = (byState[code] || 0) + 1;
}
const thin = Object.entries(byState).filter(([, n]) => n < 2);
if (thin.length) {
  console.error("court snippets: states with <2 lines:", thin.map(([c]) => c).join(", "));
  process.exit(1);
}

writeFileSync(outPath, JSON.stringify(data) + "\n");
console.log("build-court-record-snippets ·", data.snippets.length, "lines ·", outPath);
