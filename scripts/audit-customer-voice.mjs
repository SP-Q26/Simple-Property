#!/usr/bin/env node
/**
 * Customer voice · no backend roadmap, ship dates, or internal momentum on public HTML.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

const FORBIDDEN = [
  { re: /\bon the roadmap\b/i, label: "on the roadmap" },
  { re: /\bon roadmap\b/i, label: "on roadmap" },
  { re: /\bTestFlight\b/, label: "TestFlight" },
  { re: /\bwhat shipped\b/i, label: "what shipped" },
  { re: /\bis in build\b/i, label: "is in build" },
  { re: /\bforwarding-address clock\b/i, label: "forwarding-address clock spec" },
  { re: /\bdeferred until we ship\b/i, label: "deferred until we ship" },
  { re: /\bwe will post here when\b/i, label: "we will post here when" },
  { re: /\bThis release adds\b/i, label: "This release adds" },
  { re: /\bwe prioritize the next pack\b/i, label: "we prioritize the next pack" },
  { re: /\bProduct lanes next\b/i, label: "Product lanes next" },
  { re: /\bwhen each ships\b/i, label: "when each ships" },
  { re: /\bspecced in our\b/i, label: "specced in our" },
  { re: /\biOS app incoming\b/i, label: "iOS app incoming" },
  { re: /\bdeferred rulesets\b/i, label: "deferred rulesets" },
];

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** Public marketing + guides · app/logs stay noindex but still customer-facing strings. */
const scanRoots = [
  join(web, "index.html"),
  join(web, "pricing.html"),
  join(web, "feedback.html"),
  join(web, "launch-stack.html"),
  join(web, "legal.html"),
  join(web, "terms.html"),
  join(web, "privacy.html"),
  join(web, "success.html"),
  join(web, "blog"),
];

const files = new Set();
for (const root of scanRoots) {
  if (!statSync(root).isDirectory()) files.add(root);
  else walkHtml(root, []).forEach((f) => files.add(f));
}

for (const file of files) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const { re, label } of FORBIDDEN) {
    if (re.test(visible)) {
      console.error("VOICE FAIL:", rel, "·", label);
      fail++;
    }
  }
}

if (!fail) console.log("ok: customer voice · no internal momentum leaks");
console.log(fail ? `\nCustomer voice FAILED (${fail})` : "\nCustomer voice OK");
process.exit(fail ? 1 : 0);
