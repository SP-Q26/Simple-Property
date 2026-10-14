# What can be achieved now · full audit

**Date:** 2026-03-14  
**Programs:** A = Deposit Desk (live) · B = Receipt Rail (alpha, no backend)

---

## Executive summary

| Layer | Achievable today | Needs backend (P1) |
|-------|------------------|---------------------|
| **Marketing + SEO** | Yes — 32 states + DC blog, home, pricing | Hub modules page (copy-only) |
| **Deposit Desk wizard** | Yes — 5 steps, urgency paywall, export lock | Server PDF |
| **Stripe checkout** | Yes — turn + Pro on prod | Keeper/Portfolio hub SKUs |
| **Email reminders** | Yes — Resend + KV when env set | Receipt send + ack |
| **Operator logs** | Yes — `/logs` local only | Vault sync |
| **Receipt Rail hub UI** | **Alpha** — `/hub` mock flow, localStorage | Org DB, auth, storage, PDF API |
| **Compare moat** | Partial — same packet, manual | Paired finalized receipts |
| **Counterparty magic link** | API exists for auth, not receipts | Receipt-scoped tokens |

**Ship now:** Program A commits + deploy. **Ship next:** `/hub` alpha (flow only, `noindex`).

---

## Program A · live (achievable on `main` today)

| Capability | Status | Gate |
|------------|--------|------|
| Statutory deadline math | Live | `deposit-rules.mjs` |
| 5-step wizard + autosave | Live | localStorage |
| Watermarked preview print | Live | `app.js` |
| Turn unlock $29 / $49 | Live | Stripe checkout |
| Pro $22/mo / $99/yr · **40 units** | Live | KV + entitlement |
| Deadline reminders | Live if env | `api/reminders` |
| Magic-link operator auth | Live | `api/auth/magic-link` |
| Urgency paywall ≤7 days | Ready to deploy | uncommitted `app.js` |
| ROI marketing copy | Ready to deploy | uncommitted HTML |
| Receipt Rail **docs** + swarm gate | Ready to deploy | `audit-receipt-rail-spec` |

**Not achievable without product work:** server-side PDF, cross-device packet sync, hub billing.

---

## Program B · alpha without hookup (achievable this week)

| Screen | Alpha behavior | Data |
|--------|----------------|------|
| **Portfolio home** | KPI cards, recent drafts | `hub-fixtures.mjs` + localStorage |
| **Properties** | List → unit → tenancy | Mock + user-added local |
| **New receipt** | Pick `move_in_baseline` / `move_out_condition` | Template registry (JS) |
| **Wizard** | Rooms, conditions, photo URLs | Draft receipt object |
| **Review** | Verdict CLEAR / FIX_LIST / FILE | — |
| **Finalize** | Lock + move to Vault | localStorage |
| **Vault** | Finalized list, export/send **stubs** | No Resend call |
| **Billing** | Link to `/pricing` | No new SKUs |

**Explicit non-goals in alpha:** login, upload bytes, email send, Stripe, compare PDF, amend chain UI (stub only).

---

## Program B · requires hookup (P1 train 1–3)

- Supabase (or Xano) schema + RLS  
- Signed uploads  
- Server PDF + watermark rules  
- Org magic link  
- Receipt magic link for tenant  
- Stripe Keeper / Portfolio products  
- Import Deposit Desk packet JSON  

---

## Pricing alignment (40 units)

See [PRICING_40_UNITS.md](./PRICING_40_UNITS.md). **Portfolio = 40 units**, not 25 properties — matches `PRO_UNITS_MAX` and operator story ($1.5M band).

---

## Audit commands (run before every deploy)

```bash
npm run audit:git
npm run audit
npm run audit:receipt-rail
cd web && npm run audit:swarm
node scripts/audit-hub-alpha.mjs   # after /hub ships
npm run smoke:prod
npm run smoke:checkout
```

---

## Vercel

Project: **simple-property** (`prj_1e9DIKDPccRkKy7ptTjRzPYaY1yf`) · root `web/` · prod `simple-property.com`.  
Verify latest deployment `READY` after push (MCP `list_deployments` / dashboard).

---

## Recommended sequence (this week)

1. **Deploy Train 0** — urgency, ROI, v66, receipt-rail docs, audits.  
2. **Merge `/hub` alpha** — `noindex`, link from `/launch-stack` only.  
3. **Dogfood** one mock move-out finalize in alpha; one real Deposit Desk packet in prod.  
4. **Week 0 decision** — Supabase + schema PR (no user traffic on hub DB until smoke).
