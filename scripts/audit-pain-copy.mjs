#!/usr/bin/env node
/**
 * Pain → fix + economic loss framing on customer surfaces.
 * Color bar replaced geographic map · no stale "tap the map" copy.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("PAIN COPY FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function read(rel) {
  return readFileSync(join(web, rel), "utf8");
}

const LOSS =
  /costs more|cost more|lose deposits|penalties|beats \$\d|beats tool|beats our|wastes the unlock|add up fast|dispute cost|economic|one mistake/i;

function painFixCount(html) {
  const problems = (html.match(/class="ps-problem"/g) || []).length;
  const fixes = (html.match(/class="ps-fix"/g) || []).length;
  return { problems, fixes };
}

const index = read("index.html");
const nav = read("sp-nav.js");
const blogIndex = read("blog/index.html");
const appHtml = read("app.html");
const pricing = read("pricing.html");
const success = read("success.html");
const logs = read("logs.html");
const appJs = read("app.js");

need("index no stale tap-the-map", !/tap the map/i.test(index));
need("blog index no map above", !/map above/i.test(blogIndex));
need("index coverage color bar copy", /color bar/i.test(index) && index.includes("coverage-spotlight"));
need("index pain blocks", painFixCount(index).problems >= 3 && painFixCount(index).fixes >= 3);
need("index loss framing", LOSS.test(index));

need("sp-nav color strip", nav.includes("coverage-bubbles--strip"));
need("sp-nav no wrong color kicker", !/Wrong color\s*=/.test(nav));
need("sp-nav legend tap state", nav.includes("Tap your state"));
need("sp-nav buildCoverageMap not geographic map copy", !nav.includes("Tap the map") && !nav.includes("state map"));
need("sp-nav loss in locale bar", LOSS.test(nav));

need("blog index loss or pain hub", /pain|missed|dispute/i.test(blogIndex));
need("app.html pain + fix", appHtml.includes("ps-problem") && appHtml.includes("ps-fix"));
need("app.html loss in intro", LOSS.test(appHtml));
need("pricing pain + loss", pricing.includes("ps-problem") && LOSS.test(pricing));
need("success pain framing", success.includes("ps-problem"));
need("logs pain + fix", logs.includes("ps-problem") && logs.includes("ps-fix"));

need("app paywall loss line", /costs more than \$29|cost more than/i.test(appJs));
need("pricing finder loss", read("sp-pricing-finder.js").match(LOSS));

const pathwayCards = index.match(/pathway-card__desc/g)?.length || 0;
need("index pathway cards", pathwayCards >= 4);
need(
  "pathway per-turn loss hint",
  index.includes("pathway-card") && /costs more|beats|penalt/i.test(index)
);

const corePages = ["index.html", "pricing.html", "app.html", "logs.html", "success.html"];
for (const page of corePages) {
  const html = read(page);
  need(`${page} not legal advice`, /not legal advice/i.test(html));
}

console.log(fail ? `\nPain copy audit FAILED (${fail})` : "\nPain copy audit OK");
process.exit(fail ? 1 : 0);
