#!/usr/bin/env node
/** Packet backup schema v2 · import validation UI. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PACKET_BACKUP_SCHEMA, validatePacketImport } from "../web/lib/packet-backup.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("PACKET IMPORT FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const app = readFileSync(join(web, "app.js"), "utf8");
const lib = readFileSync(join(web, "lib/packet-backup.mjs"), "utf8");

need("schema v2 constant", PACKET_BACKUP_SCHEMA === 2);
need("packet-backup module", lib.includes("validatePacketImport"));
need("app imports packet-backup", app.includes("packet-backup.mjs") && app.includes("validatePacketImport"));
need("import confirm flow", app.includes("formatImportWarnings") && app.includes("Continue import?"));
need("export schema field", app.includes("schema: PACKET_BACKUP_SCHEMA"));

const v2 = {
  schema: 2,
  exportedAt: "2026-01-01T00:00:00.000Z",
  product: "Deposit Desk",
  data: { id: "x", property: { state: "IL", street: "1 Main" }, surrenderDate: "2026-01-01", deposit: { amount: "1000" }, tenant: { name: "T" }, deductions: [{ amount: "0" }], rooms: [{ name: "Kitchen" }] },
};
need("v2 validates", validatePacketImport(v2).ok);

const bad = { schema: 9, data: {} };
need("bad schema rejects", !validatePacketImport(bad).ok);

console.log(fail ? `audit-packet-import FAILED (${fail})` : "audit-packet-import OK");
process.exit(fail ? 1 : 0);
