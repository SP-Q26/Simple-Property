#!/usr/bin/env node
/**
 * Production full send · Resend + Stripe live audit + platform smokes + proud-ship audit.
 * See docs/FULL_SEND_STRIPE.md
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

function loadDotEnvLocal() {
  const p = join(dirname(fileURLToPath(import.meta.url)), "..", "web", ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnvLocal();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

if (!(process.env.STRIPE_SECRET_KEY || "").trim()) {
  console.error(
    "full-send requires STRIPE_SECRET_KEY (sk_live_…) for audit:stripe-live.\n" +
      "  export STRIPE_SECRET_KEY=…   or add to web/.env.local (gitignored)\n" +
      "  See docs/FULL_SEND_STRIPE.md",
  );
  process.exit(1);
}

const steps = [
  "run audit:resend",
  "run audit:stripe-live",
  "run smoke:health",
  "run smoke:reminders",
  "run smoke:feedback",
  "run smoke:checkout",
  "run audit",
  "run smoke:prod",
  "run smoke:extended",
  "run smoke:states-blogs",
  "run smoke:magic-link",
];

console.log("── Deposit Desk full send ──\n");
for (const step of steps) {
  console.log(`\n▶ npm ${step}\n`);
  const r = spawnSync(npm, step.split(" "), { cwd: root, stdio: "inherit", env: process.env });
  if (r.status !== 0) {
    console.error(`\nfull-send FAILED at: npm ${step}`);
    process.exit(r.status ?? 1);
  }
}
console.log("\nfull-send OK");
