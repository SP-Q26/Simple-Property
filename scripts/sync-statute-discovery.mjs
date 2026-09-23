#!/usr/bin/env node
/** Sync llms.txt + spt-gospel.json deposit statute index from deposit-rules. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { STATUTE_URLS, CHICAGO_RLTO_URL } from "../web/lib/statute-urls.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const statuteIndexUrl = "https://simple-property.com/legal/deposit-statutes";

const packs = SUPPORTED_STATES.map((code) => ({
  code,
  label: STATE_PACKS[code].label,
  returnDays: STATE_PACKS[code].returnDays,
  cite: STATE_PACKS[code].cite,
  statuteUrl: STATUTE_URLS[code],
  app: `https://simple-property.com/app?state=${code}`,
  guides: `https://simple-property.com/blog#locale-${code}`,
}));

let llms = readFileSync(join(web, "llms.txt"), "utf8");
const block = `- **Deposit statutes index** · official outbound links for all wizard states + DC: ${statuteIndexUrl}`;
if (!llms.includes("Deposit statutes index")) {
  llms = llms.replace(
    "- **Legal**",
    `${block}\n- **Legal**`
  );
}
writeFileSync(join(web, "llms.txt"), llms);

const gospelPath = join(web, ".well-known/spt-gospel.json");
const gospel = JSON.parse(readFileSync(gospelPath, "utf8"));
gospel.schema_version = "1.3";
gospel.deposit_statutes_index = statuteIndexUrl;
gospel.chicago_rlto_url = CHICAGO_RLTO_URL;
gospel.state_packs = packs;
if (!gospel.surfaces.includes(statuteIndexUrl)) gospel.surfaces.push(statuteIndexUrl);
writeFileSync(gospelPath, JSON.stringify(gospel, null, 2) + "\n");

console.log("sync-statute-discovery · llms + gospel ·", packs.length, "packs");
