# Phase 4 roadmap · dominate the deposit lane

**Umbrella:** Simple Property Tools · **Product:** Deposit Desk  
**Promise:** Itemize it. Date it. Never pay the fees.  
**Lane:** Surrender → statutory clock → itemized withholds → proof → mail-ready export. **Not** rent collection, maintenance portals, or PM-suite replacement.

**Economics (why we win):** One missed deadline, weak itemization, or counsel hour organizing photos beats **$29–49/turn** or a year of Pro. We sell **tools that are more expensive not to use** than to unlock.

**Repo:** `SP-Q26/Simple-Property` · prod `main` → `simple-property.com` · see `docs/LANE_ISOLATION.md`.

---

## North star (this phase)

1. **Sit in the lane** — turnover + deposit compliance + portable packet truth; hand off cleanly to Innago, Avail, bank, counsel.
2. **Tighten AI onboarding** — any model or agent lands on correct URLs, bus, gospel, live wizard snapshot, and feedback path without guessing.
3. **Close with SEO** — only after product + agent surfaces are stable; one comprehensive sweep, not death-by-a-thousand meta tweaks.

---

## Order of operations (do not reorder)

Use this sequence for every **release train**. Skip a step only when the gate below is already green on `main`.

### 0 · Lane & git hygiene (always first)

| Step | Action | Gate |
|------|--------|------|
| 0.1 | Work only in `simple-property` workspace | `docs/LANE_ISOLATION.md` |
| 0.2 | Identity + remote | `npm run audit:git` |
| 0.3 | No SPQ / WeWeb cross-contamination | No commits in `SP-Q26/SPQ` for Deposit Desk |

### 1 · Product truth (wizard + packet + paywall)

| Step | Action | Gate |
|------|--------|------|
| 1.1 | Wizard flows, preview lock, export | `audit-wizard-speed.mjs` · `audit-wizard-forms.mjs` · `audit-packet-reports.mjs` |
| 1.2 | Pricing / Stripe / entitlement | `audit-pricing.mjs` · `smoke:checkout` · `verify-stripe-catalog.mjs` (local key) |
| 1.3 | Reminders + Resend | `audit-reminders-system.mjs` · `audit:resend` · `smoke:reminders` |
| 1.4 | Full proud-ship | `npm run audit` |

**In-flight product (phase 4 backlog, lane-only):**

- [x] Packet schema **v2** + import validation UI (no silent field drop).
- [x] Step 5 **handoff sheet** print block (“from your PM: tenant, unit, deposit, surrender”).
- [x] Compare post: **Deposit Desk vs Innago/Avail at turnover** (factual, `WEAPONIZE_ACTION_PLAN.md`).
- [x] C4/C5 letter merge + certified-mail checklist (documentation templates only).
- [x] **Operator logs** packet CSV cross-ref + `/logs?packet_id=` handoff from step 5.
- [x] Guides hub search/filter (`blog-hub-filter.js`).

### 2 · Stack handoff & positioning copy

| Step | Action | Gate |
|------|--------|------|
| 2.1 | `/launch-stack` + pricing counsel-hour line current | `audit-stack-handoff.mjs` |
| 2.2 | Customer voice / pain / not legal advice | `audit-customer-voice.mjs` · `audit-pain-copy.mjs` |
| 2.3 | `llms.txt` + bus hook matches 32 states + DC | `audit-mcp.mjs` · manual read `web/llms.txt` |

### 3 · AI onboarding (tighten before marketing SEO)

**Goal:** Crawlers, chat products, and Cursor-style agents get the same story and the same entrypoints.

| Surface | Path | Maintainer action |
|---------|------|-------------------|
| Human + model index | `web/llms.txt` | After positioning or pricing change |
| Structured bus | `web/spt-ai-bus.json` | `node scripts/sync-mcp-discovery.mjs` |
| Agent gospel | `web/.well-known/spt-gospel.json` | Same sync; valid JSON |
| Discovery manifest | `web/.well-known/ai-discovery.json` | Bump `updated` on release |
| Live wizard state | `/app` · `#spt-wizard-snapshot` · `window.__SPT_AGENT__` | `audit-agent-snapshot.mjs` |
| Step 5 clipboard | **Copy for AI assistant** in `app.js` | Smoke export step |
| Feedback agent | `/feedback` · `window.sptAgentFormFill` | `audit-agent-form-fill.mjs` · `smoke:feedback` |

