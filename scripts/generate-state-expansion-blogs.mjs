#!/usr/bin/env node
/**
 * State expansion blogs · pain + deadline + itemization + checklist per new wizard state.
 * Run: node scripts/generate-state-expansion-blogs.mjs && node scripts/build-blog-seo.mjs && node scripts/sync-social-meta.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATE_PACKS, SUPPORTED_STATES } from "../web/lib/deposit-rules.mjs";
import { articleShell } from "./lib/blog-article-shell.mjs";
import {
  painBody,
  itemizationBody,
  checklistBody,
  deadlineBody,
} from "./lib/blog-post-helpers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const manifestPath = join(web, "data", "blog-manifest.json");
const PUBLISHED = "2026-09-22";
const LEGACY = new Set(["IL", "IN", "OH", "MI", "IA", "MO"]);

/** @type {Record<string, { pain: { slug: string, title: string, description: string, headline: string, problem: string, bullets: string[], fix: string }, localNote?: string }>} */
const STATE_PAIN = {
  DC: {
    pain: {
      slug: "dc-rhca-deposit-clock-rowhouse-investor",
      title: "DC RHCA deposit clock on rowhouses and ADUs",
      description:
        "Small landlords confuse DC RHCA timing with Maryland habits. 45-day return discipline. Not legal advice.",
      headline: "You treated a DC rowhouse like a Maryland duplex and missed the RHCA clock",
      problem:
        "Belt investors stack DC, MD, and VA units but run one spreadsheet column for all three. RHCA-covered housing uses its own return window and documentation habits.",
      bullets: [
        "Lease ended on paper while keys or access lagged.",
        "Withhold lines copied from a Maryland template without DC packet dates.",
        "No mailed itemization proof in the operator log.",
      ],
      fix:
        "Run a DC packet in Deposit Desk with surrender dated the day the unit was vacant and keys returned. Export before the 45-day line on screen.",
    },
    localNote:
      '<p class="field-hint">Confirm RHCA coverage and program rules for your building with counsel.</p>',
  },
  GA: {
    pain: {
      slug: "georgia-cleaning-fee-lump-sum-deposit",
      title: "Georgia cleaning fee lump sums vs deposit itemization",
      description:
        "One-line cleaning withholds fail when move-in proof is thin. O.C.G.A. 44-7-34. Not legal advice.",
      headline: "The Georgia turnover where a single cleaning line ate the whole deposit",
      problem:
        "Bootstrap landlords price turns like a vendor invoice, not a deposit ledger. Tenants push back when the withhold is one lump sum and move-in photos live on a camera roll.",
      bullets: [
        "Lease ended but surrender date was never logged.",
        "One month clock started late because keys were ambiguous.",
        "No room-level move-in notes to support the cleaning withhold.",
      ],
      fix:
        "Itemize each withhold in step 4 and tie move-in condition from step 2. Deposit Desk shows the return-by date from surrender.",
    },
  },
  LA: {
    pain: {
      slug: "louisiana-withhold-without-itemized-accounting",
      title: "Louisiana withhold without itemized accounting",
      description:
        "Partial returns without a written accounting trigger disputes. La. R.S. 9:3251. Not legal advice.",
      headline: "You mailed the balance but skipped the accounting lines Louisiana expects",
      problem:
        "Mom-and-pop operators sometimes refund the remainder and skip the written breakdown when the withhold feels obvious. That is where tenant disputes start.",
      bullets: [
        "Carpet and paint merged into one number with no description.",
        "Surrender date guessed from lease end.",
        "No PDF packet archived for your bank or counsel.",
      ],
      fix:
        "Export the Deposit Desk packet with itemized lines even when the withhold is small. Same 30-day window on screen from surrender.",
    },
  },
  MD: {
    pain: {
      slug: "maryland-45-day-belt-investor-missed-clock",
      title: "Maryland 45-day clock for belt investors",
      description:
        "DC and Virginia neighbors confuse Maryland return timing. Md. Real Prop. § 8-203. Not legal advice.",
      headline: "Your Maryland unit sat in the shadow of a 30-day habit from another state",
      problem:
        "Investors who own MD with IL or VA often default to the wrong day count. Maryland uses a 45-day return and itemization frame in the wizard.",
      bullets: [
        "Spreadsheet used 30 because another property in the portfolio uses 30.",
        "Escrow interest questions delayed the mail.",
        "Tenant forwarding address arrived after you already shipped numbers.",
      ],
      fix:
        "Pick Maryland in step 1 so the packet shows 45 days from surrender. One export, one clock.",
    },
  },
  MS: {
    pain: {
      slug: "mississippi-possession-still-occupied-deposit",
      title: "Mississippi possession disputes and the deposit clock",
      description:
        "Stuff left in the unit delays surrender math. Miss. Code § 89-8-21. Not legal advice.",
      headline: "The move-out where the unit was not quite vacant and the clock never started clean",
      problem:
        "Mississippi ties return timing to termination and delivery of possession. Operators start the timer on lease end while furniture remains.",
      bullets: [
        "Keys on the counter but tenant gear still in the bedroom.",
        "No photos of vacant unit at surrender.",
        "45-day math started on the wrong date.",
      ],
      fix:
        "Log the date the unit was actually vacant and keys returned. Deposit Desk uses that surrender date for the 45-day default.",
    },
  },
  NC: {
    pain: {
      slug: "north-carolina-interim-30-final-60-deposit",
      title: "North Carolina interim 30-day vs final 60-day accounting",
      description:
        "Heavy turns need interim accounting at 30 days. N.C.G.S. § 42-52. Not legal advice.",
      headline: "You needed more than 30 days for repairs but never sent the interim accounting",
      problem:
        "North Carolina allows a final accounting later when damage work runs long, but operators still owe discipline at 30 days. Missing the interim letter is a common pain point.",
      bullets: [
        "Contractor quote pushed past day 25 with radio silence to the tenant.",
        "Move-in photos did not match the rooms you charged.",
        "Possession date and lease end disagreed.",
      ],
      fix:
        "Use Deposit Desk to document surrender, withhold lines, and export on day 25 if work is not done. Counsel guides interim vs final letters.",
    },
  },
  ND: {
    pain: {
      slug: "north-dakota-pet-deposit-vs-security-deposit",
      title: "North Dakota pet deposit vs security deposit confusion",
      description:
        "Separate ledgers and return timing. N.D.C.C. § 47-16-07.1. Not legal advice.",
      headline: "You mixed pet deposit lines into the security deposit withhold",
      problem:
        "Small portfolios treat every dollar as one bucket. North Dakota operators need clean separation and the same surrender discipline for the main deposit.",
      bullets: [
        "Pet damage charged against the wrong ledger.",
        "No move-in pet addendum notes in the packet.",
        "30-day clock started before keys were back.",
      ],
      fix:
        "Run the main deposit packet in Deposit Desk and keep pet fees documented separately in operator logs.",
    },
  },
  NH: {
    pain: {
      slug: "new-hampshire-deposit-interest-itemization",
      title: "New Hampshire deposit interest and itemization",
      description:
        "Returning principal without interest math invites disputes. RSA 540-A:7. Not legal advice.",
      headline: "You itemized deductions but forgot interest on the deposit balance",
      problem:
        "New Hampshire operators focus on withhold lines and miss that tenants expect interest-aware returns with the itemization.",
      bullets: [
        "Spreadsheet return amount ignored accrued interest.",
        "Single cleaning line without move-in comparison.",
        "Surrender logged as lease end.",
      ],
      fix:
        "Document withhold lines in Deposit Desk and reconcile interest with your bank or counsel before mailing.",
    },
  },
  NJ: {
    pain: {
      slug: "new-jersey-disclosure-clock-vs-return-clock",
      title: "New Jersey move-in disclosure vs return clock confusion",
      description:
        "Two different 30-day habits in one statute chapter. N.J.S.A. 46:8-21.1. Not legal advice.",
      headline: "You satisfied move-in paperwork but still missed the return clock at move-out",
      problem:
        "New Jersey has move-in disclosure habits and a separate return-and-itemization window. Operators confuse which date started which obligation.",
      bullets: [
        "Move-in form filed but surrender never entered.",
        "Withhold list sent without balance math.",
        "Interest on deposit handled outside the packet.",
      ],
      fix:
        "At move-out, ignore move-in clocks and run Deposit Desk from surrender for the return deadline on screen.",
    },
  },
  NV: {
    pain: {
      slug: "nevada-return-and-itemization-same-mailing",
      title: "Nevada return and itemization in the same mailing",
      description:
        "NRS 118A.242 expects accounting with the balance. Not legal advice.",
      headline: "You sent the check first and the itemization letter a week later",
      problem:
        "Nevada discipline favors one coordinated mailing with the written accounting and any balance due tenant.",
      bullets: [
        "Refund processed before withhold lines were finalized.",
        "No copy of the letter in operator logs.",
        "30-day window treated as check-clear date only.",
      ],
      fix:
        "Finalize step 4 lines, export the packet, then mail check and itemization together with proof logged.",
    },
  },
  UT: {
    pain: {
      slug: "utah-missed-deposit-deadline-penalty-track",
      title: "Utah missed deposit deadline and penalty notices",
      description:
        "Tenants can trigger a short penalty track after a missed deadline. Utah Code § 57-17-3. Not legal advice.",
      headline: "You missed the 30-day line and got the tenant penalty notice",
      problem:
        "Utah operators who treat deposit return as whenever the turn finishes learn about the accelerated penalty path after the fact.",
      bullets: [
        "Turnover vendor delay pushed mail past day 30.",
        "Surrender date never recorded when keys were picked up.",
        "No itemized lines before the check went out.",
      ],
      fix:
        "Log surrender the day keys return. Deposit Desk shows the 30-day return-by date before you pay for print export.",
    },
  },
  VA: {
    pain: {
      slug: "virginia-45-day-itemization-mail-proof",
      title: "Virginia 45-day itemization and mail proof",
      description:
        "Late or thin itemization under Va. Code § 55.1-1226. Not legal advice.",
      headline: "Your Virginia withhold letter went out on day 44 with no tracking",
      problem:
        "45-day states punish procrastination. Belt investors mail from out of state and skip proof or line detail.",
      bullets: [
        "Inspection notes never made it into the packet.",
        "Spreadsheet withholds without descriptions.",
        "Mail sent without tracking in operator logs.",
      ],
      fix:
        "Build the packet early, export PDF, mail with tracking, log in Deposit Desk and operator logs.",
    },
  },
  WA: {
    pain: {
      slug: "washington-deposit-invoices-substantiation",
      title: "Washington deposit withhold substantiation",
      description:
        "Withholding requires detailed statements and backup. RCW 59.18.280. Not legal advice.",
      headline: "You withheld without the invoices Washington expects in the file",
      problem:
        "After recent landlord-tenant reforms, Washington operators feel the pain of substantiating each line, not just naming a fee.",
      bullets: [
        "Cleaning charged without vendor invoice or photos.",
        "21-day habit from old blog posts but 30-day statutory default in wizard.",
        "Surrender conflated with lease break date.",
      ],
      fix:
        "Attach invoice references in step 4 notes and export the full packet. Wizard uses 30-day default from surrender under current RCW.",
    },
  },
};

