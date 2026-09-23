# State expansion audit · 2026-09-22

Not legal advice. Subagent statute review for Deposit Desk **simple pack** fit (one user-entered surrender date + fixed **calendar** days, return or itemized statement). Counsel confirms before marketing claims.

## Shipped in wizard (18 states + DC · 19 codes)

| Code | Days | Citation | Added |
|------|------|----------|-------|
| DC | 45 | D.C. Code § 42-3508.11 | 2026-09-22 |
| GA | 30 | O.C.G.A. 44-7-34 | 2026-09-22 |
| IA | 30 | Iowa Code 562A.12 | (Midwest v1) |
| IL | 30 | 765 ILCS 715/ | (v1) · Chicago **45** overlay |
| IN | 45 | IC 32-31-3-12 | (v1) |
| LA | 30 | La. R.S. 9:3251 | 2026-09-22 |
| MD | 45 | Md. Real Prop. § 8-203 | 2026-09-22 |
| MI | 30 | MCL 554.610 | (v1) |
| MO | 30 | RSMo 535.300 | (v1) |
| MS | 45 | Miss. Code § 89-8-21 | 2026-09-22 |
| NC | 30 | N.C.G.S. § 42-52 | 2026-09-22 |
| ND | 30 | N.D.C.C. § 47-16-07.1 | 2026-09-22 |
| NH | 30 | RSA 540-A:7 | 2026-09-22 |
| NJ | 30 | N.J.S.A. 46:8-21.1 | 2026-09-22 |
| NV | 30 | NRS 118A.242 | 2026-09-22 |
| OH | 30 | ORC 5321.16 | (v1) |
| UT | 30 | Utah Code § 57-17-3 | 2026-09-22 |
| VA | 45 | Va. Code § 55.1-1226 | 2026-09-22 |
| WA | 30 | RCW 59.18.280 | 2026-09-22 |

**New packs this release:** DC, GA, LA, MD, MS, NC, ND, NH, NJ, NV, UT, VA, WA (**13**).

## Simple add · YES (included above)

Subagent confirmed single calendar-day model from surrender / termination + possession (mapped to wizard **surrender** field).

## Deferred · NOT simple (needs extra wizard fields or branch logic)

| Code | Why defer | Next spec |
|------|-----------|-----------|
| **AZ** | 14 **business** days; tenant **demand** | Business-day engine + demand date |
| **FL** | 15/30-day **claim notice** tracks | Two-step claim vs return UX |
| **WI** | 21 days after **forwarding address** | Same class as below · already in MULTISTATE_PACKS |
| **KS** | 30 days after termination + **forwarding address** | Address-received date field |
| **PA** | 30 days + **forwarding address** branches | Dual clock |
| **SC** | 30 days · later of termination, possession, **tenant demand** | Demand + address |
| **TN** | 30 days · later of termination vs **forwarding address** | Later-of-two dates |
| **TX** | 30 days after surrender + **forwarding address** (§ 92.107) | Address gate |
| **NM** | 30 days · later of termination vs **forwarding address** | Later-of-two dates |
| **MT** | 30 days · later of end vs **written forwarding address** | Address gate |
| **WY** | 30/15 **later-of** + mailing location notice | Branching clocks |
| **OK** | 45 days · requires tenant **written demand** | Demand date field |
| **MA** | 30 days but **interest, escrow, condition statement** product scope | Legal + UX spec beyond deadline |

## Reviewed · shorter clocks (future tier)

| Code | Typical window | Notes |
|------|----------------|-------|
| CA | 21 days | Different N · still calendar |
| MN | 21 days | |
| NE, SD, VT, HI | 14 days | |
| CO | 30 or 60 | Conditional withhold branch |

## Miami / Phoenix

- **Miami:** Florida rules (**defer FL**). No Miami-specific deposit clock in wizard until FL pack ships.
- **Phoenix:** Arizona rules (**defer AZ**). Maricopa/city guides only after AZ pack.

## Ops

```bash
node scripts/sync-brand-locale.mjs   # brand tag + sp-nav from deposit-rules
npm run sync:seo
npm run audit
```

## Subagent review IDs (Cursor session 2026-09-22)

Batch 1 KS–TN · Batch 2 TX–NM · Batch 3 LA–WY · Batch 4 MD–DC + FL/AZ/WI defer.
