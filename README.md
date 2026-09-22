# Simple Property Tools

**Homestead** · plain tools for mom-and-pop landlords (teams of 1–3). Product: **Deposit Desk** (Illinois alpha).

**GitHub:** [SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property) · `docs/REPO_CANON.md`

Canon: `docs/CANON.md` · brand: `docs/BRAND.md` · quality: `docs/SWARM_AUDIT.md`.

- **Umbrella:** Simple Property Tools · **mascot:** Homestead (plain homestead mark)  
- **Vibe:** Plain dealing · Amish-*adjacent* values (simple, honest, no flash) — not caricature  
- **Product:** Deposit Desk · IL move-in / move-out deposit packets  
- **Stack:** Static `web/` on Vercel · Stripe Checkout · localStorage packets · KV Pro index · Resend reminders  
- **Repo:** [SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property) — forked from Innsegall **only** to bootstrap GitHub/Vercel; shipped code is Deposit Desk only  

## Alpha routes

| Path | Purpose |
|------|---------|
| `/` | Marketing home |
| `/pricing` | Plans |
| `/app` | 5-step packet wizard |
| `/success` | Post-checkout · unlock export |
| `/blog` | IL SEO hub (7 guides) |

## Local dev

Two modes — pick based on what you are testing.

| Mode | Command | Use when |
|------|---------|----------|
| **UI fast** | `cd web && npm run preview` | Homestead, wizard, print with **`/app?demo=pro`** |
| **Full stack** | `cd web && npm run dev` | Stripe checkout + **`/api/entitlement`** on success |

Full stack needs `web/.env.local` from `.env.example` (`STRIPE_*`, `SPT_ENTITLEMENT_SECRET`; phase 3 adds `KV_REST_*`, `RESEND_API_KEY`, `SPT_CRON_SECRET`).

Or from repo root: `chmod +x scripts/preview.sh && ./scripts/preview.sh static|full`

**Better than opening HTML in the editor:** static preview serves `cleanUrls` paths (`/pricing`, `/app`) on port **4321**.

**Best match to production:** connect the repo to Vercel → every push gets a **Preview URL**. Production apex when you assign `simpleproperty.tools`.

## Deploy

Connect `web/` as Vercel project root (or repo root with `rootDirectory: web`). Set `SPT_SITE_URL` on preview; production uses `https://simpleproperty.tools` in catalog until overridden.

## Docs

- `docs/SWARM_AUDIT.md` — nine-lane scores (gate ≥ 95) + maintenance tasks  
- `docs/LANE_COMPARE.md` · `docs/DEPLOY.md` — vs Innsegall · git/Vercel  
- `docs/SWARM_2026-09-20.md` — competitor + IL rules + MVP synthesis  
- `docs/PHASE2.md` · `docs/PHASE3.md` — billing, portal, KV, magic link, reminders  
- `docs/ALPHA.md` — P0/P1 checklist  

**Quality:** `npm run preflight` (repo root) or `cd web && npm run audit`

**Not legal advice.** Statute references are for product copy only; operators should confirm with counsel.
