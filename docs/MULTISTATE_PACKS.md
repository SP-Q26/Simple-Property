# Multi-state deposit packs · Deposit Desk

Not legal advice. Statute summaries for product defaults only · counsel confirms before launch copy changes.

## Shipped in wizard (step 1 · State)

| Code | Default return days | Citation (label in app) | Notes |
|------|---------------------|-------------------------|--------|
| IL | 30 | 765 ILCS 715/ | Chicago RLTO toggle → **45 days** |
| IN | 45 | IC 32-31-3-12 et seq. | No city overlay in v1 |
| OH | 30 | ORC 5321.16 | |
| MI | 30 | MCL 554.610 | |
| IA | 30 | Iowa Code 562A.12 | |
| MO | 30 | RSMo 535.300 | |

**Deferred:** Wisconsin (704.28 · forwarding-address clock needs extra wizard fields + legal spec).

## Code

- `web/lib/deposit-rules.mjs` · single source for deadlines + jurisdiction labels
- `web/lib/il-deposit-rules.mjs` · re-export shim for older imports

## Tenant email copy (Pro)

- Step 5 · **Send tenant copy** → `POST /api/packet/email-tenant`
- Sends text/HTML summary (amounts, itemization lines, move-in condition list) · **no photos**
- Optional BCC to landlord email from step 1
- Requires active Pro (Stripe/KV) + Resend env on host
- Privacy: `web/privacy.html` · tenant copy section

## SEO / content

- Manifest `states: ["IN"]` (etc.) on posts · `npm run build-blog` refreshes `/blog` sections (`#locale-IN`, …).
- New deadline guides: Indiana 45-day, Ohio/Michigan/Iowa/Missouri 30-day (one article each).
- **Locale bar** under header on every page (`sp-nav.js`) · links to `/app?state=XX` or `/blog#locale-XX` on Guides.
- Illinois blog depth unchanged; multi-state posts roll out per state as needed.