/** Dedicated pain posts for legacy Midwest wizard states (IL already has a cluster). */
const LEGACY_PAIN = {
  IN: {
    slug: "indiana-45-day-clock-forwarding-address-confusion",
    title: "Indiana 45-day clock vs lease end and forwarding address",
    description:
      "Operators start the deposit timer on lease end instead of surrender. IC 32-31-3-12. Not legal advice.",
    headline: "You mailed the withhold on day 40 but never logged when keys came back",
    problem:
      "Indiana’s 45-day window is long enough to feel safe until a dispute exposes a wrong start date or a thin itemization.",
    bullets: [
      "Lease end on the calendar treated as surrender.",
      "Forwarding address tracked in email but not on the deposit ledger.",
      "Single “repairs” line without room-level detail.",
    ],
    fix:
      "Record surrender the day possession returns. Deposit Desk defaults 45 days from that date and forces line items before export.",
  },
  OH: {
    slug: "ohio-cleveland-columbus-turnover-mail-delay",
    title: "Ohio 30-day deposit mail after slow turnover vendors",
    description:
      "Vendor backlog pushes itemized mail past day 30. ORC 5321.16. Not legal advice.",
    headline: "Turnover finished late and the itemized statement went out on day 31",
    problem:
      "Ohio operators in Cleveland and Columbus often conflate inspection completion with surrender and mail dates.",
    bullets: [
      "Surrender never entered when keys were picked up.",
      "Cleaning invoice arrived after the withhold letter was drafted.",
      "No PDF packet saved when the tenant disputes.",
    ],
    fix:
      "Log surrender at key return, build withhold lines early, export PDF before certified or tracked mail.",
  },
  MI: {
    slug: "michigan-detroit-normal-wear-deposit-fight",
    title: "Michigan deposit fight when normal wear is charged",
    description:
      "Detroit and Grand Rapids turns blur wear vs damage on the withhold sheet. MCL 554.610. Not legal advice.",
    headline: "You withheld for “fresh paint” without move-in photos",
    problem:
      "Michigan disputes often hinge on move-in proof and whether each withhold line describes actual damage.",
    bullets: [
      "No move-in walkthrough photos in the file.",
      "Paint and carpet lumped into one cleaning fee.",
      "30-day math started from lease end, not key return.",
    ],
    fix:
      "Pair move-in photos with move-out notes in step 4 and export the full packet before mailing.",
  },
  IA: {
    slug: "iowa-rural-turnover-surrender-date-gap",
    title: "Iowa rural turnover and the missing surrender date",
    description:
      "Small-town operators lose the deposit clock when keys hand off informally. Iowa Code 562A.12. Not legal advice.",
    headline: "Tenant left keys on the counter and you never wrote down the date",
    problem:
      "Iowa 30-day math is simple on paper but fails when surrender is verbal or delayed after lease end.",
    bullets: [
      "Keys left without a signed move-out log.",
      "Spreadsheet still shows lease end as the deadline anchor.",
      "Itemization copied from last year’s template with wrong amounts.",
    ],
    fix:
      "Enter surrender in Deposit Desk the day possession returns; the wizard shows the 30-day return-by date immediately.",
  },
  MO: {
    slug: "missouri-stl-kc-deposit-clock-two-market",
    title: "Missouri STL and KC deposit clocks on the same spreadsheet",
    description:
      "Two-market operators mix surrender dates across units. RSMo 535.300. Not legal advice.",
    headline: "Your Kansas City unit and St. Louis unit share one broken deadline cell",
    problem:
      "Missouri mom-and-pop portfolios track turns in one sheet without per-unit surrender or itemized exports.",
    bullets: [
      "One Excel tab for multiple cities and managers.",
      "Withhold descriptions copied without unit-specific photos.",
      "Mail date logged but not tied to the packet PDF.",
    ],
    fix:
      "One packet per turn in Deposit Desk with state MO selected; export and mail with tracking per unit.",
  },
};

