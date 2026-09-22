# Repo canon · SP-Q26/Simple-Property

**Remote:** [https://github.com/SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property)

**Product:** **Deposit Desk** · **Simple Property Tools** · Homestead mascot · IL deposit packets.

## Origin (fork scaffold)

This GitHub repo was created by **forking [SP-Q26/innsegall](https://github.com/SP-Q26/innsegall)** for a fast empty shell (Vercel + Stripe patterns). The **canonical tree is Deposit Desk only** — not Macintosh triage. Innsegall stays on **`innsegall`**.

After the first SPT push, **`main`** on Simple-Property must contain only this workspace (`docs/`, `scripts/`, `web/`).

**Orphan local history:** If you ran `git init` and committed Deposit Desk without replacing remote, GitHub **`main` stays on the fork (`cfdb248`)** while local passes audit. Fix: **`docs/CONNECT_GIT.md`** · **`docs/GIT_TROUBLESHOOTING.md`**.

## Layout

| Path | Role |
|------|------|
| `web/` | Vercel project root · static site + `api/` |
| `scripts/` | Audit gates · Stripe catalog verify · blog SEO sync |
| `docs/` | Canon, phases, swarm, deploy |

## Branches

| Branch | Use |
|--------|-----|
| `main` | Production · `simpleproperty.tools` |
| `preview` | Optional Vercel preview smoke |

## Git identity (repo-local)

```bash
git config user.name "S.P."
git config user.email "293159210+SP-Q26@users.noreply.github.com"
```

## Quality gate

```bash
npm run preflight   # from repo root · web npm ci + audit + swarm
```

## Vercel

Import **`SP-Q26/Simple-Property`** · root directory **`web`**. Env: `web/.env.example`.

## Not in scope

- Xano (use Stripe + KV + Resend — see `docs/LANE_COMPARE.md`)
- Innsegall CLI, boat pages, or Mac gospel on this remote
