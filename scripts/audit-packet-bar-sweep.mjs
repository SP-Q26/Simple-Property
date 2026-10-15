#!/usr/bin/env node
/** Packet Bar Sweep · PBS v1 implementation gate (Deposit Desk). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("PACKET BAR FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const doc = readFileSync(join(root, "docs/receipt-rail/PACKET_BAR_SWEEP_v1.md"), "utf8");
const appJs = readFileSync(join(web, "app.js"), "utf8");
const barJs = readFileSync(join(web, "lib/packet-bar.mjs"), "utf8");
const appHtml = readFileSync(join(web, "app.html"), "utf8");

need("PACKET_BAR_SWEEP_v1.md", doc.includes("ai_paste_v1"));
need("TSV schema in doc", doc.includes("content_hash") && doc.includes("receipt_id"));
need("button order in doc", doc.includes("Copy link") && doc.includes("Copy row (TSV)"));
need("AJ footer unchanged note", doc.includes("AJ Nichols"));

need("packet-bar.mjs PBS_TSV_COLUMNS", barJs.includes("receipt_id") && barJs.includes("content_hash"));
need("app imports packet-bar", appJs.includes('from "./lib/packet-bar.mjs"'));
need("app renderPacketBarHtml", appJs.includes("renderPacketBarHtml"));
need("app bindPacketBarFinalize", appJs.includes("bindPacketBarFinalize"));
need("spt-packet-bar in render", appJs.includes("spt-packet-bar") || appJs.includes("renderPacketBarHtml"));

need("app.html AJ footer", appHtml.includes("AJ Nichols"));
need("data-pbs actions", barJs.includes('data-pbs="copy-tsv"') && barJs.includes('data-pbs="print"'));

console.log(fail ? `\nPacket bar sweep audit FAILED (${fail})` : "\nPacket bar sweep audit OK");
process.exit(fail ? 1 : 0);
