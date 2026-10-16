#!/usr/bin/env node
/**
 * Vercel Hobby · max 12 Serverless Functions per deployment (all web/api .js handlers).
 */
import { readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiRoot = join(root, "web", "api");
const MAX = 12;

function listApiHandlers(dir, base = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (statSync(p).isDirectory()) {
      out.push(...listApiHandlers(p, rel));
    } else if (name.endsWith(".js")) {
      out.push(rel);
    }
  }
  return out.sort();
}

const handlers = listApiHandlers(apiRoot);
const n = handlers.length;

if (n > MAX) {
  console.error(`VERCEL FUNCTIONS FAIL: ${n} handlers (Hobby max ${MAX})`);
  for (const h of handlers) console.error("  -", h);
  process.exit(1);
}

console.log(`Vercel serverless functions: ${n}/${MAX}`);
for (const h of handlers) console.log("  -", h);
console.log("\nVercel functions audit OK");
process.exit(0);
