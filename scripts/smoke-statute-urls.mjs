#!/usr/bin/env node
/** HEAD check on outbound statute URLs · warn on drift (CI-friendly). */
import { STATUTE_URLS, CHICAGO_RLTO_URL } from "../web/lib/statute-urls.mjs";

const urls = { ...STATUTE_URLS, CHICAGO_RLTO: CHICAGO_RLTO_URL };
const strict = process.env.SPT_SMOKE_STRICT_STATUTES === "1";

let fail = 0;
for (const [code, url] of Object.entries(urls)) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (res.status >= 400) {
      console.error("STATUTE HEAD", code, res.status, url);
      fail++;
    } else console.log("OK", code, res.status);
  } catch (err) {
    console.error("STATUTE FAIL", code, url, err.message);
    fail++;
  }
}
if (fail) {
  console.error(`smoke-statute-urls · ${fail} bad`);
  if (strict) process.exit(1);
  process.exit(0);
}
console.log("smoke-statute-urls OK");
