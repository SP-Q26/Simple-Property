# Receipt Rail · Simple Property expansion

**Repo:** `SP-Q26/Simple-Property` (implementation)  
**Canon mirror (optional):** `SP-Q26/SPQ` may hold pointers only — **product truth lives here.**

| Doc | Purpose |
|-----|---------|
| [SIMPLE_PROPERTY_EXPANSION.md](./SIMPLE_PROPERTY_EXPANSION.md) | Product bible · data model · modules · pricing · roadmap gates |
| [LANE.md](./LANE.md) | Shared **Receipt Rail** grammar (entities, lifecycle, module contract) |
| [SPEC_AUDIT.md](./SPEC_AUDIT.md) | Spec vs live product audit |
| [SWARM_DEPLOY_PLAN.md](./SWARM_DEPLOY_PLAN.md) | Parallel lanes · deploy trains 0–4 |

## Relationship to shipping code today

| Today (`main`) | Expansion target |
|----------------|------------------|
| **Deposit Desk** · 5-step wizard · `web/app.js` | **P1–P2** modules expressed as Receipt Rail receipts |
| `hello@simple-property.com` · Stripe `isles_brand: deposit_desk` | Same Isles billing discipline · expanded SKUs |
| Browser-local packets + KV Pro index | Org → Property → Unit → Tenancy → **Receipt** (server-backed) |
| `/logs` operator notes | **Vault** + ops modules (P3+) |

**Do not** treat this folder as deployed behavior until P1 gates in [SIMPLE_PROPERTY_EXPANSION.md](./SIMPLE_PROPERTY_EXPANSION.md) are met. Deposit Desk remains the production lane until Receipt Rail P1 replaces or wraps the wizard spine.

## Related docs (current product)

- `docs/LANE_ISOLATION.md` — not SPQ / not WeWeb
- `docs/PHASE4_ROADMAP.md` — Deposit Desk release train (pre-expansion)
- `docs/CANON.md` · `docs/BRAND.md` — live marketing + ops canon

## For agents

1. Read **LANE.md** before inventing schema or nav.
2. Read **SIMPLE_PROPERTY_EXPANSION.md** for phase scope — **no P3 modules while P1 gates are open.**
3. Implementation changes go in **`~/SPQ/simple-property`** only; push `main` after `npm run audit`.
