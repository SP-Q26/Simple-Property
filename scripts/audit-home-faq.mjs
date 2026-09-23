#!/usr/bin/env node
/** Home FAQ visible accordions match FAQPage JSON-LD count and multistate gates. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const index = readFileSync(join(web, "index.html"), "utf8");

let fail = 0;
function need(label, ok) {
  if (!ok) {
    console.error("FAIL", label);
    fail++;
  } else console.log("OK", label);
}

const details = (index.match(/<details class="faq-door"/g) || []).length;
const questions = (index.match(/"@type": "Question"/g) || []).length;

need("FAQ details count", details >= 8);
need("FAQ schema Question count matches details", questions === details);
need("FAQ multistate states answer", index.includes("Which states are in the wizard?"));
need("FAQ pricing numbers", index.includes("$29") && index.includes("$99"));
need("FAQ legal advice item", index.includes("Is this legal advice?"));
need("FAQ no stale Wisconsin", !index.includes("Wisconsin and other states are not in the app"));
need("FAQ door panels", index.includes("faq-doors") && index.includes("faq-door"));
need("FAQ nine doors heading", index.includes("Nine doors"));

console.log(fail ? `Home FAQ audit FAILED (${fail})` : "Home FAQ audit OK");
process.exit(fail ? 1 : 0);
