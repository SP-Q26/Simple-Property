# Simple Property expansion · product bible

**Umbrella:** Simple Property Tools  
**Hub:** Simple Property — proof-of-condition for ~**1–40 units** (mom-and-pop → small operator; see [PRICING_40_UNITS.md](./PRICING_40_UNITS.md))  
**Transactional layer (live):** **Deposit Desk** on `hello@simple-property.com` — email, checkout, statutory deposit packet  
**Repo:** `SP-Q26/Simple-Property` · prod `main` → `simple-property.com`  
**Grammar:** [LANE.md](./LANE.md) · index [README.md](./README.md)

---

## What it is

**Simple Property** is a **proof-of-condition hub**: capture at the door, finalize a dated record, deliver PDF or a share link (optional tenant acknowledge). The **move-in vs move-out compare** is the moat — spreadsheets and photo folders do not chain across turnover.

**Deposit Desk** stays the **deposit lane** (surrender clock, withhold lines, mail-ready export) until Receipt Rail P1 subsumes those steps as modules. Same brand family, same Isles billing discipline.

### Not a PMS

No rent ACH, no screening, no syndication, no maintenance portal replacement. Capture → finalize → PDF / share / email **is** the product.

### Audience

| Segment | Doors | Job to be done |
|---------|-------|----------------|
| Mom-and-pop landlord | 1–10 | Survive turnover without losing deposit disputes |
| Family crew | 5–15 | Repeatable condition history per unit |
| Small operator | 16–**40** | Vault, seats, ops modules (P3) |
| STR host (later P4) | 1–5 listings | Turnover + damage claim pack |

---

## Data model (spine)

Canonical chain (server-backed target state):

```text
Organization → Property → Unit → Tenancy → Receipt → sections / media → exports
```

| Entity | Notes |
|--------|--------|
| **Organization** | Stripe customer, plan tier, seat list (Portfolio) |
| **Property** | Jurisdiction, address, timezone for deadlines |
| **Unit** | Label (Unit 2, Apt B), optional external id |
| **Tenancy** | Parties, lease window, surrender date when ended |
| **Receipt** | One module run (`template_id`), `draft` or `finalized` |
| **Section** | Room/area/checklist block; ordered |
| **Media** | Storage path + caption + captured_at |
| **Export** | PDF artifact id, watermark flag, created_at |
| **Delivery log** | Send/ack audit rows |

### Finalize · amend

- **Finalize** locks content; operator cannot silently edit photos or amounts.
- **Changes** require a new **amendment receipt** with `parent_receipt_id` → prior finalized id.
- Compare (P2) only pairs **finalized** receipts on the same tenancy.

### Send

- Operator triggers **Send** → magic link + optional Resend email to counterparty.
- Counterparty: view-only, download PDF, optional **ack** (timestamp, no account).
- Every send appends to **delivery audit log** (channel, time, receipt/export refs).

---

## Modules (13 · phased)

Each module = **`template_id` + wizard + export layout** — one app shell, not thirteen repos.

| Phase | Module | `template_id` (proposed) | Notes |
|-------|--------|--------------------------|--------|
| **P1** | Move-in baseline | `move_in_baseline` | Room condition, photos, album links |
| **P1** | Move-out condition | `move_out_condition` | Mirrors move-in structure for compare |
| **P2** | Deposit deduction exhibit | `deposit_deduction_exhibit` | Line items · maps from Deposit Desk step 3 |
| **P2** | Key / fob handoff | `key_fob_handoff` | Counts, photos, signatures optional |
| **P2** | Move-in vs move-out compare | `compare_report` | Derived export · not a separate capture |
| **P3** | Maintenance visit | `maintenance_visit` | Vendor note + photos |
| **P3** | Entry notice | `entry_notice` | Documentation of notice · not legal service |
| **P3** | Periodic inspection | `periodic_inspection` | Quarterly / annual walk |
| **P4** | STR turnover | `str_turnover` | Checklist + linens/amenities |
| **P4** | STR damage claim pack | `str_damage_claim` | Evidence bundle for platform dispute |
| **P5** | Water 48h | `water_48h` | Chicago / local compliance capture |
| **P5** | Contents inventory | `contents_inventory` | Room list + serials |
| **P5** | Geo STR license manifest | `str_license_manifest` | Jurisdiction-specific fields |
| **P6** | Owner job diary | `owner_job_diary` | Vendor work log (extends `/logs` concept) |

**Deposit Desk mapping (today → P1/P2):**

| Current wizard step | Target module |
|--------------------|---------------|
| 1 Property / state | Property + Unit on org spine |
| 2 Turnover / surrender | Tenancy + `move_out_condition` metadata |
| 3 Withholds | `deposit_deduction_exhibit` |
| 4 Move-in proof | `move_in_baseline` (or linked receipt) |
| 5 Export / mail | Finalize + export + send |

Import path: existing **packet JSON** (`spt_saved_packets`) → migration tool → draft receipts (do not drop local-only users on cutover).

---

## App shape

### Navigation (target)

```text
Home (portfolio) · Properties · Receipts · Vault · Billing · Settings
```

| Area | Purpose |
|------|---------|
| **Home** | Portfolio snapshot · drafts needing finalize · clocks (deposit) |
| **Properties** | Units, tenancies, receipt timeline per building |
| **Receipts** | Cross-property list · filter by template / status |
| **Vault** | Finalized PDFs + send/ack log for counsel / insurance |
| **Billing** | Plan, usage, Stripe portal |
| **Settings** | Org name, default jurisdiction, email from-name |

