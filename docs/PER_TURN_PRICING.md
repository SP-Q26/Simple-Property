# Per-turn pricing · tenant pass-through (screening-style)

**Idea:** Charge a **flat fee per tenancy event** (move-in packet, move-out/itemization packet, or bundled turn) — like **tenant-paid screening** — instead of (or alongside) landlord subscription.

**Why landlords like it:** They line-item it on move-in costs or lease disclosures; **tenant pays** or reimburses; landlord keeps Pro without a monthly line on their P&amp;L.

**Not legal advice:** Pass-through fees must follow **Illinois / Chicago** rules on move-in charges, caps, and disclosures. Operator confirms with counsel before adding to lease or ledger.

---

## Screening parallel

| Screening | Deposit Desk (per-turn) |
|-----------|-------------------------|
| One-time per applicant | One-time per **turn** (move-in and/or move-out) |
| Tenant often pays ApplyLink-style | Landlord buys **turn unlock** or sends **tenant checkout link** |
| $35–$55 typical | Anchor **$29–$39** per event (below “one mistake” cost) |
| Required for application | Optional but smart for **RLTO / 765 ILCS** paper trail |

---

## Recommended SKUs (product)

| SKU | Price (draft) | Unlocks | Who pays (go-to-market) |
|-----|---------------|---------|---------------------------|
| **`turn_move_in`** | **$29** | Move-in checklist + photos + print for **one address / one tenant** | Tenant at lease signing or landlord pass-through |
| **`turn_move_out`** | **$29** | Itemization worksheet + deadline + print for **one surrender** | Tenant at move-out or landlord withhold workflow |
| **`turn_full`** | **$49** | Move-in **and** move-out linked to **one packet ID** | Best value; one tenancy lifecycle |
| **`pro_monthly`** | **$22/mo** | Unlimited prints · ≤4 units | Active operator, many turns |
| **`pro_annual`** | **$99/yr** | Same | 2–4 doors all year |

**Rule of thumb for the landlord:**

- **1–2 turns / year** → per-turn (pass-through to tenant).  
- **3+ doors or 4+ turns / year** → subscription wins on math and hassle.

---

## Pass-through copy (landlord → tenant)

Use on move-in ledger, welcome letter, or lease addendum (counsel review):

> **Condition & deposit documentation fee:** $___ covers third-party move-in/move-out condition records and deposit deadline tracking for this tenancy (Simple Property Tools · Deposit Desk). Fee is **not** part of the security deposit.

Optional separate line for move-out only:

> **Move-out documentation:** $___ for itemized condition report and deposit return timeline support.

**Do not** call it “legal services” or “legal compliance.” It is **documentation software**.

---

## How it would work in the app (build phases)

### Phase A · Landlord buys one turn (MVP)

1. Step 5 · **Unlock this packet — $29** (Stripe Checkout `mode: payment`, one-time).  
2. Success → entitlement on **this `packet.id`** only (`spt_turn_unlock` in KV, signed).  
3. `canExportPro()` → subscription **OR** valid turn unlock for `draft.id`.  
4. Receipt names **property + tenant** for landlord’s tenant ledger.

### Phase B · Tenant checkout link

1. Landlord clicks **Send pay link to tenant** (email with Stripe Checkout).  
2. Tenant pays → unlocks same packet id; landlord notified.  
3. Metadata: `paid_by: tenant`, `packet_id`, `turn_type: move_in | move_out`.

### Phase C · Ledger / tracking

- Optional: export CSV row “turn fee charged $X” for Sheets.  
- Later: Operator tier multi-unit turn dashboard (not v1).

---

## Stripe shape

```text
mode: payment          # per-turn SKUs
mode: subscription     # pro_monthly / pro_annual (existing)

metadata:
  spt_sku: turn_move_in | turn_move_out | turn_full | monthly | annual
  spt_packet_id: <uuid>
  spt_turn_type: move_in | move_out | full
  spt_payer: landlord | tenant
```

**Env (future):** `STRIPE_PRICE_TURN_MOVE_IN`, etc., or dynamic `price_data` from catalog like today.

**Checkout fix when adding turns:** `subscription_data` only when `mode === 'subscription'`.

---

## Hybrid positioning (recommended)

Do **not** drop subscription. Lead with:

1. **Free draft** — prove pain (deadline on screen).  
2. **Per-turn** — “Charge this to the tenant like screening” (primary CTA for mom-and-pop).  
3. **Pro subscription** — “If you turn more than ~4 packets a year across up to 4 doors.”

Pricing page order: **Free → Per turn → Pro** (subscription second billing tab for power users).

---

## Competitive note

Inspection apps charge **landlord** monthly. Per-turn aligns with **how small landlords already think** (per lease event) and matches **screening** mental model — easier sell than $22/mo for one door.

---

## Open decisions (you pick)

1. **Single $29 turn** vs separate move-in / move-out?  
2. **Default payer:** landlord checkout first, tenant link in v2?  
3. **Replace** subscription on marketing or **keep both**? (Recommend **keep both**.)

When you lock numbers, add rows to `web/lib/stripe-catalog.mjs` and extend `docs/PRICING_CANON.md`.
