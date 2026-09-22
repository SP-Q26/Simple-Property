# Pricing dive · per-turn vs subscription vs Excel

**Date:** 2026-09-22  
**Verdict:** **Yes — per-move / per-tenancy is the better primary play** for Illinois mom-and-pop and seasonal turnover. Subscription stays an **upsell** for 3–4 doors with steady turns. Excel is the real competitor, not Hemlane.

**Not legal advice** on pass-through fees to tenants.

---

## 1. Who actually buys

| Persona | Turn pattern | How they think about money | Best SKU |
|---------|--------------|----------------------------|----------|
| **One-door side landlord** | 0–1 turn / year | “I’ll fix the sheet when someone moves” | **$29 move** or **$49 tenancy** · pass-through |
| **Seasonal (students, May–Aug)** | Burst then quiet | “I only pay when the lease turns” | **Per turn** · not $22/mo in dead months |
| **2–4 door mom-and-pop** | 2–8 turns / year | Screening + deposit stress each time | **Per turn** default · **$99/yr** if math wins |
| **Part-time operator** | Calendar-driven | Already pays per **screening** | **Same mental bucket** as ApplyLink |

**Seasonal insight:** Illinois college + lease-cycle markets spike **move-in/out in narrow windows**. A monthly sub in **November–February** feels like waste. Per-turn matches **cashflow to events** — same reason landlords accept **$40 screening once** but resist **$15/mo forever**.

---

## 2. vs Excel / Sheets (the competitor that matters)

Your blog already states the gap: Sheets until **surrender → 30/45-day math → filed packet**.

| | Excel / Google Sheet | Deposit Desk (paid turn) |
|--|----------------------|---------------------------|
| **Upfront cost** | $0 | **~$29–49 once per turn** |
| **Deadline math** | Manual · wrong cell · no RLTO toggle | Built-in · Chicago 45 / IL 30 |
| **Move-in proof** | Photos in Drive, story in email | Room table + optional photos **in one print** |
| **Move-out itemization** | Running sum errors | Line items + totals + deadline box |
| **Calendar** | Operator forgets | `.ics` / Google (free tier today) |
| **Dispute file** | Scatter | **One print PDF** for mail / tenant |

**Why per-turn beats Excel on conversion:**  
Landlord isn’t choosing “software vs free.” They’re choosing **$29 on the move-in ledger (often tenant-paid)** vs **an hour of their time + one missed deadline** (765 ILCS / RLTO exposure). One cleaning withhold or late return **>> $29**.

**Positioning line:** *“Less than a screening fee. More than a spreadsheet cell.”*

---

## 3. vs subscription (today: $22/mo · $99/yr)

| Turns / year (one landlord) | Per-turn @ $29 event | Pro annual $99 |
|----------------------------|----------------------|----------------|
| 1 move-out only | **$29** | $99 (bad deal) |
| 2 events (in + out) | **$58** | $99 (close) |
| 3 events | **$87** | $99 (sub wins) |
| 4+ events or 3+ doors overlapping | $116+ | **$99 wins** |

**Breakeven:** ~**3–4 paid events / year** → push **Pro annual** in-app (“You’ve unlocked 3 turns — save with Pro”).

**Conclusion:** Subscription is **retention for power users**, not the front door. Front door = **$29 unlock this packet** or **$49 full tenancy**.

---

## 4. vs inspection / PM SaaS

| | Inspect-style ~$49/mo | Per-turn Deposit Desk |
|--|----------------------|------------------------|
| Billing | Landlord monthly | **Event** · pass-through |
| Job | Photo volume | **Deadline + itemization packet** |
| Fit 1 door | Overkill | **Fair** |
| Seasonal | Pay dead months | **Pay move week only** |

You stay **under inspection pricing per year** for typical mom-and-pop (2 turns ≈ $58 vs $588/yr).

---

## 5. Per-tenant vs per-move (recommendation)

| Model | Pros | Cons |
|-------|------|------|
| **Per move-in / move-out** | Matches workflow steps · can charge move-out only | Two checkouts per tenancy |
| **Per tenant (full tenancy)** | One sale · $49 feels like “packet for this lease” | Slightly harder to explain |
| **Per applicant** | Like screening | Deposit packet spans months — awkward mid-lease |

**Play:** Lead **$49 full tenancy** (move-in + move-out on one packet id). Offer **$29** single event for move-out-only rush or move-in-only.

---

## 6. Pass-through (screening-style) — why it converts

1. Landlord adds **line item** on move-in statement (not deposit principal).  
2. Tenant expects **fees** at lease start (screening, admin, keys).  
3. Landlord **net $0** on software if priced at pass-through.  
4. Your customer is still the **landlord** (account); tenant is **payer** on phase B link.

**Risk:** Chicago / IL limits on move-in fees — **counsel** on lease language (see `PER_TURN_PRICING.md` copy).

---

## 7. Unit economics (updated)

- **COGS:** ~$0 marginal (Vercel + Stripe ~2.9% + 30¢).  
- **Per-turn at $29:** ~**$28** contribution · need **~18 turns/mo** for ~$500 gross at pure turn (vs ~23 subs @ $22).  
- **Mix is healthier:** Many **$29** one-time + fewer **$99/yr** sticky operators.  
- **LTV:** Turn buyer may return **next season** — capture email on checkout · no subscription required.

Update `ROI_SCALE.md` when turn SKUs ship.

---

## 8. Product / GTM implications

| Priority | Action |
|----------|--------|
| **P0** | Pricing page hero: **$49 per tenancy · $29 per move** · pass-through copy |
| **P0** | Stripe **one-time** checkout · unlock **this packet id** |
| **P1** | Tenant pay link (screening parity) |
| **P1** | In-app “You’ve paid for 3 turns → Pro $99” nudge |
| **P2** | Blog: “Charge documentation like screening” |
| **Keep** | Free draft · deadline visible · print gated |

**Do not** lead marketing with $22/mo for seasonal one-door audience.

---

## 9. Honest downsides of per-turn

- **Lower automatic MRR** unless Pro upsell works.  
- **Stripe Dashboard** noisier (many one-time payments).  
- **Support:** “I paid for wrong packet” → tie unlock to `packet.id` clearly.  
- **Bypass:** Same as today — screenshots; print gate still matters.

---

## 10. Final call

| Question | Answer |
|----------|--------|
| Better than sub-only for seasonal / mom-and-pop? | **Yes** |
| Beats Excel? | **Yes**, if priced like a **move fee**, not SaaS |
| Primary SKU? | **$49 tenancy** · **$29** single move |
| Keep subscription? | **Yes** — breakeven ~3–4 events / yr · ≤4 units |

**Next build:** Phase A in `PER_TURN_PRICING.md` — one-time checkout + `canExportPro()` OR turn unlock on `draft.id`.

---

## Related

- `docs/PER_TURN_PRICING.md` · `docs/PRICING_CANON.md`  
- `docs/SWARM_2026-09-20.md` (wedge vs inspection)  
- `/blog/deposit-desk-vs-spreadsheet`
