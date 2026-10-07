#!/usr/bin/env node
/**
 * Hyper-focused Chicago · DC · Miami metro blog series (Oct 2026).
 * Run: node scripts/generate-metro-hyperfocus-oct-2026.mjs && npm run build-blog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";
import { hubFooterHtml } from "./lib/state-hub-links.mjs";
import { citeLinkHtml } from "./lib/cite-link-html.mjs";
import { STATE_PACKS } from "../web/lib/deposit-rules.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-10-07";

const FL_CITE = citeLinkHtml("Fla. Stat. § 83.49", "FL");
const IL_CITE = citeLinkHtml("765 ILCS 715/", "IL");
const DC_CITE = citeLinkHtml("D.C. Code § 42-3502.17", "DC");

const POSTS = [
  {
    slug: "portage-park-three-flat-rlto-deposit-clock",
    title: "Portage Park three-flat: RLTO deposit clock",
    description:
      "RLTO 45-day return on a Portage Park three-flat. Surrender, itemization, export. Not legal advice.",
    series: "chicago-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["IL"],
    statutes: ["765 ILCS 715/", "Chicago RLTO"],
    body: `
      <p class="hero-eyebrow">Chicago · three-flat</p>
      <h1>Portage Park three-flat: start the RLTO deposit clock on surrender</h1>
      <p>Classic Portage Park three-flats share stairs, basements, and one deposit fight per turnover. The clock starts on <strong>surrender</strong>, not lease end alone.</p>
      <dl class="fact-strip">
        <div><dt>Clock</dt><dd><strong>45 days</strong> Chicago RLTO · <strong>30 days</strong> elsewhere in IL</dd></div>
        <div><dt>Statute</dt><dd>${IL_CITE}</dd></div>
      </dl>
      <ul>
        <li>Log surrender when keys are back and the unit is vacant.</li>
        <li>Turn on Chicago in step 1 · see <a href="/blog/chicago-45-day-deposit-deadline">Chicago RLTO 45-day deadline</a>.</li>
        <li>Itemize shared-stair withholds · <a href="/blog/illinois-deposit-itemization">Illinois itemization</a>.</li>
      </ul>
      ${hubFooterHtml("IL", "Illinois")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=IL">Start Illinois packet</a></p>`,
  },
  {
    slug: "logan-square-greystone-two-flat-deposit-photos",
    title: "Logan Square greystone: deposit photo habits",
    description:
      "Greystone two-flat move-out photos that match later withhold lines. Chicago RLTO. Not legal advice.",
    series: "chicago-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["IL"],
    statutes: ["765 ILCS 715/", "Chicago RLTO"],
    body: `
      <p class="hero-eyebrow">Chicago · greystone</p>
      <h1>Logan Square greystone two-flat: photos that survive itemization</h1>
      <p>Shoot shared entries, rear porches, and radiators before touch-up paint. Tie each withhold to dated photos in <a href="/logs">operator logs</a>.</p>
      <ul>
        <li><a href="/blog/move-in-inspection-checklist-illinois">Move-in checklist</a> habits carry into move-out.</li>
        <li><a href="/blog/normal-wear-vs-damage-illinois">Wear vs damage</a> on old trim and plaster.</li>
        <li>Export before the RLTO deadline on screen.</li>
      </ul>
      ${hubFooterHtml("IL", "Illinois")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=IL">Start Illinois packet</a></p>`,
  },
  {
    slug: "hyde-park-vintage-flat-normal-wear-deposit",
    title: "Hyde Park vintage flat: wear vs withhold",
    description:
      "Plaster, hardwood, and old trim in Hyde Park flats. RLTO itemization habits. Not legal advice.",
    series: "chicago-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["IL"],
    statutes: ["765 ILCS 715/", "Chicago RLTO"],
    body: `
      <p class="hero-eyebrow">Chicago · vintage flat</p>
      <h1>Hyde Park vintage flat: normal wear vs deposit withholds</h1>
      <p>Label hairline plaster and sun-faded trim as wear unless move-in proof says otherwise. Separate appliance damage from settling.</p>
      <ul>
        <li><a href="/blog/normal-wear-vs-damage-illinois">Wear vs damage guide</a>.</li>
        <li><a href="/blog/illinois-return-and-itemization-letter">Return and itemization letter</a>.</li>
        <li>Chicago RLTO toggle on step 1 for 45-day math.</li>
      </ul>
      ${hubFooterHtml("IL", "Illinois")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=IL">Start Illinois packet</a></p>`,
  },
  {
    slug: "pilsen-walk-up-keys-mailed-surrender-illinois",
    title: "Pilsen walk-up: keys by mail, when clock starts",
    description:
      "Tenant mailed keys after a Pilsen walk-up lease ended. Surrender vs RLTO clock. Not legal advice.",
    series: "chicago-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["IL"],
    statutes: ["765 ILCS 715/", "Chicago RLTO"],
    body: `
      <p class="hero-eyebrow">Chicago · walk-up</p>
      <h1>Pilsen walk-up: keys in the mail and the deposit clock</h1>
      <p>Surrender is vacant unit plus keys received, not postmark alone. Document when you could re-enter.</p>
      <ul>
        <li><a href="/blog/keys-not-returned-deposit-clock-illinois">Keys not returned guide</a>.</li>
        <li><a href="/blog/surrender-date-illinois-deposit">Surrender date habits</a>.</li>
        <li>Pick Chicago RLTO when the building is in city limits.</li>
      </ul>
      ${hubFooterHtml("IL", "Illinois")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=IL">Start Illinois packet</a></p>`,
  },
  {
    slug: "capitol-hill-rowhouse-basement-adu-deposit-clock",
    title: "Capitol Hill rowhouse ADU: RHCA deposit clock",
    description:
      "Basement ADU turnover on Capitol Hill. RHCA 45-day discipline. Not legal advice.",
    series: "dc-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["DC"],
    statutes: ["D.C. Code § 42-3502.17"],
    body: `
      <p class="hero-eyebrow">DC · Capitol Hill</p>
      <h1>Capitol Hill rowhouse basement ADU: RHCA deposit clock</h1>
      <p>Do not run Maryland clocks on a DC basement unit. Date surrender when the English basement is vacant and keys are back.</p>
      <dl class="fact-strip">
        <div><dt>Wizard</dt><dd><strong>45 days</strong> from surrender</dd></div>
        <div><dt>Label</dt><dd>${DC_CITE}</dd></div>
      </dl>
      <ul>
        <li><a href="/blog/dc-45-day-deposit-deadline">DC 45-day deadline</a>.</li>
        <li><a href="/blog/dc-rhca-deposit-clock-rowhouse-investor">RHCA rowhouse guide</a>.</li>
        <li>Export and log mail proof in <a href="/logs">operator logs</a>.</li>
      </ul>
      ${hubFooterHtml("DC", "District of Columbia")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=DC">Start District of Columbia packet</a></p>`,
  },
  {
    slug: "petworth-english-basement-owner-occupied-deposit",
    title: "Petworth English basement: RHCA vs owner rules",
    description:
      "Owner-occupied Petworth rowhouse with a basement rental. RHCA coverage habits. Not legal advice.",
    series: "dc-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["DC"],
    statutes: ["D.C. Code § 42-3502.17"],
    body: `
      <p class="hero-eyebrow">DC · Petworth</p>
      <h1>Petworth English basement: know which deposit rules apply</h1>
      <p>Confirm RHCA coverage before you copy a suburban lease clock. Keep owner-occupied access notes separate from tenant turnover files.</p>
      <ul>
        <li><a href="/blog/dc-security-deposit-checklist">DC checklist</a>.</li>
        <li><a href="/blog/dc-deposit-itemization">DC itemization</a>.</li>
        <li>Run a DC packet with surrender on key return.</li>
      </ul>
      ${hubFooterHtml("DC", "District of Columbia")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=DC">Start District of Columbia packet</a></p>`,
  },
  {
    slug: "columbia-heights-condo-conversion-forwarding-mail",
    title: "Columbia Heights condo unit: deposit mail proof",
    description:
      "Forwarding-address gaps after a condo-conversion rental in Columbia Heights. DC mail proof. Not legal advice.",
    series: "dc-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["DC"],
    statutes: ["D.C. Code § 42-3502.17"],
    body: `
      <p class="hero-eyebrow">DC · condo conversion</p>
      <h1>Columbia Heights condo rental: deposit mail that sticks</h1>
      <p>Confirm forwarding address before you send the balance. Keep tracking numbers next to the packet export date.</p>
      <ul>
        <li><a href="/blog/dc-deposit-itemization">DC itemization</a>.</li>
        <li><a href="/blog/virginia-45-day-itemization-mail-proof">Mail proof habits</a> (belt investors).</li>
        <li>Match withhold lines to narrow-layout move-in photos.</li>
      </ul>
      ${hubFooterHtml("DC", "District of Columbia")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=DC">Start District of Columbia packet</a></p>`,
  },
  {
    slug: "shaw-carriage-house-belt-investor-dc-clock",
    title: "Shaw carriage house: belt investor DC clock",
    description:
      "Shaw carriage-house turnover when you also own in MD or VA. RHCA timing. Not legal advice.",
    series: "dc-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["DC"],
    statutes: ["D.C. Code § 42-3502.17"],
    body: `
      <p class="hero-eyebrow">DC · Shaw</p>
      <h1>Shaw carriage house: stop running Maryland clocks on DC units</h1>
      <p>Give each jurisdiction its own surrender column. Start Deposit Desk with <strong>DC</strong> for the Shaw address.</p>
      <ul>
        <li><a href="/blog/dc-rhca-deposit-clock-rowhouse-investor">DC RHCA rowhouse guide</a>.</li>
        <li><a href="/blog/maryland-45-day-belt-investor-missed-clock">Maryland belt investor guide</a>.</li>
        <li>Export before the RHCA window on screen.</li>
      </ul>
      ${hubFooterHtml("DC", "District of Columbia")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=DC">Start District of Columbia packet</a></p>`,
  },
  {
    slug: "florida-83-49-two-step-miami-condo-deposit",
    title: "Miami condo: Fla. § 83.49 two-step deposit",
    description:
      "Miami condo turnover under Fla. Stat. § 83.49: 15-day full return or claim notice, then 30-day balance. Not legal advice.",
    series: "miami-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["FL"],
    cityPreset: "miami-fl",
    statutes: ["Fla. Stat. § 83.49"],
    body: `
      <p class="hero-eyebrow">Florida · Miami condo</p>
      <h1>Miami condo: Fla. Stat. § 83.49 two-step deposit timeline</h1>
      <p>Operator workflow only, not legal advice. ${FL_CITE} uses two steps after termination and possession.</p>
      <dl class="fact-strip">
        <div><dt>Step one</dt><dd><strong>15 days</strong>: full return <strong>or</strong> written claim notice</dd></div>
        <div><dt>Step two</dt><dd><strong>30 days</strong> after notice: balance with accounting or impose claim</dd></div>
      </dl>
      <ul>
        <li>Log possession date in step 2 before HOA punch lists blur the calendar.</li>
        <li>Separate association fees from in-unit damage in withhold notes.</li>
        <li><a href="/blog/florida-missed-15-day-claim-notice-deposit">Missed 15-day fork guide</a>.</li>
      </ul>
      ${hubFooterHtml("FL", "Florida")}
      <p class="disclaimer">Not legal advice. Confirm notice content with Florida counsel.</p>
      <p><a class="btn btn-primary" href="/app?state=FL">Start Florida packet</a></p>`,
  },
  {
    slug: "brickell-high-rise-condo-deposit-itemization",
    title: "Brickell high-rise: condo deposit lines",
    description:
      "Brickell tower turnover: HOA fees vs unit withholds under Florida deposit practice. Not legal advice.",
    series: "miami-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["FL"],
    statutes: ["Fla. Stat. § 83.49"],
    body: `
      <p class="hero-eyebrow">Florida · Brickell</p>
      <h1>Brickell high-rise condo: deposit lines tenants challenge</h1>
      <p>Tag HOA move-out fees separately from guest-unit damage. Save elevator and punch-list email in <a href="/logs">operator logs</a>.</p>
      <ul>
        <li><a href="/blog/move-in-move-out-fees-vs-security-deposit">Move-in/move-out fees guide</a>.</li>
        <li><a href="/blog/florida-83-49-two-step-miami-condo-deposit">§ 83.49 two-step guide</a>.</li>
        <li>Map dates before you send claim notice.</li>
      </ul>
      ${hubFooterHtml("FL", "Florida")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=FL">Start Florida packet</a></p>`,
  },
  {
    slug: "wynwood-loft-hurricane-season-move-out-deposit",
    title: "Wynwood loft: storm-season move-out deposit",
    description:
      "Wynwood loft move-out during hurricane season. Florida 15-day first step habits. Not legal advice.",
    series: "miami-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["FL"],
    statutes: ["Fla. Stat. § 83.49"],
    body: `
      <p class="hero-eyebrow">Florida · Wynwood</p>
      <h1>Wynwood loft: storm-season move-out and deposit step one</h1>
      <p>Record possession if access was delayed after a storm. Decide early: full return within 15 days or written claim notice.</p>
      <ul>
        <li><a href="/blog/florida-83-49-two-step-miami-condo-deposit">Two-step guide</a>.</li>
        <li><a href="/blog/missed-deposit-deadline-small-landlord-multi-state">Multi-state missed deadline habits</a>.</li>
        <li>Keep roof-leak photos separate from tenant-caused holes.</li>
      </ul>
      ${hubFooterHtml("FL", "Florida")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=FL">Start Florida packet</a></p>`,
  },
  {
    slug: "little-havana-duplex-florida-claim-notice-mail",
    title: "Little Havana duplex: Florida claim notice mail",
    description:
      "Little Havana duplex: certified mail habits for Florida deposit claim notice. Not legal advice.",
    series: "miami-metro-oct-2026",
    category: "city",
    intent: "city",
    states: ["FL"],
    statutes: ["Fla. Stat. § 83.49"],
    body: `
      <p class="hero-eyebrow">Florida · Little Havana</p>
      <h1>Little Havana duplex: mailing the Florida deposit claim notice</h1>
      <p>Send claim notice to the last known address if the tenant left the country. Log certificate of mailing next to the 15-day decision.</p>
      <ul>
        <li><a href="/blog/illinois-deposit-return-by-mail">Mail proof habits</a> (transferable discipline).</li>
        <li><a href="/blog/florida-83-49-two-step-miami-condo-deposit">§ 83.49 two-step guide</a>.</li>
        <li>Plan the 30-day balance mailing before repainting.</li>
      </ul>
      ${hubFooterHtml("FL", "Florida")}
      <p class="disclaimer">Not legal advice.</p>
      <p><a class="btn btn-primary" href="/app?state=FL">Start Florida packet</a></p>`,
  },
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!manifest.categories.metro) {
  manifest.categories.metro = {
    label: "Metro deep dives",
    audience: "Chicago, DC, and Miami neighborhood operator guides",
  };
}

const slugs = new Set(manifest.posts.map((p) => p.slug));
let added = 0;

for (const post of POSTS) {
  writeFileSync(
    join(blogDir, `${post.slug}.html`),
    articleShell({
      title: post.title,
      description: post.description,
      slug: post.slug,
      published: PUBLISHED,
      modified: PUBLISHED,
      bodyHtml: post.body,
    })
  );
  const row = {
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    intent: post.intent,
    series: post.series,
    states: post.states,
    published: PUBLISHED,
    updated: PUBLISHED,
    statutes: post.statutes,
  };
  if (post.cityPreset) row.cityPreset = post.cityPreset;
  const idx = manifest.posts.findIndex((p) => p.slug === post.slug);
  if (idx >= 0) {
    manifest.posts[idx] = { ...manifest.posts[idx], ...row };
    console.log("updated manifest", post.slug);
  } else {
    manifest.posts.push(row);
    slugs.add(post.slug);
    added++;
    console.log("added", post.slug);
  }
}

if (!manifest.primaryPainByState.FL) {
  manifest.primaryPainByState.FL = "florida-missed-15-day-claim-notice-deposit";
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("metro hyperfocus · new rows", added);
