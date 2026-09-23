# Multi-state deposit packs · Deposit Desk

Not legal advice. Statute summaries for product defaults only · counsel confirms before launch copy changes.

## Shipped in wizard (step 1 · State)

**18 states + DC (19 wizard codes)** · see full table in `docs/STATE_EXPANSION_AUDIT_2026-09-22.md`.

| Pattern | Codes |
|---------|--------|
| **30-day calendar** (default) | GA · IA · IL · LA · MI · MO · NC · ND · NH · NJ · NV · OH · UT · WA |
| **45-day calendar** | DC · IN · MD · MS · VA |
| **Chicago overlay** | IL → **45 days** RLTO |

**Deferred (not simple):** WI, FL, AZ, TX, KS, PA, SC, TN, NM, MT, WY, OK, MA · see STATE_EXPANSION audit.

## Code

- `web/lib/deposit-rules.mjs` · single source for deadlines + jurisdiction labels
- `web/lib/brand-locale.mjs` · brand tag + nav derived from rules
- `scripts/sync-brand-locale.mjs` · propagate tag to HTML + `sp-nav.js`
- `web/lib/il-deposit-rules.mjs` · re-export shim for older imports

## Tenant email copy (Pro)

- Step 5 · **Send tenant copy** → `POST /api/packet/email-tenant`
- Sends text/HTML summary (amounts, itemization lines, move-in condition list) · **no photos**
- Optional BCC to landlord email from step 1
- Requires active Pro (Stripe/KV) + Resend env on host
- Privacy: `web/privacy.html` · tenant copy section

## SEO / content

- Manifest `states: ["IN"]` (etc.) on posts · `npm run build-blog` refreshes `/blog` sections (`#locale-IN`, …).
- **Locale bar** under header (`sp-nav.js`) · all shipped codes · blog anchors may lack guides for new states until content swarm.
- Illinois + Midwest blog depth unchanged; add state deadline posts per priority.
