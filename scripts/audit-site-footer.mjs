#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FOOTER_COLLECTIVE, FOOTER_WEB_CREDIT } from "./lib/site-footer.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const css = readFileSync(join(web, "simple-property.css"), "utf8");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("FOOTER FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function walkHtml(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (n === "brand" || n === "node_modules") continue;
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}

need("footer shell css", css.includes(".footer-shell") && css.includes(".footer-collective"));
need("footer credit css", css.includes(".footer-credit__name"));
need("footer gradient rule", css.includes("linear-gradient") && css.includes(".site-footer"));

const pages = walkHtml(web);
let missing = 0;
for (const f of pages) {
  const h = readFileSync(f, "utf8");
  if (!h.includes("footer-shell")) missing++;
  if (!h.includes(FOOTER_COLLECTIVE)) missing++;
  if (!h.includes("All rights reserved")) missing++;
  if (!h.includes(FOOTER_WEB_CREDIT)) missing++;
}
need("all html footers canonical", missing === 0);

need("index footer", readFileSync(join(web, "index.html"), "utf8").includes("Web by"));

console.log(fail ? `\nSite footer audit FAILED (${fail})` : "\nSite footer audit OK");
process.exit(fail ? 1 : 0);
