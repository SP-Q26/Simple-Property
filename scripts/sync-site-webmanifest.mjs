#!/usr/bin/env node
/** Keep site.webmanifest aligned with brand-locale coverage copy. */
import { writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TAGLINE, STATE_ONLY_COUNT } from "../web/lib/brand-locale.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const path = join(web, "site.webmanifest");
const coverage = `${STATE_ONLY_COUNT} states + DC`;
const manifest = {
  name: "Simple Property Tools · Deposit Desk",
  short_name: "Deposit Desk",
  description: `${BRAND_TAGLINE} · Security deposit packets · ${coverage} · founded in Chicago.`,
  start_url: "/",
  display: "standalone",
  background_color: "#f4f0e6",
  theme_color: "#f4f0e6",
  icons: [
    { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
  ],
};
const next = JSON.stringify(manifest, null, 2) + "\n";
const prev = readFileSync(path, "utf8");
if (prev !== next) {
  writeFileSync(path, next);
  console.log("sync-site-webmanifest · updated", coverage);
} else {
  console.log("sync-site-webmanifest · OK", coverage);
}
