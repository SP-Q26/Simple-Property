# Landlord pain dive · Deposit Desk · Illinois

**Date:** 2026-09-22  
**Sources:** home/pricing copy, `CHICAGO_IL_HYPERFOCUS.md`, `SMALL_PM_LANE_MAP.md`, `GOOGLE_TOOLS_AUDIT.md`, `AUDIT_INNSEGALL_LENS.md`, wizard steps, blog cluster.

---

## Core pains (money + time)

| Pain | Why it hurts | Product answer today | Gap |
|------|----------------|----------------------|-----|
| **Missed 30/45-day clock** | Statutory deadline from **surrender**, not lease end | Deadline on step 5 · `.ics` · Google Calendar | Email reminders need live Resend; no SMS |
| **No move-in proof** | Withhold disputed without dated room notes/photos | Step 3 rooms + optional photos · print packet | Photos local only; no cloud backup |
| **Bad itemization** | Single “cleaning fee” fails 765 ILCS / RLTO | Step 4 line items + running total | Wear vs damage still operator judgment (guide exists) |
| **Wrong surrender date** | Clock starts wrong → automatic liability risk | Step 2 surrender field + law guides | No lease-end vs surrender validator |
| **Spreadsheet drift** | Formulas break under turnover burst | Wizard + Sheets row export | No two-way Sheets sync |
| **Seasonal cashflow** | Hate monthly sub in quiet months | Per-turn positioning ($29/$49 planned) | Checkout not shipped yet |
| **Multi-door collision** | Same month move-outs | Saved packets · up to **40 units** Pro | No portfolio dashboard |
| **Chicago vs statewide** | 45 vs 30 confusion | RLTO toggle on step 1 | Operator must know address rules |

---

## Operational pains by door tier

| Tier | Headache | Deposit Desk role | Not our job |
|------|----------|-------------------|-------------|
| **1–10** | Memory, commingled funds, missed clocks | Packet + calendar export | Full ledger, rent collection |
| **10–20** | No SOP, entry notices, vendor chaos | IL deposit paper trail | Maintenance tickets, eSign |
| **20–40** | Autopay, accounting, owner reports | Still use packet beside PM stack | Replace Hemlane / AppFolio |

---

## Highest wizard friction (Innsegall lens)

1. **Wear vs damage** at withhold time (`normal-wear-vs-damage-illinois` guide · lane map B3).
2. **Surrender date** vs lease end (`surrender-date-illinois-deposit`).
3. **Step 1 unit count** vs Pro cap (now **40** · was confusing at 4).
4. **Print without Pro** ( gated · intentional · free draft proves value).

---

## Pass-through / pricing psychology

- Landlords already accept **screening as per-event fee** · per-turn is the mental model.
- **Excel** is the competitor: pain is not “no software,” it is **deadline + filed packet**.
- **Pro annual** wins at ~3+ turns/year or 5+ doors with steady turnover (`PRICING_DIVE_PER_TURN.md`).

---

## Trust pains

- “Is this legal advice?” → documentation-only disclaimers everywhere.
- “Where is my data?” → browser localStorage until print/export.
- “Will Stripe/env work?” → live Vercel env still operator P0 (`AUDIT_INNSEGALL_LENS.md`).

---

## Recommended next product beats (priority)

| P | Beat | Pain addressed |
|---|------|----------------|
| P0 | Per-turn Stripe checkout | Seasonal · pass-through |
| P1 | Wear vs damage helper in step 4 | Withhold friction |
| P1 | Surrender vs lease-end hint on step 2 | Clock errors |
| P1 | Unified guide footer (App · Pricing · Stack) | Conversion |
| P2 | OG PNG social cards | Trust off-site |
| P2 | Optional Drive backup export | Move-in photo loss fear |

---

## Copy hooks that match pain (use in ads/guides)

- “Spreadsheets break at surrender date. The clock does not.”
- “Less than a screening fee. More than a spreadsheet cell.”
- “Return or itemize on time · prove move-in · line-item withholds.”

See `docs/PRICING_DIVE_PER_TURN.md` · `docs/CHICAGO_IL_HYPERFOCUS.md`.
