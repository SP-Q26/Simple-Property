#!/usr/bin/env node
/**
 * Customer lane · nothing public that does not help conversion, trust, or IL deposit job.
 * (Innsegall brand-stack / privacy / shell discipline — SPT slice.)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function check(name, ok) {
  if (!ok) {
    console.error("CUSTOMER FAIL:", name);
    fail++;
  } else {
    console.log("ok:", name);
  }
}

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const pricing = readFileSync(join(web, "pricing.html"), "utf8");
check("pricing hides demo=pro hack", !pricing.includes("demo=pro"));
check("pricing points to app", pricing.includes('href="/app"'));

const checkout = readFileSync(join(web, "sp-checkout.js"), "utf8");
check("checkout error is customer-safe", !checkout.includes("STRIPE_SECRET") && !checkout.includes("dev tools"));

const demoGate = readFileSync(join(web, "spt-demo-gate.js"), "utf8");
check("demo pro gated off apex", demoGate.includes(".vercel.app") && demoGate.includes("localhost"));

for (const file of walkHtml(join(web, "blog"))) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  check(`${rel} has app CTA`, html.includes('href="/app"') || html.includes('href="/launch-stack"'));
}

const index = readFileSync(join(web, "index.html"), "utf8");
check("home primary CTA to app", index.includes('href="/app"'));
check("home launch stack", index.includes("/launch-stack"));

const forbidden = ["innsegall", "spquant", "weweb", "battle scout", "Macintosh triage"];
for (const file of [...walkHtml(web), ...walkHtml(join(web, "blog"))]) {
  const rel = file.replace(web + "/", "");
  const low = readFileSync(file, "utf8").toLowerCase();
  for (const term of forbidden) {
    if (low.includes(term)) {
      console.error("CUSTOMER FAIL: off-lane term", term, "in", rel);
      fail++;
    }
  }
}

console.log(fail ? `\nCustomer lane FAILED (${fail})` : "\nCustomer lane OK");
process.exit(fail ? 1 : 0);
