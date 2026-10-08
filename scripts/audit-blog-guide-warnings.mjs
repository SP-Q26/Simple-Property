#!/usr/bin/env node
/** Pain/news guides carry story warnings · canonical guides cite dispute stories. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
let fail = 0;

function need(label, ok) {
  if (!ok) {
    console.error("GUIDE WARNING FAIL:", label);
    fail++;
  } else console.log("ok:", label);
}

function readBlog(slug) {
  return readFileSync(join(web, "blog", `${slug}.html`), "utf8");
}

const pain = manifest.posts.filter((p) => p.intent === "pain" || p.category === "pain");
const samplePain = pain[0]?.slug;
if (samplePain) {
  const h = readBlog(samplePain);
  need(`pain post warning ${samplePain}`, h.includes("spt-guide-warning") && h.includes("Guide references"));
}

const lawWatch = manifest.posts.find((p) => p.lawWatch);
if (lawWatch) {
  const h = readBlog(lawWatch.slug);
  need(`law watch warning ${lawWatch.slug}`, h.includes("spt-guide-warning"));
}

const deadline = manifest.posts.find((p) => p.slug === "illinois-30-day-deposit-deadline");
if (deadline) {
  const h = readBlog(deadline.slug);
  need("IL deadline story warning", h.includes("This could happen:") && h.includes("tenant-disputes"));
}

need("public traction json", readFileSync(join(web, "data/public-traction.json"), "utf8").includes("landlordsMin"));
need("public traction api", readFileSync(join(web, "api/public-traction.js"), "utf8").includes("public-traction.json"));
need("home traction fetch", readFileSync(join(web, "home-traction.js"), "utf8").includes("/data/public-traction.json"));

console.log(fail ? `\nGuide warning audit FAILED (${fail})` : "\nGuide warning audit OK");
process.exit(fail ? 1 : 0);
