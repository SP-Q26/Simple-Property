#!/usr/bin/env node
/** P0: state packs + DC in deposit-rules.mjs */
import { SUPPORTED_STATES, STATE_PACKS } from "../web/lib/deposit-rules.mjs";
import { STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";

const expectedCodes = STATE_ONLY_COUNT + 1; // states + DC
if (SUPPORTED_STATES.length !== expectedCodes) {
  console.error(`FAIL: expected ${expectedCodes} codes (${STATE_ONLY_COUNT} states + DC), got ${SUPPORTED_STATES.length}`);
  process.exit(1);
}
if (!SUPPORTED_STATES.includes("DC") || !STATE_PACKS.DC) {
  console.error("FAIL: DC pack missing");
  process.exit(1);
}
if (!SUPPORTED_STATES.includes("FL") || !STATE_PACKS.FL) {
  console.error("FAIL: FL pack missing (Miami lane)");
  process.exit(1);
}
for (const code of ["TX", "AZ", "WI"]) {
  if (SUPPORTED_STATES.includes(code)) {
    console.error(`FAIL: deferred state ${code} must not ship without spec`);
    process.exit(1);
  }
}
if (!SUPPORTED_STATES.includes("NC")) {
  console.error("FAIL: NC should be shipped");
  process.exit(1);
}
console.log(`verify-deposit-states OK · ${SUPPORTED_STATES.length} codes (${STATE_ONLY_COUNT} states + DC)`);
