#!/usr/bin/env node
/**
 * Route-intent SEO series · 5 guides per public marketing route.
 * Run: node scripts/generate-route-series-oct-2026.mjs && npm run apply:blog-goal-copy && npm run build-blog && node scripts/sync-social-meta.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { articleShell } from "./lib/blog-article-shell.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const manifestPath = join(root, "web", "data", "blog-manifest.json");
const PUBLISHED = "2026-10-15";

function section(title, paras) {
  const ps = paras.map((p) => `<p>${p}</p>`).join("\n      ");
  return `<h2>${title}</h2>\n      ${ps}`;
}

function post({ slug, title, description, routeSeries, bodySections, states = [] }) {
  const lead = `<p class="pain-solution-lead"><span class="ps-problem">${bodySections.problem}</span> <span class="ps-fix">${bodySections.fix}</span></p>`;
  const h1 = `<h1>${title}</h1>`;
  const sections = bodySections.sections.map((s) => section(s.h, s.p)).join("\n      ");
  const body = `${lead}\n      ${h1}\n      ${sections}`;
  return { slug, title, description, routeSeries, states, body };
}

/** @type {Array<ReturnType<typeof post>>} */
const POSTS = [
  // —— home (/) ——
  post({
    slug: "small-landlord-deposit-deadlines-beat-fees",
    title: "Small landlord deposit deadlines beat penalty fees",
    description:
      "Why mom-and-pop operators lose deposits to clocks, not cleaning costs. Documentation habits from Simple Property Tools. Not legal advice.",
    routeSeries: "home",
    bodySections: {
      problem: "One missed return window can cost more than a year of software.",
      fix: "Start with a dated surrender record and itemized withhold lines before you mail anything.",
      sections: [
        {
          h: "The fee is usually the calendar",
          p: [
            "Tenants remember the due date. Courts and mediators ask for <strong>when keys came back</strong> and <strong>what you withheld line by line</strong>.",
            "Full property management suites help with rent collection; they rarely hand you a <strong>print-ready deposit packet</strong> in one pass.",
          ],
        },
        {
          h: "What to do this weekend",
          p: [
            "Pick the surrender date you can defend. Open <a href=\"/app\">Deposit Desk</a> for your state clock.",
            "Pair move-in notes with move-out photos in <a href=\"/hub\">Condition hub</a> when you have them.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "why-spreadsheets-fail-deposit-returns",
    title: "Why spreadsheets fail on security deposit returns",
    description:
      "Cells do not send reminders or itemization packets. When to switch to Deposit Desk for turnover. Not legal advice.",
    routeSeries: "home",
    bodySections: {
      problem: "A single “cleaning $400” cell is fast to type and hard to defend.",
      fix: "Use one row per withhold and export a packet that matches your letter.",
      sections: [
        {
          h: "Spreadsheets hide structure",
          p: [
            "Statutes expect <strong>description + amount</strong> per deduction, not one lump sum.",
            "See <a href=\"/blog/deposit-desk-vs-spreadsheet\">Deposit Desk vs spreadsheet</a> for a side-by-side.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "deposit-documentation-1-to-40-units",
    title: "Deposit documentation for 1 to 40 units",
    description:
      "Same habits from a duplex to a small portfolio: packets, not platform lock-in. Simple Property Tools. Not legal advice.",
    routeSeries: "home",
    bodySections: {
      problem: "Portfolio size changes; deposit law does not get simpler.",
      fix: "Use door-count stacks on <a href=\"/launch-stack\">Stack</a> and keep Pro under 40 units.",
      sections: [
        {
          h: "Scale without a PM suite",
          p: [
            "Enterprise tools want monthly per-door fees forever. We price a <strong>per-turn unlock</strong> when you only need one packet.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "chicago-rlto-vs-statewide-illinois-deposits",
    title: "Chicago RLTO vs statewide Illinois deposit clocks",
    description:
      "45-day city clock vs 30-day state return after surrender. Toggle in Deposit Desk step 1. Not legal advice.",
    routeSeries: "home",
    states: ["IL"],
    bodySections: {
      problem: "Chicago operators miss the RLTO window while watching the state statute.",
      fix: "Mark Chicago on step 1 and build the packet before you draft the letter.",
      sections: [
        {
          h: "Two clocks, one turnover",
          p: [
            "765 ILCS 715/ and Chicago RLTO both care about <strong>surrender</strong> and <strong>itemization</strong>.",
            "Deposit Desk prints the math you chose on step 1.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "competitor-pm-software-deposit-gaps",
    title: "What PM software gets wrong about deposits",
    description:
      "Innago, Buildium, and others collect rent; deposit compliance is a side module. Our wedge. Not legal advice.",
    routeSeries: "home",
    bodySections: {
      problem: "Operators buy a suite, then still rebuild deposit letters in Word.",
      fix: "Use Deposit Desk for the statutory packet; keep your rent tool if you like it.",
      sections: [
        {
          h: "Deposit-native vs suite",
          p: [
            "Tools like LeaseRooster focus on deposit lifecycle; suites spread it across accounting.",
            "We do not replace accounting — we finish the <strong>return packet</strong> this weekend.",
          ],
        },
      ],
    },
  }),

  // —— deposit-desk (/app) ——
  post({
    slug: "deposit-desk-five-step-wizard-overview",
    title: "Deposit Desk five-step wizard overview",
    description: "State, property, move-in, itemization, export. How the /app flow maps to turnover. Not legal advice.",
    routeSeries: "deposit-desk",
    bodySections: {
      problem: "Operators stall when steps are scattered across email and camera roll.",
      fix: "Walk five screens once; print or unlock PDF when the packet is complete.",
      sections: [
        {
          h: "The five steps",
          p: [
            "<strong>1</strong> State + Chicago toggle · <strong>2</strong> Property · <strong>3</strong> Move-in · <strong>4</strong> Itemization · <strong>5</strong> Export.",
            "Open <a href=\"/app\">Deposit Desk</a> and save as you go in the browser.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "deposit-desk-move-in-checklist-export",
    title: "Deposit Desk move-in checklist and export",
    description: "Room tables and notes that survive move-out fights. Step 3 and print. Not legal advice.",
    routeSeries: "deposit-desk",
    bodySections: {
      problem: "Move-in proof missing means every withhold looks new.",
      fix: "Capture rooms at lease start; reuse packet id at move-out.",
      sections: [
        {
          h: "Same packet id",
          p: ["Turn unlocks tie print to one tenancy event. Pro covers up to 40 units on subscription."],
        },
      ],
    },
  }),
  post({
    slug: "deposit-desk-itemization-step-four",
    title: "Deposit Desk itemization step four",
    description: "Line items, totals, and withhold letter preview before you mail. Not legal advice.",
    routeSeries: "deposit-desk",
    bodySections: {
      problem: "Lump-sum withholds trigger disputes.",
      fix: "Split cleaning, damage, and unpaid charges on separate lines in step 4.",
      sections: [{ h: "Math matches the letter", p: ["Export on step 5 should match what you send the tenant."] }],
    },
  }),
  post({
    slug: "deposit-desk-multistate-32-plus-dc",
    title: "Deposit Desk in 32 states plus DC",
    description: "Wizard state selector and guides per jurisdiction. Not legal advice.",
    routeSeries: "deposit-desk",
    states: ["IL"],
    bodySections: {
      problem: "Operators with units in two states guess which clock applies.",
      fix: "Pick state on step 1; read the matching guide in <a href=\"/blog\">Guides</a>.",
      sections: [{ h: "Chicago is not automatic", p: ["Toggle RLTO when the unit is in Chicago."] }],
    },
  }),
  post({
    slug: "deposit-desk-vs-leaserooster-deposits",
    title: "Deposit Desk vs LeaseRooster on deposits",
    description: "Both focus on deposit lifecycle; compare IL depth, pricing, and packet export. Not legal advice.",
    routeSeries: "deposit-desk",
    bodySections: {
      problem: "Deposit-native tools look similar in marketing blurbs.",
      fix: "Choose on state depth, per-turn price, and whether you need a full lease OS.",
      sections: [
        {
          h: "Our fit",
          p: [
            "LeaseRooster links deductions to move-out media and reminders — strong pattern.",
            "Deposit Desk emphasizes <strong>765 ILCS / RLTO</strong>, per-turn unlock, and print-ready export without suite lock-in.",
          ],
        },
      ],
    },
  }),

  // —— pricing (/pricing) ——
  post({
    slug: "pricing-per-turn-29-49-vs-pro-subscription",
    title: "Per-turn $29 and $49 vs Pro subscription",
    description: "When to unlock one packet vs Pro monthly or annual for up to 40 units. Not legal advice.",
    routeSeries: "pricing",
    bodySections: {
      problem: "Seasonal owners overpay for year-round PM software.",
      fix: "Pay per turn when you have one move-out; choose Pro when every door turns regularly.",
      sections: [
        {
          h: "Turn unlock",
          p: [
            "<strong>$29</strong> move-out print · <strong>$49</strong> full tenancy on one packet id.",
            "See <a href=\"/pricing\">pricing</a> for current SKUs.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "pricing-deposit-mistake-costs-more-than-pro",
    title: "One deposit mistake costs more than Pro",
    description: "ROI framing: $22/mo Pro vs a single penalty or dispute hour. Not legal advice.",
    routeSeries: "pricing",
    bodySections: {
      problem: "Operators compare software to rent, not to dispute cost.",
      fix: "Price against one bad turnover, not against free spreadsheets.",
      sections: [{ h: "Pro cap", p: ["Up to 40 units on Deposit Desk Pro — see pricing finder."] }],
    },
  }),
  post({
    slug: "pricing-condition-hub-keeper-portfolio",
    title: "Condition hub Keeper and Portfolio pricing",
    description: "$29/mo Keeper for 10 units · $79/mo Portfolio for 40 units and three seats. Not legal advice.",
    routeSeries: "pricing",
    bodySections: {
      problem: "Walkthrough proof without deposit export leaves money on the table.",
      fix: "Keeper bundles hub walkthroughs with Deposit Desk print for those doors.",
      sections: [
        {
          h: "Plans",
          p: [
            "Subscribe on <a href=\"/pricing\">pricing</a> · open <a href=\"/hub\">Condition hub</a> for walkthroughs.",
          ],
        },
      ],
    },
  }),
  post({
    slug: "pricing-free-draft-paid-print",
    title: "Free draft and paid print unlock",
    description: "Build the packet free; pay when you need PDF or print for this turn. Not legal advice.",
    routeSeries: "pricing",
    bodySections: {
      problem: "Paying before the packet is done feels risky.",
      fix: "Draft in Deposit Desk; unlock print when you are ready to mail.",
      sections: [{ h: "No surprise suite bill", p: ["Per-turn billing matches one turnover event."] }],
    },
  }),
  post({
    slug: "pricing-vs-free-landlord-apps",
    title: "Deposit Desk pricing vs free landlord apps",
    description: "Innago and Avail are free for rent; deposit packets are our paid wedge. Not legal advice.",
    routeSeries: "pricing",
    bodySections: {
      problem: "Free apps train you to expect $0 for compliance work.",
      fix: "Pay for the export that matches your statute clock, not for rent ACH.",
      sections: [{ h: "Complement, don't replace", p: ["Keep free rent tools; add Deposit Desk for move-out."] }],
    },
  }),

  // —— condition-hub (/hub) ——
  post({
    slug: "condition-hub-move-in-walkthrough-guide",
    title: "Condition hub move-in walkthrough guide",
    description: "Room-by-room dated record at lease start. Customer name Condition hub. Not legal advice.",
    routeSeries: "condition-hub",
    bodySections: {
      problem: "Photos in a group chat are not a record.",
      fix: "Walk the unit once in <a href=\"/hub\">Condition hub</a> and lock a PDF when done.",
      sections: [{ h: "Before keys change hands", p: ["Match rooms you will use again at move-out."] }],
    },
  }),
  post({
    slug: "condition-hub-move-out-proof-deposit",
    title: "Condition hub move-out proof for deposits",
    description: "Link walkthrough evidence to withhold lines in Deposit Desk. Not legal advice.",
    routeSeries: "condition-hub",
    bodySections: {
      problem: "Itemization without photos looks like opinion.",
      fix: "Capture the same rooms at move-out; cite them in step 4 notes.",
      sections: [{ h: "One portfolio story", p: ["Hub for proof · Deposit Desk for statutory packet."] }],
    },
  }),
  post({
    slug: "condition-hub-wear-vs-damage-photos",
    title: "Wear vs damage in Condition hub photos",
    description: "Document condition without over-claiming withholds. Operator education. Not legal advice.",
    routeSeries: "condition-hub",
    bodySections: {
      problem: "Every scuff becomes a deduction in the heat of turnover.",
      fix: "Label what is wear in the walkthrough; withhold only what you can describe.",
      sections: [{ h: "Guides", p: ["Pair with state wear vs damage articles in Guides."] }],
    },
  }),
  post({
    slug: "condition-hub-vs-inspection-apps",
    title: "Condition hub vs generic inspection apps",
    description: "Turnover-focused walkthroughs plus Deposit Desk export path. Not legal advice.",
    routeSeries: "condition-hub",
    bodySections: {
      problem: "Generic inspection apps do not know your deposit clock.",
      fix: "Use Condition hub with Simple Property Tools deposit lanes.",
      sections: [{ h: "Browser today", p: ["Works in this browser; account sync when sign-in ships."] }],
    },
  }),
  post({
    slug: "condition-hub-keeper-ten-units",
    title: "Condition hub Keeper for ten units",
    description: "Keeper plan: walkthroughs plus Deposit Desk print for up to ten doors. Not legal advice.",
    routeSeries: "condition-hub",
    bodySections: {
      problem: "Small portfolios outgrow phone albums fast.",
      fix: "Keeper on <a href=\"/pricing\">pricing</a> · cap at ten units until you need Portfolio.",
      sections: [{ h: "Upgrade path", p: ["Portfolio adds seats and forty units."] }],
    },
  }),

  // —— modules (/modules) ——
  post({
    slug: "modules-suite-without-pm-bloat",
    title: "Simple Property modules without PM bloat",
    description: "Deposit Desk plus Condition hub lanes — not a full property management suite. Not legal advice.",
    routeSeries: "modules",
    bodySections: {
      problem: "Operators fear another all-in-one they will not finish setting up.",
      fix: "Start with <a href=\"/modules\">modules</a> list: one job per lane.",
      sections: [{ h: "Available now", p: ["Move-in/out walkthroughs and Deposit Desk packets."] }],
    },
  }),
  post({
    slug: "modules-deposit-desk-and-hub-together",
    title: "Deposit Desk and Condition hub together",
    description: "Proof at the door plus statutory export. /modules explains the pair. Not legal advice.",
    routeSeries: "modules",
    bodySections: {
      problem: "Split tools mean split stories at dispute time.",
      fix: "Same turnover: hub walkthrough, then Deposit Desk packet id.",
      sections: [{ h: "CTA", p: ["<a href=\"/hub\">Condition hub</a> · <a href=\"/app\">Deposit Desk</a>"] }],
    },
  }),
  post({
    slug: "modules-operator-logs-maintenance-trail",
    title: "Operator logs and maintenance trail",
    description: "Maintenance notes that support deposit narratives. Links to /logs. Not legal advice.",
    routeSeries: "modules",
    bodySections: {
      problem: "Repairs during tenancy get forgotten at move-out.",
      fix: "Log tickets in <a href=\"/logs\">Operator logs</a>; reference dates in itemization notes.",
      sections: [{ h: "Browser export", p: ["CSV and print when you need a paper trail."] }],
    },
  }),
  post({
    slug: "modules-google-calendar-sheets-handoff",
    title: "Google Calendar and Sheets handoff",
    description: "Export deadlines and ledgers without abandoning Google tools. Not legal advice.",
    routeSeries: "modules",
    bodySections: {
      problem: "Operators live in Calendar and Sheets already.",
      fix: "Deposit Desk exports and calendar hooks — see Guides on Google handoff.",
      sections: [{ h: "Stack", p: ["Door-count setup on <a href=\"/launch-stack\">Stack</a>."] }],
    },
  }),
  post({
    slug: "modules-what-we-do-not-ship",
    title: "What Simple Property Tools does not ship",
    description: "No screening, accounting, or e-sign replacement. Scope clarity for buyers. Not legal advice.",
    routeSeries: "modules",
    bodySections: {
      problem: "Wrong-fit signups churn when expectations are PM-suite sized.",
      fix: "Read <a href=\"/modules\">modules</a> before you expect rent collection.",
      sections: [{ h: "Our wedge", p: ["Deposits · condition proof · operator logs — documentation only."] }],
    },
  }),

  // —— operator-logs (/logs) ——
  post({
    slug: "operator-logs-maintenance-deposit-disputes",
    title: "Operator logs for maintenance during deposit disputes",
    description: "Show prior repairs and dates when tenants challenge withholds. /logs. Not legal advice.",
    routeSeries: "operator-logs",
    bodySections: {
      problem: "You fixed the leak in March but only remember it in October.",
      fix: "Log maintenance when it happens; cite ticket dates in Deposit Desk notes.",
      sections: [{ h: "Free browser logs", p: ["<a href=\"/logs\">Operator logs</a> — export when needed."] }],
    },
  }),
  post({
    slug: "operator-logs-inspection-complaints",
    title: "Inspection and complaint logs for small landlords",
    description: "Tickets and inspections in one browser trail. Not legal advice.",
    routeSeries: "operator-logs",
    bodySections: {
      problem: "Complaints live in texts and disappear.",
      fix: "One tab per property in Operator logs.",
      sections: [{ h: "Not a CRM", p: ["Lightweight trail for mom-and-pop operators."] }],
    },
  }),
  post({
    slug: "operator-logs-csv-print-audit",
    title: "CSV and print audit trail from Operator logs",
    description: "Export maintenance history for counsel or insurance. Not legal advice.",
    routeSeries: "operator-logs",
    bodySections: {
      problem: "Counsel asks for a timeline; you have screenshots.",
      fix: "Export CSV from logs and attach to your packet folder.",
      sections: [{ h: "Pair with Deposit Desk", p: ["Packet export on <a href=\"/app\">/app</a>."] }],
    },
  }),
  post({
    slug: "operator-logs-vs-property-management-tickets",
    title: "Operator logs vs PM maintenance tickets",
    description: "No suite required for a dated repair list. Compare to Buildium-style tickets. Not legal advice.",
    routeSeries: "operator-logs",
    bodySections: {
      problem: "PM tickets require the whole platform.",
      fix: "Use Operator logs when you only need a dated list this year.",
      sections: [{ h: "Scale later", p: ["Portfolio operators may still want a PM suite for rent — logs complement."] }],
    },
  }),
  post({
    slug: "operator-logs-turnover-weekend-workflow",
    title: "Turnover weekend workflow with Operator logs",
    description: "Log final repairs, then finish Deposit Desk step 4. Not legal advice.",
    routeSeries: "operator-logs",
    bodySections: {
      problem: "Turnover weekend blends cleaning, keys, and math.",
      fix: "Log repairs first · walk hub · itemize · export packet.",
      sections: [{ h: "Order of operations", p: ["Logs → hub → Deposit Desk → mail."] }],
    },
  }),

  // —— launch-stack (/launch-stack) ——
  post({
    slug: "launch-stack-1-to-10-doors-deposits",
    title: "Launch stack for 1 to 10 doors · deposits first",
    description: "Door-count stack starting with Deposit Desk compliance. /launch-stack. Not legal advice.",
    routeSeries: "launch-stack",
    bodySections: {
      problem: "New landlords buy software before they understand surrender dates.",
      fix: "Follow <a href=\"/launch-stack\">Stack</a> for 1–10: packet habit first.",
      sections: [{ h: "One building", p: ["Per-turn pricing fits low turnover."] }],
    },
  }),
  post({
    slug: "launch-stack-10-to-20-doors-ledger",
    title: "Launch stack for 10 to 20 doors · ledger discipline",
    description: "Add Sheets and deadline tracking without enterprise PM. Not legal advice.",
    routeSeries: "launch-stack",
    bodySections: {
      problem: "Ten doors means ten clocks, not ten spreadsheets without dates.",
      fix: "Stack layer two: master deadline sheet plus Deposit Desk per turn.",
      sections: [{ h: "Pro consideration", p: ["When most units turn yearly, Pro may beat per-turn."] }],
    },
  }),
  post({
    slug: "launch-stack-20-to-40-doors-automation",
    title: "Launch stack for 20 to 40 doors · light automation",
    description: "Reminders, logs, and Pro cap at forty units. Not legal advice.",
    routeSeries: "launch-stack",
    bodySections: {
      problem: "At twenty doors, missed mail hurts twice as often.",
      fix: "Email reminders plus Operator logs plus Pro subscription.",
      sections: [{ h: "Portfolio plan", p: ["Condition hub Portfolio when walkthroughs span staff."] }],
    },
  }),
  post({
    slug: "launch-stack-deposit-desk-turnover-handoff",
    title: "Deposit Desk turnover handoff on the stack",
    description: "JSON packet handoff and calendar links from launch-stack. Not legal advice.",
    routeSeries: "launch-stack",
    bodySections: {
      problem: "Operators lose packet state between tools.",
      fix: "Use stack handoff into <a href=\"/app\">Deposit Desk</a> for the same tenancy.",
      sections: [{ h: "Agents", p: ["See launch-stack for agent/discovery JSON."] }],
    },
  }),
  post({
    slug: "launch-stack-vs-all-in-one-landlord-software",
    title: "Launch stack vs all-in-one landlord software",
    description: "Why we stack Deposit Desk first instead of Innago or DoorLoop alone. Not legal advice.",
    routeSeries: "launch-stack",
    bodySections: {
      problem: "All-in-one tools optimize rent; deposits stay a side screen.",
      fix: "Stack compliance first; add rent tools when deposits are boring.",
      sections: [
        {
          h: "Competitive honesty",
          p: [
            "Avail and Innago excel at free rent collection.",
            "Simple Property Tools wins when the **return deadline** is this week.",
          ],
        },
      ],
    },
  }),
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!manifest.categories.route) {
  manifest.categories.route = {
    label: "Product routes",
    audience: "SEO clusters tied to /app /pricing /hub /modules /logs /launch-stack",
  };
}

const slugs = new Set(manifest.posts.map((p) => p.slug));
let added = 0;

for (const p of POSTS) {
  writeFileSync(
    join(blogDir, `${p.slug}.html`),
    articleShell({
      title: p.title,
      description: p.description,
      slug: p.slug,
      published: PUBLISHED,
      bodyHtml: p.body,
      states: p.states,
      stateLabels: manifest.stateLabels,
    })
  );
  if (!slugs.has(p.slug)) {
    manifest.posts.push({
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: "route",
      intent: "route",
      routeSeries: p.routeSeries,
      states: p.states,
      published: PUBLISHED,
      updated: PUBLISHED,
      statutes: [],
    });
    slugs.add(p.slug);
    added++;
    console.log("+", p.slug, "·", p.routeSeries);
  } else {
    console.log("exists", p.slug);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nRoute series: ${POSTS.length} defined · ${added} added to manifest · total posts ${manifest.posts.length}`);