**AI onboarding checklist (release gate):**

```bash
npm run audit          # includes audit-mcp, audit-agent-snapshot, audit-agent-form-fill
npm run sync:mcp       # after blog count or URL list changes
npm run smoke:feedback
# Spot-check: curl -s https://simple-property.com/llms.txt | head
# Spot-check: curl -s https://simple-property.com/spt-ai-bus.json | jq .blog_post_count
```

**Rules:**

- Bus + gospel **must** list `/app`, `/pricing`, `/blog`, `/feedback`, `/legal/deposit-statutes`, `/launch-stack`.
- Never claim PM-suite features; always **complement** rent stacks at turnover.
- Step 5 markdown export stays **client-side** (no paid inference on us) until Pro API lane ships (`docs/AI_SHARE_MONETIZATION.md`).

### 4 · Deploy & production smokes

| Step | Action | Gate |
|------|--------|------|
| 4.1 | Commit on `main` (noreply identity) | `audit:git` pre-push |
| 4.2 | Vercel prod deploy | `npm run smoke:prod` |
| 4.3 | Deep paths | `npm run smoke:extended` |
| 4.4 | Optional full send | `npm run full-send` (needs `STRIPE_SECRET_KEY` in `web/.env.local`) |

```bash
npm run smoke:full   # audit + prod + extended + states/blogs + magic-link + checkout
```

### 5 · Comprehensive SEO sweep (**last** — capstone of the train)

Run **once per release** after steps 1–4 are green. Do not SEO-patch before preview/paywall and agent surfaces are stable.

```bash
# Content + chrome (order matters)
npm run sync:blogs          # ends with sync-site-head · favicon + CSS v
npm run sync:seo-statutes   # when statute pages or slugs change
npm run build-court-snippets   # if court-record snippet copy changed

# SEO audits (all must pass)
npm run audit:seo-sweep
npm run audit:blog
npm run audit:discovery
npm run audit:social
node scripts/audit-em-dash.mjs
node scripts/audit-state-blog-coverage.mjs
node scripts/audit-statute-urls.mjs
node scripts/audit-home-faq.mjs
npm run smoke:states-blogs

# Full gate again
npm run audit
npm run smoke:prod
```

**SEO sweep scope (lane-only keywords):**

- Pain: missed deadline · dispute · itemization · surrender · spreadsheet mistakes · multi-state clocks.
- Compare: vs spreadsheet · vs inspection apps · vs Innago/Avail **at turnover** (not rent month).
- City/metro hubs · state checklists · operator sep posts · statute outbound links.
- Home: pathway deck · coverage color bar · court-record rotate · hero CTA geo.

**Explicitly out of scope for SEO:** generic “property management software,” rent collection, tenant screening, enterprise portfolio.

---

## What we refuse (lane law)

| Own | Do not build |
|-----|----------------|
| Deposit clock from **surrender** | Monthly rent rails |
| Itemization + photo **links** + mail proof | Inspection SaaS / maintenance tickets |
| Packet `.json` + watermarked preview → mail-ready PDF | Escrow banking / ACH refund |
| Guides + statute index | Legal advice |

**One-liner for copy:** Avail/Innago run the lease · **Deposit Desk runs the week the keys come back.**

---

## Metrics (phase 4)

| Signal | Why |
|--------|-----|
| Preview → paid export | Paywall working; preview not “good enough” |
| `packet.json` import used | Handoff from PM/spreadsheet |
| Guides → `/app?state=` | Locale bar + SEO working |
| Feedback “ruleset” + state | Expansion demand without leaving lane |
| Pro retention through turnover season | Subscription vs per-turn economics |

---

## Canon pointers

| Doc | Use |
|-----|-----|
| `docs/WEAPONIZE_ACTION_PLAN.md` | Moat walls · handoff architecture |
| `docs/SMALL_PM_LANE_MAP.md` | Future lanes (A–G); deposit core first |
| `docs/PRICING_CANON.md` · `PRICING_DIVE_PER_TURN.md` | GTM |
| `docs/FULL_SEND_STRIPE.md` | Prod Stripe + smokes |
| `docs/DISCOVERY_SEO_AUDIT.md` | SEO score rubric |
| `docs/PHASE3.md` | Shipped: KV, magic link, email reminders |

**Previous phases:** `PHASE2.md` · `PHASE3.md` · **this doc = active roadmap.**
