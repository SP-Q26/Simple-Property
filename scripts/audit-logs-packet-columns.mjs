#!/usr/bin/env node
/** Operator logs CSV aligns with Deposit Desk packet cross-ref. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const logs = readFileSync(join(web, "logs.js"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("LOGS PACKET FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

need("packetId column", logs.includes('"packetId"') || logs.includes("'packetId'"));
need("surrenderDate column", logs.includes("surrenderDate"));
need("depositHeld column", logs.includes("depositHeld"));
need("cross-ref form", logs.includes("log-packet-id"));
need("readPacketCrossRef", logs.includes("readPacketCrossRef"));
need("url packet_id prefill", logs.includes("getPacketHandoffFromUrl") && logs.includes("prefillPacketCrossRefFromUrl"));

const app = readFileSync(join(web, "app.js"), "utf8");
need("app logs handoff url", app.includes("buildOperatorLogsHandoffUrl"));

console.log(fail ? `audit-logs-packet-columns FAILED (${fail})` : "audit-logs-packet-columns OK");
process.exit(fail ? 1 : 0);
