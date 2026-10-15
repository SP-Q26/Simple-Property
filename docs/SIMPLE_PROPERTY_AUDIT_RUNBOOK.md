# Simple Property · audit runbook (paste each sprint)

**Lane:** `simple_property` · repo root `~/SPQ/simple-property`

## Quick gate (repo root)

```bash
npm run audit:packet-bar
npm run audit:telemetry
npm run audit:receipt-rail
npm run audit:git
npm run preflight             # git + web audit
```

## P0 smoke (prod)

```bash
node scripts/smoke-prod.mjs
node scripts/smoke-checkout-live.mjs    # Stripe green path
curl -sI https://simple-property.com/ | head -3
curl -sI https://simple-property.com/blog/ | head -3
```

## Full smoke (when releasing)

```bash
npm run smoke:full
```

## Brand / copy

```bash
npm run audit:em-dash
npm run audit:customer-voice
npm run audit:hub-copy
npm run audit:goal-copy
npm run audit:discovery
```

## SEO / content

```bash
npm run audit:blog
npm run audit:route-series
npm run audit:seo-sweep
```

## Money / infra

```bash
npm run audit:stripe-live
npm run audit:stripe-sweep
npm run audit:vercel-env
npm run audit:resend
```

## Swarm (pre big push)

```bash
npm run audit:swarm
npm run audit:elevation
```

## Product truth

- Documentation tools only · not legal advice in footers
- Deposit Desk promises: clocks, itemization, packet vs spreadsheet blogs must match UI
- `isles_brand=deposit_desk` on every Stripe object

## Git

- Commit blog/manifest batches · do not leave 200+ files unstaged across deploys
- `*@users.noreply.github.com` on push

## Sprint report (fill after run)

| Field | Value |
|-------|--------|
| P0 count | |
| `smoke:full` | pass / fail |
| Packet bar / telemetry gaps | |
| One SEO or PBS fix | |

*Internal · not legal advice.*
