#!/usr/bin/env node
/** P0: 18 states + DC (19 wizard codes) in deposit-rules.mjs */
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";

if (SUPPORTED_STATES.length !== 19) {
  console.error(`FAIL: expected 19 codes (18 states + DC), got ${SUPPORTED_STATES.length}`);
  process.exit(1);
}
if (!SUPPORTED_STATES.includes("DC") || !STATE_PACKS.DC) {
  console.error("FAIL: DC pack missing");
  process.exit(1);
}
for (const code of ["NC", "TX", "FL"]) {
  if (code === "TX" || code === "FL") {
    if (SUPPORTED_STATES.includes(code)) {
      console.error(`FAIL: deferred state ${code} must not ship`);
      process.exit(1);
    }
  }
}
if (!SUPPORTED_STATES.includes("NC")) {
  console.error("FAIL: NC should be shipped");
  process.exit(1);
}
console.log(`verify-deposit-states OK · ${SUPPORTED_STATES.length} codes (18 states + DC)`);
