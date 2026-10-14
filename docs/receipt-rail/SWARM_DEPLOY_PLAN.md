# Swarm deploy plan · Receipt Rail + Deposit Desk

**Command center:** run from repo root  

```bash
npm run audit                    # proud-ship (Deposit Desk)
npm run audit:swarm              # score lanes ≥ 95
node scripts/audit-receipt-rail-spec.mjs   # expansion canon
```

**Spec audit:** [SPEC_AUDIT.md](./SPEC_AUDIT.md) · **Bible:** [SIMPLE_PROPERTY_EXPANSION.md](./SIMPLE_PROPERTY_EXPANSION.md)

---

## Two programs (do not merge trains)

| Program | Goal | Doc owner | Prod surface |
|---------|------|-----------|--------------|
| **A · Deposit Desk** | Revenue + trust on current wizard | `docs/PHASE4_ROADMAP.md` | `/app`, `/pricing`, `/success` |
| **B · Receipt Rail P1** | Hub spine + move-in/out + server PDF | `docs/receipt-rail/` | `/hub` (new, flagged) |

**Rule:** Program A deploys to `main` weekly. Program B merges only behind preview + feature flag until P1 gate **10 finalized receipts**.

---

## Train 0 · Now (0–7 days) — “spec + convert”

**Objective:** Canon in git, Deposit Desk conversion fixes live, no hub code required.

| Lane | Owner | Tasks | Gate |
|------|-------|-------|------|
| **Ops** | Agent | `npm run audit` · `audit:git` · push `main` | All P0 audits green |
| **Product** | Agent | Ship urgency paywall · ROI copy · CSS v66 | `audit-wizard-forms` · `audit-pain-copy` |
| **Spec** | Agent | `docs/receipt-rail/*` + SPEC_AUDIT + this plan | `audit-receipt-rail-spec.mjs` |
| **Stripe** | Operator | Stripe Dashboard: any abandoned checkouts from last 80 visits | Manual |
| **Analytics** | Operator | Vercel: `/app` vs blog · custom events `paywall_urgency`, `checkout_click` | Manual |

**Deploy:** `git push origin main` → Vercel prod → smoke `docs/DEPLOY.md`.

---

## Train 1 · Week 0–1 — “P1 foundation”

**Objective:** Org spine in DB, operator auth, private upload, no user-facing hub yet.

| Lane | Deliverable | Notes |
|------|-------------|-------|
| **Architecture** | ADR: Supabase (default) vs Xano | RLS `org_id` on all rows |
| **Schema** | `organizations`, `properties`, `units`, `tenancies`, `receipts`, `receipt_sections`, `media`, `exports`, `delivery_log` | Migrations versioned in repo |
| **Auth** | Operator magic link → `org_id` session | Reuse patterns from `api/auth/magic-link.js` |
| **Storage** | Signed upload URL API | No public photo URLs |
| **Entitlement** | Extend KV / DB: plan tier + property cap | Map Keeper → 5 properties (resolve 40-unit Pro separately) |
| **CI** | `audit-receipt-rail-schema.mjs` (future) stub | Fails if migrations missing |

**Deploy:** Preview only · env vars in Vercel · no marketing links to `/hub`.

---

## Train 2 · Week 2–4 — “P1 modules”

| Lane | Deliverable | Gate |
|------|-------------|------|
| **Module registry** | `template_id` → wizard config + export layout | 2 templates registered |
| **Move-out** | `move_out_condition` wizard (mobile rooms + photos) | Draft + finalize |
| **Move-in** | `move_in_baseline` wizard | Draft + finalize |
| **PDF** | Server render · watermark on free | PDF API 200 on preview |
| **Send** | Resend + magic link view | Delivery log row written |
| **Import** | Packet JSON → draft receipt (read-only path) | One sample import test |

**Deploy:** `/hub` on preview URL · `robots: noindex` until gate met.

---

## Train 3 · Week 5–6 — “P1 money + gate”

| Lane | Deliverable | Gate |
|------|-------------|------|
| **Stripe** | Keeper $29/mo · per-receipt $19/$15 SKUs · metadata `isles_brand: simple_property` | `smoke:checkout` extended |
| **Marketing** | Modules page (P1 only live) · sample redacted PDF | `audit-pain-copy` |
| **Agent** | `llms.txt` + bus: hub routes + receipt snapshot | `audit-mcp` |
| **Dogfood** | 10 finalized receipts (non-founder) | **P1 exit** |

**Deploy:** `/hub` indexable · home CTA “Condition hub” beside Deposit Desk.

---

## Train 4+ · P2–P3 (after P1 exit)

| Phase | Swarm focus | Deploy when |
|-------|-------------|-------------|
| **P2** | Compare report, deduction exhibit, key handoff | 5 Keeper or 50 à la carte |
| **P3** | Ops modules, Portfolio $79, seats | ~$2k MRR target |
| **P4+** | STR, geo packs | Property core growing MoM |

---

## Parallel swarm lanes (standing)

Mirror `docs/SWARM_AUDIT.md` lanes — **Program A** must stay ≥ 95 while **Program B** builds.

| Lane | Program A (now) | Program B (P1) |
|------|-----------------|----------------|
| Brand shell | CSS v66+ on all HTML | Hub uses same tokens |
| Product | Wizard + paywall urgency | Module wizards |
| Backend | Stripe + KV + Resend | + storage + PDF + DB |
| Agent | llms · bus · gospel | + receipt snapshot spec |
| Legal | privacy/terms | + counterparty ack copy |
| Ops | `audit-spt-web` chain | + `audit-receipt-rail-spec` |

---

## Deploy checklist (every `main` push)

1. `npm run preflight` (or `audit:git` + `cd web && npm run audit`)
2. `node scripts/audit-receipt-rail-spec.mjs`
3. `cd web && npm run audit:swarm`
4. `git push origin main`
5. Confirm `simple-property.css?v=` on prod `/app`
6. `npm run smoke:prod` · `npm run smoke:checkout` (when Stripe touched)

---

## Decisions blocking Train 1 (resolve in 48h)

| # | Decision | Default if no answer |
|---|----------|----------------------|
| D1 | Supabase vs Xano | **Supabase** |
| D2 | Keeper includes today’s Deposit Desk Pro? | **Yes** — one $29 sub |
| D3 | Unit cap | **40 units** self-serve — [PRICING_40_UNITS.md](./PRICING_40_UNITS.md) |
| D4 | `/hub` path vs subdomain | **`/hub`** on same apex |

---

## Document map

```text
docs/receipt-rail/README.md          → index
docs/receipt-rail/LANE.md            → grammar (do not break)
docs/receipt-rail/SIMPLE_PROPERTY_EXPANSION.md → bible
docs/receipt-rail/SPEC_AUDIT.md      → this audit (refresh each train)
docs/receipt-rail/SWARM_DEPLOY_PLAN.md → you are here
docs/PHASE4_ROADMAP.md               → Program A until P1 exit
docs/DEPLOY.md                       → Vercel + git
```
