# Full site audit · gold + quant blue · photo links · 2026-09-22

Run locally:

```bash
cd simple-property
npm run audit && npm run audit:visual && npm run audit:swarm && npm run audit:brand
```

## Where gold and blue live (v15)

| Token | Hex / role | Surfaces |
|-------|------------|----------|
| **Gold** `--beam-gold` | `#c9a227` | Primary buttons · nav hover · wizard active step border · fact strip top rail · deadline box left rail · pricing finder rail · door atmosphere · card hover hairline |
| **Quant blue** `--quant-blue` | `#3b5a78` | Eyebrows · fact strip labels · active nav text · wizard active label · price card badges · deposit receipt brand line · blog badges |
| **Quant surface** `--quant-blue-surface` | `#eef2f6` | Fact strip · form panels (app + logs) · price cards · product proof · hero receipt · deadline box background · locale pill active |

**Still sage green:** `--success` for statutory deadline lines inside product proof and brand-product callouts (clock / compliance, not decorative).

**Not on marketing shell:** Innsegall fjord dark (Stripe Checkout Dashboard only).

## Photo / cloud link fields

| Area | Field | Storage |
|------|--------|---------|
| **App step 3** | Whole-unit `photoAlbumLink` | Browser localStorage with packet |
| **App step 3** | Per-room `photoLink` (Dropbox / Drive / iCloud URL) | Same · prints in notes column |
| **App step 3** | Optional file upload (~400KB/room) | Data URL in browser only |
| **Logs** | `photoLinks` on maintenance, tickets, inspections | localStorage · CSV export column |

We never fetch cloud URLs server-side; operators paste view-only share links.

## Audit gates (expected green)

- `audit` · customer lane, CTAs, blog links
- `audit:visual` · v15, gold+blue tokens, photo link fields
- `audit:swarm` · all lanes ≥ 95
- `audit:brand` · shell + CSS version on every page

Prod smoke after deploy: `SPT_SMOKE_URL=https://simple-property.com npm run smoke:prod`
