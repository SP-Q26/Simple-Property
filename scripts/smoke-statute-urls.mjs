#!/usr/bin/env node
/** GET check on outbound statute URLs · warn on drift (CI-friendly). */
import { STATUTE_URLS, CHICAGO_RLTO_URL } from "../web/lib/statute-urls.mjs";

const urls = { ...STATUTE_URLS, CHICAGO_RLTO: CHICAGO_RLTO_URL };
const strict = process.env.SPT_SMOKE_STRICT_STATUTES === "1";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Codifiers that block bots but load in browsers. */
function acceptStatus(code, status) {
  if (status >= 200 && status < 400) return true;
  if (status === 403 && (code === "GA" || code === "MS" || code === "CHICAGO_RLTO")) return true;
  return false;
}

let fail = 0;
for (const [code, url] of Object.entries(urls)) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(35000),
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    });
    if (!acceptStatus(code, res.status)) {
      console.error("STATUTE GET", code, res.status, url);
      if (res.status === 404 || res.status === 410) fail++;
      else console.warn("STATUTE WARN", code, "non-fatal", res.status);
    } else console.log("OK", code, res.status);
  } catch (err) {
    console.warn("STATUTE WARN", code, "fetch", err.message);
  }
}
if (fail) {
  console.error(`smoke-statute-urls · ${fail} bad`);
  if (strict) process.exit(1);
  process.exit(0);
}
console.log("smoke-statute-urls OK");
