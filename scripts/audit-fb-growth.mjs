#!/usr/bin/env node
/** FB / paid-social conversion wiring · attribution · compare CTAs · home pathway. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("FB GROWTH FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

const spEvents = readFileSync(join(web, "sp-events.js"), "utf8");
need("sp_landing_capture", spEvents.includes("sp_landing_capture"));
need("sptGetAttribution", spEvents.includes("sptGetAttribution"));
need("sp_fb_landing", spEvents.includes("sp_fb_landing"));

const appJs = readFileSync(join(web, "app.js"), "utf8");
need("sp_app_open telemetry", appJs.includes('sp_app_open'));
need("utm_content state preset", appJs.includes("utm_content"));
need("paywall economics line", appJs.includes("paywall-economics"));

const index = readFileSync(join(web, "index.html"), "utf8");
need("fb pathway script on home", index.includes("/spt-fb-pathway.js"));

const fbPath = readFileSync(join(web, "spt-fb-pathway.js"), "utf8");
need("fb pathway turnover link", fbPath.includes("turnover=1"));

const goalCopy = readFileSync(join(root, "scripts/lib/blog-goal-copy.mjs"), "utf8");
need("compare CTA variant", goalCopy.includes('variant === "compare"'));

const manifest = JSON.parse(readFileSync(join(web, "data/blog-manifest.json"), "utf8"));
const compare = manifest.posts.filter((p) => p.routeSeries === "compare");
need("compare routeSeries >= 5", compare.length >= 5);
const statutes = manifest.posts.filter((p) => p.routeSeries === "deposit-statutes");
need("deposit-statutes routeSeries >= 5", statutes.length >= 5);

const hub = readFileSync(join(web, "blog/index.html"), "utf8");
need("blog compare cluster", hub.includes("cluster-compare") && hub.includes("guides-compare"));
need("blog hub filter script", hub.includes("blog-hub-filter.js"));

console.log(fail ? `\nFB growth audit FAILED (${fail})` : "\nFB growth audit OK");
process.exit(fail ? 1 : 0);
