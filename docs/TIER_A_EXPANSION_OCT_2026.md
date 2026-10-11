# Tier A expansion · Oct 11 2026

**Ship target:** `32 states + DC` (33 wizard codes) · **13 new states** · **11 new metros** · NC/CO wizard honesty · statute index audit.

Not legal advice. Counsel confirms marketing claims per jurisdiction.

## New wizard states (Tier A)

| Code | Days (default) | Cite | Notes |
|------|----------------|------|--------|
| CA | 21 | Cal. Civ. Code § 1950.5 | Short window · itemization discipline |
| MN | 21 | Minn. Stat. § 504B.178 | Mailing address habits |
| HI | 14 | Haw. Rev. Stat. § 521-38 | |
| VT | 14 | 9 V.S.A. § 4461 | Seasonal units · counsel |
| NE | 14 | Neb. Rev. Stat. § 76-1416 | |
| SD | 21 | SDCL § 43-32-24 | Address gate |
| RI | 20 | R.I. Gen. Laws § 34-18-19 | Later-of anchors |
| CT | 21 | Conn. Gen. Stat. § 47a-21 | Forwarding address |
| DE | 20 | 25 Del. C. § 5514 | |
| WV | 60 | W. Va. Code § 37-6A-2 | Multi-anchor statute |
| KY | 30 | KRS 383.580 | URLTA demand / damage lists · wizard export discipline |
| AR | 60 | Ark. Code § 18-16-305 | |
| CO | 30 (+60 lease cap) | C.R.S. § 38-12-103 | `extendedReturnDays` · step alerts |

## NC fix (kept · not removed)

- Pack: `returnDays: 30`, `extendedReturnDays: 60`
- Wizard: step 1 statute details + step 2 turnover alert for interim day 30 / final day 60
- Pain guide unchanged: `north-carolina-interim-30-final-60-deposit`

## Metros (city preset + local guide)

| Preset | Guide slug |
|--------|------------|
| tampa-fl | tampa-florida-deposit-local-guide |
| orlando-fl | orlando-florida-deposit-local-guide |
| jacksonville-fl | jacksonville-florida-deposit-local-guide |
| atlanta-ga | atlanta-georgia-deposit-local-guide |
| richmond-va | richmond-virginia-deposit-local-guide |
| northern-virginia-va | northern-virginia-deposit-local-guide |
| baltimore-md | baltimore-maryland-deposit-local-guide |
| salt-lake-city-ut | salt-lake-city-utah-deposit-local-guide |
| new-orleans-la | new-orleans-louisiana-deposit-local-guide |
| seattle-wa | seattle-washington-deposit-local-guide |
| las-vegas-nv | las-vegas-nevada-deposit-local-guide |

Header `METRO_NAV`: Chicago · DC · Miami · **Tampa** · **Atlanta**

## Statute link law (audit)

1. `web/lib/statute-urls.mjs` — one `https` URL per `SUPPORTED_STATES` code (throws if missing).
2. `scripts/build-deposit-statutes-page.mjs` — index table links cite + URL.
3. `scripts/audit-statute-urls.mjs` — nav + **every URL and cite on `/legal/deposit-statutes`**.
4. `scripts/audit-statute-outbound.mjs` — blog outbound allowlist.
5. `scripts/lib/cite-link-html.mjs` — wizard + guides link to `STATUTE_URLS`.

## Regional subagent audit lanes

Run `node scripts/audit-region-expansion-oct-2026.mjs` after generate.

| Region | Codes | Subagent focus |
|--------|-------|----------------|
| Pacific | CA, HI, WA | Short clocks · substantiation (WA) |
| Mountain | CO, UT, NV | CO lease cap · Vegas same-mail |
| Midwest | MN, IA, NE, SD | 14/21-day cluster |
| South | AR, LA, FL, GA, KY, NC, MS | FL two-step · NC dual · KY URLTA |
| Northeast | CT, DE, RI, NH, NJ, VT | Later-of / forwarding |
| Mid-Atlantic | MD, VA, WV, DC | 45-day belt · NoVA cross-links |

## Generate + deploy

```bash
npm run generate-tier-a-oct-2026
node scripts/sync-site-head.mjs
npm run audit
npm run smoke:prod   # after deploy
```

## Tier 4 research (not shipped this pass)

RI/CT/DE/WV/KY/AR **shipped** in this expansion. Remaining simple candidates for a follow-up: **ID, SC (demand), OR** — see `docs/STATE_EXPANSION_AUDIT_2026-09-22.md` defer list.
