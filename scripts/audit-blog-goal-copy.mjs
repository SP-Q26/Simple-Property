#!/usr/bin/env node
/**
 * Full blog corpus · goal copy on every manifest guide.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hasPainFraming } from "./lib/blog-goal-copy.mjs";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
const manifest = JSON.parse(readFileSync(join(web, "data", "blog-manifest.json"), "utf8"));
const blogIndex = readFileSync(join(web, "blog", "index.html"), "utf8");
const ACTION = /\b(Start|Open|Try|Continue|Get|See pricing|Walk)\b/i;

let fail = 0;
const failures = [];

function need(label, ok) {
  if (!ok) {
    failures.push(label);
    fail++;
  }
}

need("blog index pain lead", blogIndex.includes("ps-problem") && blogIndex.includes("ps-fix"));
need("blog index primary CTA", blogIndex.includes('btn-primary') && blogIndex.includes("/app"));
need("blog index hub CTA", blogIndex.includes("/hub"));
need("blog index action verb", ACTION.test(blogIndex));

let checked = 0;
for (const post of manifest.posts) {
  const path = join(web, "blog", `${post.slug}.html`);
  if (!existsSync(path)) {
    need(`missing file ${post.slug}`, false);
    continue;
  }
  checked++;
  const html = readFileSync(path, "utf8");
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const main = visible.match(/<main[\s\S]*?<\/main>/i)?.[0] || visible;

  need(`${post.slug} legal disclaimer`, /not legal advice/i.test(main));
  need(`${post.slug} pain framing`, hasPainFraming(main));
  need(`${post.slug} guide CTA block`, main.includes("spt-guide-cta") && main.includes("btn-primary"));
  need(`${post.slug} action verb`, ACTION.test(main));
  need(`${post.slug} app link`, /href="\/app/.test(main));
}

if (fail <= 12) {
  for (const f of failures) console.error("BLOG GOAL COPY FAIL:", f);
} else {
  console.error(`BLOG GOAL COPY FAIL: ${fail} issues (first 12):`);
  failures.slice(0, 12).forEach((f) => console.error(" ·", f));
}

console.log(`checked ${checked} manifest posts`);
console.log(fail ? `\nBlog goal copy audit FAILED (${fail})` : "\nBlog goal copy audit OK");
process.exit(fail ? 1 : 0);
