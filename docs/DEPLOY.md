# Deploy · Simple Property Tools

**GitHub:** [SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property)

Repo was forked from Innsegall only as scaffolding; **ship target is Deposit Desk** (`docs/REPO_CANON.md`).

## Git

```bash
cd simple-property
git config user.name "S.P."
git config user.email "293159210+SP-Q26@users.noreply.github.com"
npm run preflight
git push origin main
```

## Vercel

Full checklist: **`docs/VERCEL_SETUP.md`** (tracking, env, preview vs prod).

1. Import **SP-Q26/Simple-Property** · **Root directory:** `web`
2. Enable **Web Analytics** + **Speed Insights** in project dashboard
3. Env from `web/.env.example` (Preview + Production scopes)
4. `npm run sync-chrome` before deploy if HTML changed
5. Preview: push `main` or branch `preview` · Production apex: `simple-property.com`

```bash
npm run preflight
git push origin main
# or: cd web && npx vercel          # preview CLI
# prod: cd web && npx vercel --prod  # after domain + live Stripe
```

Stripe webhook (prod): `https://simple-property.com/api/stripe/webhook`

## Post-deploy

- Smoke: `/`, `/pricing`, `/app?demo=pro`, one blog URL
- GSC sitemap · Stripe webhook 200
