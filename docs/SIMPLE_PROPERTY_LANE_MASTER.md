# Simple Property · lane master

**One screen for agents and operators.** Product truth lives in **`~/SPQ/simple-property`** · remote **`SP-Q26/Simple-Property`** · branch **`main`** → **simple-property.com** (Vercel root **`web/`**).

This is **not** SPQ / WeWeb / `weweb-export`. See `docs/LANE_ISOLATION.md`.

---

## Brand (locked)

| Layer | Name |
|-------|------|
| Company / site | **Simple Property Tools** |
| Program A product | **Deposit Desk** · IL & Chicago RLTO + multistate wizard |
| Program B product | **Condition hub** (customer name) · Receipt Rail spine |
| Header tag | **Deposit Desk · IL & Chicago RLTO** on marketing shells |
| Audience | Mom-and-pop → small operator · **1–40 units** self-serve |
| Voice | Deadlines · receipts · packets · **pain → fix → CTA** · not legal advice |

Detail: `docs/CANON.md` · `docs/BRAND.md` · copy gates: `npm run audit:goal-copy`.

---

## Two programs (do not conflate)

| Program | What ships | URL | Billing today |
|---------|------------|-----|----------------|
| **A · Deposit Desk** | 5-step wizard · print/PDF unlock · Pro | `/app` | Turn **$29 / $49** · Pro on live Stripe |
| **B · Condition hub** | Move-in/out walkthroughs · spine alpha | `/hub` (**noindex**) | **Keeper $29** · **Portfolio $79** documented · hub SKUs at P1 cutover |

**Rule:** Do **not** replace `/app` or move hub to index until **P1 gate** (10 finalized receipts on server). Alpha B is browser-local + fixtures until backend lands.

Expansion bible: `docs/receipt-rail/README.md` · live vs alpha: `docs/receipt-rail/ACHIEVABLE_NOW.md`.

---

## Public routes (operator map)

| Path | Job |
|------|-----|
| `/` | Home · pain/fix · packet + hub CTAs |
| `/app` | Deposit Desk wizard |
| `/pricing` | Per-turn + Pro · ROI line |
| `/hub` | Condition hub alpha (noindex) |
| `/modules` | Tool suite list · Deposit Desk + hub |
| `/logs` | Maintenance / tickets / inspection logs (browser) |
| `/feedback` | Operator feedback form |
| `/legal` | Privacy · terms |
| `/blog` | IL / multistate guides cluster |
| `/launch-stack` | Agent/discovery handoff |

Hub implementation: `docs/receipt-rail/CODE_MAP.md` · `web/lib/hub-copy.mjs` · `web/lib/receipt-spine.mjs`.

---

## Pricing canon (40-unit ceiling)

| Tier | Price | Cap | Notes |
|------|-------|-----|--------|
| Turn unlock | $29 / $49 | Per packet | **Live** until hub Stripe split |
| Pro (Deposit Desk) | Live catalog | **40 units** | `web/lib/pro-limits.mjs` |
| Keeper (hub) | $29/mo | 10 units | Documented · enforce at P1 |
| Portfolio (hub) | $79/mo | 40 units · 3 seats | Documented · P3 ops modules |

Full table: `docs/receipt-rail/PRICING_40_UNITS.md` · GTM: `docs/PRICING_DIVE_PER_TURN.md`.

---

## Competitive & SEO

Field research · competitor gaps · route blog series: `docs/COMPETITIVE_FIELD_RESEARCH_2026-10.md` · nomenclature: `docs/NOMENCLATURE.md` · `npm run audit:route-series`.

---

## Quality gate (ship bar)

From repo root:

```bash
npm run audit          # full chain (includes web swarm)
npm run audit:goal-copy
npm run audit:elevation        # branding · pricing · copy · blog · related (umbrella)
npm run audit:blog-goal-copy   # every guide in blog-manifest
npm run apply:blog-goal-copy   # pain + CTA + related blocks after bulk edits
npm run sync:site-nav          # Deposit Desk + Condition hub header nav
npm run audit:hub-copy
npm run audit:hub-alpha
npm run audit:receipt-rail
```

Swarm scores and lanes: `docs/SWARM_AUDIT.md` · CI summary: `docs/CI_GATES.md`.

**Before push:** `npm run audit:git` (SSH remote) · noreply commits only · see `docs/GIT_AGENT_CONNECTION.md`.

**Deploy:** `docs/DEPLOY.md` · env: `web/.env.example` · Stripe send: `docs/FULL_SEND_STRIPE.md`.

---

## Lane catalog (future modules)

Long-form **lifecycle lanes** (A–I): maintenance, notices, showing log, etc. — **not** a PM suite.

Map: `docs/SMALL_PM_LANE_MAP.md` · Chicago wedge: `docs/CHICAGO_IL_HYPERFOCUS.md` · vs Innsegall machine: `docs/LANE_COMPARE.md`.

Receipt Rail **module contract** (server era): `docs/receipt-rail/LANE.md`.

---

## Agent checklist (every touch)

1. Work only in **`simple-property`** — no SPQ canvas patches for this product.
2. Customer copy: **Condition hub**, not internal “Program B” on HTML.
3. Hand-edits: bump site CSS `?v=` via `web/lib/brand-locale.mjs` / `sync-site-head.mjs` when required by audits.
4. Footer: **Web by AJ Nichols** on guest surfaces (`ajnichols.com` only if statute allows outbound).
5. Run **`npm run audit`** before commit/push; fix goal-copy and hub-copy failures in the same PR.
6. Commits/pushes **only when the operator asks**.

---

## Doc index (by job)

| If you need… | Read |
|--------------|------|
| This page | `docs/SIMPLE_PROPERTY_LANE_MASTER.md` |
| Brand lock | `docs/CANON.md` · `docs/BRAND.md` · `docs/DEPOSIT_DESK_OPERATOR_VOICE.md` |
| **Isles OAR Pass** (any project) | `docs/ISLES_OAR_PASS_1PAGER.md` |
| Git / Vercel / fork origin | `docs/REPO_CANON.md` · `docs/CONNECT_GIT.md` |
| SPQ separation | `docs/LANE_ISOLATION.md` |
| Expansion / hub | `docs/receipt-rail/README.md` |
| Deposit Desk train | `docs/PHASE4_ROADMAP.md` |
| Swarm maintenance | `docs/SWARM_AUDIT.md` |
| Module roadmap waves | `docs/SMALL_PM_LANE_MAP.md` |
| Competitor / content lane | `docs/LANE_COMPARE.md` |

---

## Current train (2026-03)

| Track | Status |
|-------|--------|
| Program A on `main` | Live · urgency paywall · goal-copy audit on core surfaces |
| Program B alpha | `/hub` + `/modules` · PBS on lock · unit compare · Desk handoff · [roadmap](./receipt-rail/CONDITION_HUB_ROADMAP_2026-10.md) |
| P1 backend | Org DB · auth · server PDF · Keeper/Portfolio Stripe — **not shipped** |
| Optional polish | Sitewide nav **App → Deposit Desk** · per-post blog copy pass |

Update this table when gates close; do not duplicate long spec here — point to `ACHIEVABLE_NOW.md`.
