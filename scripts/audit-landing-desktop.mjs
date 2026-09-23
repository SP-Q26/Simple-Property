#!/usr/bin/env node
/** Desktop landing · fonts · copy · SEO gates (home only). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const index = readFileSync(join(web, "index.html"), "utf8");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("LANDING FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

need("home hero-mission h1", index.includes('class="hero-mission"'));
need("home no stale 6-state FAQ", !index.includes("Wisconsin and other states are not in the app"));
need("home multistate FAQ", index.includes("18 states + DC") && index.includes("Which states"));
need("home hero door svg", index.includes("spt-hero-door.svg"));
need("home canonical apex", index.includes('rel="canonical" href="https://simple-property.com/"'));
need("home JSON-LD SoftwareApplication url", index.includes('"url": "https://simple-property.com/app"'));
need("home JSON-LD WebSite", index.includes('"@type": "WebSite"'));
need("css display + UI fonts", css.includes("--font-display") && css.includes("Lora"));
need("css desktop landing block", css.includes(".page > main .hero") && css.includes("text-wrap: balance"));
need("css v31 header", css.includes("v31"));

const title = index.match(/<title>([^<]+)<\/title>/)?.[1] || "";
need("title mentions deposit + states", /deposit/i.test(title) && /18 states|DC/i.test(title));
if (title.length > 70) {
  console.warn("WARN title length", title.length, "(ideal ≤60–70)");
}

console.log(fail ? `\nLanding desktop audit FAILED (${fail})` : "\nLanding desktop audit OK");
process.exit(fail ? 1 : 0);
