#!/usr/bin/env node
/**
 * Receipt Rail hub alpha · client spine + P1 templates (no backend).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("HUB ALPHA FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  const p = join(web, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

const hubHtml = read("hub.html");
const hubApp = read("hub-app.js");
const spine = read("lib/receipt-spine.mjs");
const templates = read("lib/hub-templates.mjs");
const store = read("lib/hub-store.mjs");

need("hub.html", hubHtml.includes('id="hub-root"'));
need("hub noindex", /noindex/i.test(hubHtml));
need("hub data-hub-route", hubHtml.includes("data-hub-route"));
need("hub-app.js", hubApp.includes("finalizeReceipt"));
need("hub wizard route", hubApp.includes("/wizard"));
need("hub vault", hubApp.includes("renderVault"));
need("spine chain", spine.includes("Organization") && spine.includes("finalizeReceipt"));
need("spine amend", spine.includes("amendReceipt"));
need("templates move_in", templates.includes("move_in_baseline"));
need("templates move_out", templates.includes("move_out_condition"));
need("templates registry size", (templates.match(/template_id|id: "/g) || []).length >= 10);
need("store localStorage", store.includes("HUB_STORAGE_KEY"));
need("modules.html", read("modules.html").includes("move_out_condition"));
need("hub css", read("simple-property.css").includes(".hub-nav"));

console.log(fail ? `\nHub alpha audit FAILED (${fail})` : "\nHub alpha audit OK");
process.exit(fail ? 1 : 0);
