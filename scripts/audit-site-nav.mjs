#!/usr/bin/env node
/** Unified product nav · Deposit Desk + Condition hub on customer HTML. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("SITE NAV FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "brand" || name === "node_modules") continue;
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const skipNavCheck = new Set(["hub.html"]);

for (const file of walkHtml(web)) {
  const rel = file.replace(web + "/", "");
  if (rel.startsWith("brand/")) continue;
  const html = readFileSync(file, "utf8");
  if (!html.includes("header-nav")) continue;
  if (skipNavCheck.has(rel)) {
    const header = html.match(/<nav class="header-nav"[\s\S]*?<\/nav>/)?.[0] || "";
    need(`${rel} header no hub self-link`, !header.includes('href="/hub">Condition hub'));
    need(`${rel} Deposit Desk nav`, header.includes('href="/app">Deposit Desk'));
    continue;
  }
  need(`${rel} Deposit Desk nav label`, html.includes('href="/app">Deposit Desk'));
  need(`${rel} Condition hub nav`, html.includes('href="/hub">Condition hub'));
  need(`${rel} no legacy App nav`, !html.includes('href="/app">App<'));
}

const shell = readFileSync(join(web, "brand/shell-header.html"), "utf8");
need("shell-header Deposit Desk", shell.includes('href="/app">Deposit Desk'));
need("shell-header Condition hub", shell.includes('href="/hub">Condition hub'));

console.log(fail ? `\nSite nav audit FAILED (${fail})` : "\nSite nav audit OK");
process.exit(fail ? 1 : 0);
