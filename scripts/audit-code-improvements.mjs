#!/usr/bin/env node
/**
 * Static code-health gates · defer scripts, idle boot, CSS version sync, no debug noise.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VERSION } from "../web/lib/brand-locale.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok, detail = "") {
  if (!ok) {
    console.error("CODE FAIL:", label, detail || "");
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

console.log("── Code improvements audit ──\n");

const css = read("simple-property.css");
need(`css header v${CSS_VERSION}`, css.includes(`v${CSS_VERSION}`));
need("home defer paint", css.includes(".home-defer-paint") && css.includes("content-visibility: auto"));
need("faq layout grid", css.includes(".faq-doors-layout") && css.includes(".faq-doors-jump"));

const index = read("index.html");
need("home FAQ layout", index.includes("faq-doors-layout") && index.includes("faq-doors-jump"));
need("home defer sections", index.includes("home-defer-paint"));
need(`index css v${CSS_VERSION}`, index.includes(`simple-property.css?v=${CSS_VERSION}`));

const homeBoot = read("home-boot.js");
need("home-boot idle traction", homeBoot.includes("requestIdleCallback") && homeBoot.includes("loadTraction"));
need("home-boot FAQ wire", homeBoot.includes("wireFaqDoors"));

const court = read("court-record-rotate.js");
need("court-record idle boot", court.includes("requestIdleCallback"));
need("court-record snippet cache", court.includes("__sptCourtSnippetsP"));

const door = read("spt-door-arrival-lottie.js");
need("door arrival skip repeat visit", door.includes("if (!shouldPlay()) return"));
need("index lottie preload skip", index.includes("spt-lottie-preload") && index.includes("spt_door_arrival_seen"));
need("home-boot FAQ hash", homeBoot.includes("openFaqFromHash"));

const keyJs = ["home-boot.js", "court-record-rotate.js", "sp-nav.js", "sp-events.js"];
for (const f of keyJs) {
  const src = read(f);
  need(`${f} no console.log`, !/\bconsole\.log\s*\(/.test(src));
}

const marketingPages = ["index.html", "pricing.html", "pain.html", "blog/index.html"];
for (const p of marketingPages) {
  const h = read(p);
  const syncScripts =
    h.match(/<script src="\/[^"]+\.js"(?![^>]*\bdefer\b)[^>]*>/g)?.filter((s) => !s.includes("_vercel")) || [];
  need(`${p} local scripts defer`, syncScripts.length === 0, syncScripts.join("; "));
}

function walkJs(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walkJs(p, acc);
    else if (n.endsWith(".js") && !n.endsWith(".min.js")) acc.push(p);
  }
  return acc;
}

let huge = 0;
for (const p of walkJs(web)) {
  const rel = p.replace(web + "/", "");
  if (rel.startsWith("node_modules") || rel.startsWith("vendor/")) continue;
  const bytes = statSync(p).size;
  if (rel === "app.js" && bytes > 90 * 1024) {
    need("app.js under 90KB", false, `${bytes} bytes`);
  }
  if (bytes > 120 * 1024) huge++;
}
need("no stray js over 120KB (ex vendor)", huge === 0, huge ? `${huge} file(s)` : "");

need("vercel.json present", existsSync(join(web, "vercel.json")));

console.log(fail ? `\nCode improvements audit FAILED (${fail})` : "\nCode improvements audit OK");
process.exit(fail ? 1 : 0);
