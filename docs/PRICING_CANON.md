# Pricing canon · Deposit Desk

**Strategy:** **Hybrid** — **per-turn primary** (seasonal / pass-through) + subscription for 3–4 doors steady turns. Dive: `docs/PRICING_DIVE_PER_TURN.md` · spec: `docs/PER_TURN_PRICING.md`.

## Tiers (customer-facing · today = subscription shipped)

| Tier | Price | Who | Pain solved |
|------|-------|-----|-------------|
| **Free draft** | $0 | Testing one turnover · single unit · “show me the packet” | No commitment; see deadline + checklist |
| **Pro monthly** | $22/mo | One busy season · try through one move-out | Print packet when clock is live; cancel after turn |
| **Pro annual** | $99/yr (~$8.25/mo) | 2–4 doors all year · multiple turns | Same export; save $165 vs 12× monthly |

## Per-turn (planned · pass-through to tenant)

| SKU | Draft price | Unlocks |
|-----|-------------|---------|
| Move-in turn | $29 | One move-in print packet |
| Move-out turn | $29 | One move-out / itemization print |
| Full tenancy | $49 | Move-in + move-out on one packet id |

Landlord lists fee on move-in ledger like screening; tenant-paid checkout link in phase B. See `PER_TURN_PRICING.md`.

**Pro monthly and Pro annual are the same product** — only billing differs.

## Unit cap

- **4 units** per Pro subscription (`web/lib/pro-limits.mjs` · Stripe `spt_units_max`).
- Enforcement: **export (print/PDF)** requires active Pro **and** step 1 “units you manage” ≤ 4.
- Wizard, calendar, `.ics`, Sheets remain free (hook before paywall).
- **5+ units:** draft free; email hello@ for Operator tier (roadmap).

## Free vs Pro features

| Feature | Free | Pro |
|---------|------|-----|
| 5-step wizard | Yes | Yes |
| 30/45-day deadline display | Yes | Yes |
| Move-in photos · itemization | Yes | Yes |
| Saved packets (browser) | Yes | Yes |
| Google Calendar · .ics · Sheets | Yes | Yes |
| Print / Save as PDF | No | Yes |
| Email deadline reminders | When site configured | Intended Pro (gate TBD server-side) |

## What Pro does not stop (honest)

- Screenshots or retyping from the wizard on screen — we do not DRM the browser.
- **Sheets CSV row** export stays free (deadline + totals hook).
- **Trust + terms:** bypassing payment for print export violates acceptable use; enforcement is product + Stripe, not litigation.

## Print bypass (technical)

- Print/PDF uses a hidden `#print-packet` layout. Without Pro (or over 4 units), that node stays **empty** and `body.spt-no-pro-print` blocks print CSS so **Cmd+P** does not dump the packet.
- Pro button still runs `window.print()` when entitled.

## Audit

`npm run audit:pricing` · chained in `cd web && npm run audit`.
