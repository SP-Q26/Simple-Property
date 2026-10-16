#!/usr/bin/env node
/**
 * Git-facing copy · README + deploy canon (URLs, no secrets, no personal email).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("REPO COPY FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const files = [
  "README.md",
  "docs/CANON.md",
  "docs/BRAND.md",
  "docs/DEPLOY.md",
  "docs/VERCEL_SETUP.md",
];

const forbidden = [
  /simple-property-spq\.vercel\.app/i,
  /@gmail\.com/i,
  /@icloud\.com/i,
  /@me\.com/i,
  /sk_live_[a-zA-Z0-9]+/i,
  /whsec_[a-zA-Z0-9]{10,}/i,
  /re_[a-zA-Z0-9]{20,}/i,
];

for (const rel of files) {
  const p = join(root, rel);
  if (!existsSync(p)) {
    need(`${rel} exists`, false);
    continue;
  }
  const text = readFileSync(p, "utf8");
  for (const re of forbidden) {
    need(`${rel} no ${re.source}`, !re.test(text));
  }
}

const readme = readFileSync(join(root, "README.md"), "utf8");
need("README links Simple-Property repo", readme.includes("SP-Q26/Simple-Property"));
need("README production apex", readme.includes("simple-property.com"));
need("README Vercel root web/", readme.includes("root `web`") || readme.includes("Root directory:** `web`"));
need("README not legal advice", readme.toLowerCase().includes("not legal advice"));

const deploy = readFileSync(join(root, "docs/DEPLOY.md"), "utf8");
need("DEPLOY webhook on apex", deploy.includes("https://simple-property.com/api/stripe/webhook"));
need("DEPLOY noreply git email", deploy.includes("@users.noreply.github.com"));

const vercel = readFileSync(join(root, "docs/VERCEL_SETUP.md"), "utf8");
need("VERCEL_SETUP primary domain", vercel.includes("simple-property.com"));

console.log(fail ? `\nRepo git copy FAILED (${fail})` : "\nRepo git copy audit OK");
process.exit(fail ? 1 : 0);