function slugPrefix(code) {
  const map = {
    DC: "dc",
    GA: "georgia",
    LA: "louisiana",
    MD: "maryland",
    MS: "mississippi",
    NC: "north-carolina",
    ND: "north-dakota",
    NH: "new-hampshire",
    NJ: "new-jersey",
    NV: "nevada",
    UT: "utah",
    VA: "virginia",
    WA: "washington",
  };
  return map[code] || code.toLowerCase();
}

function postsForState(code) {
  const pack = STATE_PACKS[code];
  const cfg = STATE_PAIN[code];
  if (!pack || !cfg) return [];
  const pre = slugPrefix(code);
  const days = String(pack.returnDays);
  const name = pack.label;
  const cite = pack.cite;
  const note = cfg.localNote || "";

  return [
    {
      slug: cfg.pain.slug,
      title: cfg.pain.title,
      description: cfg.pain.description,
      category: "pain",
      intent: "pain",
      states: [code],
      statutes: [cite],
      body: () =>
        painBody({
          stateName: name,
          app: code,
          days,
          cite,
          headline: cfg.pain.headline,
          problem: cfg.pain.problem,
          bullets: cfg.pain.bullets,
          fix: cfg.pain.fix,
        }),
    },
    {
      slug: `${pre}-${days}-day-deposit-deadline`,
      title: `${name} ${days}-day deposit return window`,
      description: `${days}-day return default from surrender · ${cite}. Not legal advice.`,
      category: "law",
      states: [code],
      statutes: [cite],
      body: () => deadlineBody({ stateName: name, cite, days, app: code, localNote: note }),
    },
    {
      slug: `${pre}-deposit-itemization`,
      title: `${name} deposit itemization`,
      description: `Written withhold lines · ${cite}. Not legal advice.`,
      category: "law",
      states: [code],
      statutes: [cite],
      body: () => itemizationBody({ stateName: name, cite, days, app: code, localNote: note }),
    },
    {
      slug: `${pre}-security-deposit-checklist`,
      title: `${name} security deposit checklist`,
      description: `Move-in through move-out · ${cite}. Not legal advice.`,
      category: "landlord",
      states: [code],
      statutes: [cite],
      body: () => checklistBody({ stateName: name, cite, days, app: code, localNote: note }),
    },
  ];
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.stateOrder = [...SUPPORTED_STATES];
manifest.stateLabels = {};
for (const code of SUPPORTED_STATES) {
  manifest.stateLabels[code] = STATE_PACKS[code].label;
}

const slugs = new Set(manifest.posts.map((p) => p.slug));
let added = 0;

for (const code of SUPPORTED_STATES) {
  if (LEGACY.has(code)) continue;
  for (const post of postsForState(code)) {
    const html = articleShell({
      title: post.title,
      description: post.description,
      slug: post.slug,
      published: PUBLISHED,
      bodyHtml: post.body(),
    });
    writeFileSync(join(blogDir, `${post.slug}.html`), html);
    if (!slugs.has(post.slug)) {
      manifest.posts.push({
        slug: post.slug,
        title: post.title,
        description: post.description,
        category: post.category,
        intent: post.intent,
        states: post.states,
        published: PUBLISHED,
        updated: PUBLISHED,
        statutes: post.statutes,
      });
      slugs.add(post.slug);
      added++;
      console.log("manifest+", post.slug);
    } else {
      console.log("html refresh", post.slug);
    }
  }
}

for (const code of ["IN", "OH", "MI", "IA", "MO"]) {
  const pack = STATE_PACKS[code];
  const cfg = LEGACY_PAIN[code];
  const post = {
    slug: cfg.slug,
    title: cfg.title,
    description: cfg.description,
    category: "pain",
    intent: "pain",
    states: [code],
    statutes: [pack.cite],
    body: () =>
      painBody({
        stateName: pack.label,
        app: code,
        days: String(pack.returnDays),
        cite: pack.cite,
        headline: cfg.headline,
        problem: cfg.problem,
        bullets: cfg.bullets,
        fix: cfg.fix,
      }),
  };
  const html = articleShell({
    title: post.title,
    description: post.description,
    slug: post.slug,
    published: PUBLISHED,
    bodyHtml: post.body(),
  });
  writeFileSync(join(blogDir, `${post.slug}.html`), html);
  if (!slugs.has(post.slug)) {
    manifest.posts.push({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      intent: post.intent,
      states: post.states,
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: post.statutes,
    });
    slugs.add(post.slug);
    added++;
    console.log("manifest+ legacy pain", post.slug);
  } else {
    console.log("html refresh legacy pain", post.slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest total", manifest.posts.length, "new rows", added);
