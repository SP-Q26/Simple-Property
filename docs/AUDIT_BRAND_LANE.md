# Brand lane audit · v7 · 2026-09-22

## Findings (pre v6 shell)

| Issue | Severity |
|-------|----------|
| Blog/legal pages missing Homestead **mark** + primary nav | P0 |
| Inconsistent taglines (`plain tools`, `Open app`, text-only lockups) | P1 |
| App header used product name only — no umbrella brand | P1 |
| `brand-tag` forced **ALL CAPS** (felt shouty / rough) | P1 |
| CSS cache split v3/v5 across pages | P1 |
| Footers varied (no colophon, raw © lines) | P2 |

## Fixes (v6 → v7)

- **Canonical shell** — `web/brand/shell-header.html` + `shell-footer.html`
- **Every page** — `brand-mark` + `brand-text` + App · Pricing · Guides
- **App** — umbrella + `<span class="brand-product">Deposit Desk</span> · Illinois packets`
- **CSS v7** — sage wash, header rule, soft card shadow, sentence-case tag, focus rings, **product-proof** block
- **Audit gates** — `audit-brand-shell.mjs` + **`audit-swarm.mjs`** (after `npm run audit`)

## Score (swarm automated)

| Metric | Score |
|--------|------:|
| Brand shell | 100 |
| Visual system | 100 |
| Typography / tag treatment | (in visual + shell) |
| Automated enforcement | 100 |

**Verify:** `cd web && npm run audit` · details: `docs/SWARM_AUDIT.md`