### Wizard UX

- **Mobile-first:** room list, camera capture, optional cloud album link.
- **Review** step: missing sections flagged.
- **Verdict:** `CLEAR` · `FIX_LIST` · `FILE` (wording per module).
- **Finalize** explicit button — no accidental lock.

### Counterparty

- Magic link (TTL, revocable).
- PDF download.
- Optional ack checkbox + timestamp.
- No signup wall.

### Marketing (public site)

| Surface | Role |
|---------|------|
| Problem-led **home** | Hub story · Deposit Desk CTA retained |
| **Modules** page | 13 modules by phase · not all linked until shipped |
| **Pricing** | Keeper / Portfolio / à la carte |
| **State SEO** | Existing blog + statute pages · hub keywords over time |
| **Sample PDF** | Redacted finalized move-in/out pair |
| **Per-receipt checkout** | Stripe hosted · same as today’s turn unlock |

---

## Money

### Subscription tiers

| Tier | Target | Includes |
|------|--------|----------|
| **Free** | Try one turnover | 1 property · **2 units** · 1 receipt/mo · watermarked PDF |
| **Keeper** | $29/mo | **10 units** · unlimited **core** modules · includes Deposit Desk Pro for those units |
| **Portfolio** | $79/mo | **40 units** · **3 seats** · P3 ops modules |

**Core** = move-in, move-out, compare, deduction exhibit, key handoff (phase-gated).

### À la carte (per receipt)

| SKU | Price | Module |
|-----|-------|--------|
| Move-out pack | **$29** (live) | `move_out_condition` + export |
| Move-in / full tenancy | **$49** (live) | `move_in_baseline` + exhibit path |

Keep **$29 / $49** turn unlock until hub Stripe cutover; metadata `isles_brand: deposit_desk` until hub SKUs split. See [PRICING_40_UNITS.md](./PRICING_40_UNITS.md).

### Add-ons

| Add-on | Price |
|--------|-------|
| STR pack | +$15/mo |
| Loss / contents pack | +$12/mo |
| Extra seat | +$9/mo |

### 2026 cash services (human layer)

| Service | Price |
|---------|-------|
| White-glove onboarding | $299 |
| Concierge move-out | $149 |

Documentation + hand-holding only · not legal advice.

### Stripe

- Metadata: `isles_brand` (`deposit_desk` | `simple_property`), `template_id`, `org_id`, `receipt_id` on à la carte.
- Same webhook → entitlement pattern as `web/api/stripe/webhook.js` + KV index.
- Promotion codes on subscription; per-receipt single-use optional.

---

## Stack (recommended)

| Layer | Choice | Notes |
|-------|--------|-------|
| Hosting | **Vercel** | Marketing + app + `/api` (current) |
| Data | **Supabase** or **Xano** | Org spine, RLS by org_id |
| Email | **Resend** | Send + reminders (already integrated) |
| Pay | **Stripe** | Checkout + portal |
| Files | Private bucket + signed URLs | No public photo URLs by default |
| PDF | Server render | Puppeteer / pdf service on finalize or paid export |
| Auth | Magic link | Operators; receipt-scoped tokens for counterparties |

**WeWeb:** only if it already carries a surface you cannot ship faster in this repo. Default: extend **`web/`** + API routes here.

---

## Roadmap gates (do not skip)

### P1 · 6 weeks (target)

**Ship:**

- Move-in + move-out modules (wizard + finalize + PDF).
- Email send + magic link view.
- Keeper subscription + per-receipt checkout.
- Org/property/unit/tenancy/receipt schema v1.

**Gate:** **10 finalized receipts** from non-founder accounts (dogfood + friendly landlords).

**Deposit Desk:** either wrapped as P1 export templates or parallel until import bridge ships — no breaking `/app` without redirect plan.

### P2

**Ship:** Compare report, deduction exhibit, key handoff.

**Gate:** **5 Keeper** subs **or** **50** à la carte receipts (cumulative).

### P3

**Ship:** Maintenance visit, entry notice, periodic inspection · **Portfolio** tier live.

**Gate:** ~**$2k MRR** (hub + Deposit Desk combined acceptable if attributed in dashboard).

### P4+

STR turnover, damage claim, P5 geo/water/inventory, P6 owner diary — **only when P3 property core is spinning** (receipts/month growth, churn bounded).

---

## Engineering principles

1. **One rail** — [LANE.md](./LANE.md); no orphan wizards.
2. **Finalize is sacred** — amendments are new receipts.
3. **Deposit Desk URLs** — `/app`, `/pricing`, `/success` stay stable through P1; add routes, don’t rename in place.
4. **Audits before push** — `npm run audit` on `main`.
5. **AI surfaces** — extend `llms.txt` / `spt-ai-bus.json` when hub nav ships; receipt snapshot JSON for agents.

---

## Open decisions (resolve in P1 kickoff)

| # | Question | Default bias |
|---|----------|--------------|
| 1 | Supabase vs Xano | Supabase if RLS + storage in one; Xano if no SQL appetite |
| 2 | Single app vs `/app` + `/hub` | `/hub` behind flag until P1 gate |
| 3 | Migrate localStorage packets | Import on first login; keep export JSON forever |
| 4 | Keeper includes Deposit Desk Pro | Bundle $29 Keeper = today’s Pro + hub cap |
| 5 | Compare automatic vs manual pair | Suggest pair on tenancy; operator confirms |

---

## Document history

| Date | Change |
|------|--------|
| 2026-03-14 | Initial expansion bible from operator spec · Receipt Rail index |
