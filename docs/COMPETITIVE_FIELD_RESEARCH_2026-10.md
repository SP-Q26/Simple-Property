# Competitive field research · deposit & small-landlord lanes (Oct 2026)

**Brand + SEO scoring table:** `docs/COMPETITOR_BRAND_SEO_DIVE_2026-10-17.md`

**Our lane:** Simple Property Tools · **Deposit Desk** (statutory packets) + **Condition hub** (walkthrough proof) · **1–40 doors** · per-turn **$29/$49** or Pro **$22/mo** · not legal advice.

**SEO baseline today:** ~232 guides · state/metro/pain clusters · weak coverage on **route intent** (pricing, hub, modules, logs) until route series ships.

---

## Competitive map (who actually overlaps)

| Tier | Players | What they sell | Overlap with us |
|------|---------|----------------|-----------------|
| **Deposit-native** | [LeaseRooster](https://www.leaserooster.com/features/deposits) | State-coded deposit rules, settlement, deadline reminders, deduction ↔ move-out photos, tenant dispute thread | **High** on move-out math + clock; CA live; we win on **IL/Chicago RLTO depth**, **per-turn price**, no lease OS lock-in |
| **Deposit automation (PM)** | [Rentable](https://www.rentable.com/) | Refund compliance, splits, Yardi/Rent Manager/MRI | **Low** for mom-and-pop; **high** if we ever target 200+ doors |
| **Deposit alternatives** | Obligo, Rhino, LeaseLock, Jetty, Qira | Surety / installment / non-refundable fee models | **Different buyer** (lease-up acceleration); we document **cash deposits** |
| **Free / small PM** | Innago, Avail (Realtor.com), TenantCloud, TurboTenant | Rent collection, screening, leases, sometimes deposits as ledger line | **Medium** — deposits are a feature, not the hero; we win on **deadline + itemization export** |
| **Paid small PM** | Buildium, DoorLoop, Rentec Direct, Hemlane | Full stack accounting + maintenance | **Medium** — complexity and price; we win **turnover weekend** + **$29 turn** |
| **Enterprise PM** | AppFolio, Yardi, RealPage, Entrata | Everything | **None** for self-serve 1–40; cite as “overkill” in content |

---

## What competitors do well (steal patterns, not scope)

| Competitor | Do well | Pattern to borrow |
|------------|---------|-------------------|
| **LeaseRooster** | Deposit tied to **lease lifecycle**; reminders before legal window closes; deductions linked to **move-out media**; structured tenant dispute | Our Condition hub + Deposit Desk **same packet id** story; email reminders (shipped) |
| **Rentable** | “Compliance protection” framing for PMs; deep **accounting integration** | Enterprise lane doc only; for us: “compliance **documentation**” not insurance |
| **Avail / Innago** | Free tier, education hub, rent + deposit collection in one flow | **Guides** funnel to `/app`; free draft → paid print |
| **Buildium / DoorLoop** | Trust via brand + accounting | We counter with **narrow job**: “finish the deposit packet this weekend” |
| **Deposit alternatives** | Lower move-in cash for renters | Blog lane: “when alternatives do not replace itemization law” |

---

## Gaps we can exploit (their misses)

1. **Illinois + Chicago RLTO** as first-class (30 vs 45, RLTO receipts) — most national tools flatten states.
2. **Per-turn pricing** for seasonal owners — PM suites want monthly per-unit forever.
3. **Print-ready statutory packet** in one sitting — PM tools spread deposit across accounting modules.
4. **No platform lock-in** — export PDF/CSV, Google Calendar/Sheets handoff (`launch-stack`).
5. **Honest scope** — we do not pretend to be screening, accounting, or e-sign (reduces wrong-fit churn).
6. **Condition + deposit linked** — LeaseRooster is closest; we undercut with **hub alpha + Deposit Desk** narrative.
7. **Route SEO** — competitors rank on “property management software”; we own **deposit deadline + itemization + [state]** long tail (already) and **product route** clusters (new series).

---

## SEO competitive posture

| Intent | Who ranks | Our play |
|--------|-----------|----------|
| “security deposit software” | LeaseRooster, PM listicles | Comparison guides · route series · `deposit-desk-vs-spreadsheet` |
| “[state] security deposit return deadline” | Nolo, law firms, Avail edu | **232** state/metro posts — maintain freshness dates |
| “property management software free” | Avail, Innago, TenantCloud | **Do not chase head-on** — intercept with “deposit packet only” |
| “security deposit alternative” | Rentable, Obligo | Renter/PM education · cash deposit documentation angle |
| “move-in move-out inspection app” | Generic inspection apps | **Condition hub** series + hub CTAs |

**Technical:** Canonical on guides · sitemap · JSON-LD articles · internal links via `blog-related.mjs` · goal CTAs to `/app`, `/hub`, `/pricing`.

---

## Route blog series (5 posts each)

Shipped by `scripts/generate-route-series-oct-2026.mjs` · category `route` · field `routeSeries`:

| `routeSeries` | Landing | Series job |
|---------------|---------|------------|
| `home` | `/` | Why deadlines beat spreadsheets · door-count fit |
| `deposit-desk` | `/app` | Wizard steps · packet export · multistate |
| `pricing` | `/pricing` | Per-turn vs Pro · ROI vs dispute cost |
| `condition-hub` | `/hub` | Walkthrough proof · wear vs damage |
| `modules` | `/modules` | Suite story without PM bloat |
| `operator-logs` | `/logs` | Maintenance trail · deposit disputes |
| `launch-stack` | `/launch-stack` | 1–10 · 10–20 · 20–40 door stacks |

Run after generate: `npm run apply:blog-goal-copy` · `npm run build-blog` · `npm run audit:route-series`.

---

## Copy / nomenclature actions

- Locked table: `docs/NOMENCLATURE.md`
- Nav: **Deposit Desk** · **Condition hub** · **Guides** · **Stack**
- Avoid “PM suite”, “property management software” as **our** category
- Condition hub: never “Receipt Rail” on `/hub` or `/modules`

---

## Follow-up (not in this drop)

- Comparison posts: Deposit Desk vs LeaseRooster · vs Innago (deposit lane only)
- Keeper/Portfolio checkout in `smoke-checkout-live.mjs`
- GSC: monitor “deposit itemization” impressions post route series
