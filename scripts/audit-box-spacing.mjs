#!/usr/bin/env node
/** In-box padding gates · wizard panels + OG highlight card. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("BOX SPACING FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const css = readFileSync(join(web, "simple-property.css"), "utf8");
const doorSvg = readFileSync(join(web, "og/spt-share-door.svg"), "utf8");

need("mail-proof-grid separator", css.includes(".mail-proof-grid") && css.includes("padding-top"));
need("mail-route list rhythm", css.includes(".mail-route-list li:last-child"));
need("wizard itemization totals divider", css.includes(".itemization-preview .deposit-receipt__totals"));
need("paywall actions gap", css.includes(".spt-wizard-app .paywall-actions"));
need("form-panel base padding", css.includes(".form-panel") && css.includes("padding: var(--space-5)"));

const pillH = parseInt(doorSvg.match(/y="212" width="580" height="(\d+)"/)?.[1] || "0", 10);
need("OG highlight min height", pillH >= 94);

console.log(fail ? `\nBox spacing audit FAILED (${fail})` : "\nBox spacing audit OK");
process.exit(fail ? 1 : 0);
