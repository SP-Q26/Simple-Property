#!/usr/bin/env node
/** Each shipped wizard state needs pain + law/landlord coverage in blog-manifest. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";

const manifest = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "web", "data", "blog-manifest.json"), "utf8")
);

function postsFor(code) {
  return manifest.posts.filter((p) => Array.isArray(p.states) && p.states.includes(code));
}

let fail = 0;
for (const code of SUPPORTED_STATES) {
  const list = postsFor(code);
  const pain = list.filter((p) => p.intent === "pain" || p.category === "pain");
  if (list.length < 3) {
    console.error(`FAIL ${code}: only ${list.length} posts (need ≥3)`);
    fail++;
  } else if (!pain.length) {
    console.error(`FAIL ${code}: no pain-tagged post`);
    fail++;
  } else {
    console.log(`ok ${code} · ${list.length} posts · ${pain.length} pain`);
  }
}

if (manifest.stateOrder?.length !== SUPPORTED_STATES.length) {
  console.error("FAIL manifest.stateOrder length mismatch");
  fail++;
}

if (fail) process.exit(1);
console.log("audit-state-blog-coverage OK");
