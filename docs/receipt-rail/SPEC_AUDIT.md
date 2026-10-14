# Receipt Rail expansion · spec audit

**Audited:** 2026-03-14  
**Scope:** `docs/receipt-rail/*` vs live `main` (Deposit Desk)  
**Gate script:** `node scripts/audit-receipt-rail-spec.mjs`

---

## Executive summary

| Verdict | Detail |
|---------|--------|
| **Spec quality** | **Shippable as canon** — grammar, phases, and gates are coherent enough to build P1. |
| **Production parity** | **Partial** — `/hub` alpha (client spine + P1 wizards, noindex); revenue still Deposit Desk + Stripe. |
| **Deploy now** | **Train 0–1** — keep `/app`; dogfood `/hub` alpha; P1 DB + server PDF before indexable hub. |

---

## Alignment checks

| Topic | Spec | Live product | Status |
|-------|------|--------------|--------|
| Primary URL | `simple-property.com` | Same | OK |
| Not a PMS | Explicit | `/launch-stack`, Phase 4 lane | OK |
| Proof + PDF + send | Receipt Rail | Deposit Desk export + `/hub` finalize lock (local) | **Partial** — no server PDF, no receipt-scoped send |
| Move-in vs move-out moat | P2 compare | Move-in step 4 + move-out flow in one packet | **Partial** — compare not automated |
| Module count | 13 phased | 1 composite wizard | Expected gap |
| Stripe `isles_brand` | deposit_desk + future | `stripe-catalog.mjs` uses `deposit_desk` | OK |
| Pro / unit cap | Portfolio **40 units** | Pro **40 units** (`pro-limits.mjs`) | **OK** — [PRICING_40_UNITS.md](./PRICING_40_UNITS.md) |
| À la carte | $29 / $49 (canon) | $29 / $49 turn unlock | **OK** — hub SKUs merge at Stripe cutover |
| Auth | Magic link operators | `api/auth/magic-link.js` | **Partial** — packet-scoped, not org |
| Storage | Private bucket + server PDF | Photos in localStorage / links | **Gap** — P1 blocker |
| WeWeb | Optional only | Not used (lane isolation) | OK |

---

## Strengths (keep)

1. **Single rail grammar** ([LANE.md](./LANE.md)) — finalize/amend/send prevents scope creep into PMS features.
2. **Module = template + wizard + export** — matches how Deposit Desk should decompose without 13 apps.
3. **Phased gates with numbers** (10 receipts, 5 Keeper / 50 à la carte, $2k MRR) — measurable.
4. **Deposit Desk mapping table** — clear migration story from `spt_saved_packets` JSON.
5. **Counterparty view-only + ack** — legally safer than tenant accounts.

---

## Gaps & risks

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R1 | **Big-bang `/app` replacement** breaks SEO + habit | P0 | Ship `/hub` behind flag; keep `/app` until import + parity |
| R2 | **No server PDF** yet; paid unlock is client print | P0 | P1 deliverable; spec already calls server PDF |
| R3 | **Unit cap 40 vs 25** confuses pricing page | — | **Closed** — [PRICING_40_UNITS.md](./PRICING_40_UNITS.md) + CANON |
| R4 | **P1 = 6 weeks** without chosen DB | P0 | Week 0: Supabase vs Xano (default Supabase in plan) |
| R5 | **Analytics** — `/api/events` no-op | P2 | KV counters or Vercel events before hub launch |
| R6 | **13 modules in marketing** before ship | P2 | Modules page: label “Roadmap” per phase |
| R7 | **Legal** — entry notice module copy | P2 | “Documentation only” on every ops template |

---

## Spec completeness scorecard

| Criterion | Met? |
|-----------|------|
| Data spine documented | Yes |
| Lifecycle verbs (capture → send) | Yes |
| Module `template_id` list | Yes (proposed strings) |
| Pricing tiers + add-ons | Yes |
| Stack recommendation | Yes |
| Roadmap gates | Yes |
| Open decisions table | Yes |
| Link from `CANON.md` / README | Yes |
| API / OpenAPI | No — add in P1 kickoff |
| ERD diagram | No — optional |
| Threat model (magic links) | No — add before counterparty ship |

**Automated gate:** `audit-receipt-rail-spec.mjs` enforces file presence, cross-links, and keyword spine.

---

## Recommendation

1. **Treat expansion as Program B** — Deposit Desk **Program A** stays on `docs/PHASE4_ROADMAP.md` until P1 gate 1 (10 finalized receipts).
2. **Do not** block `npm run audit` on hub code existing — block on **spec canon** + **Deposit Desk** gates only.
3. **First code milestone:** schema + auth + one module (`move_out_condition`) exporting PDF — not full nav shell.

See [SWARM_DEPLOY_PLAN.md](./SWARM_DEPLOY_PLAN.md) for parallel lanes and deploy trains.
