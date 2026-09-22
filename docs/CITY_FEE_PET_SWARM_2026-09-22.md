# Major cities · fees · pets · research swarm

Deposit Desk covers **IL · IN · OH · MI · IA · MO** with a **major-city dropdown** on wizard step 1. Only **Chicago** changes the return clock in-app today (**45 days** RLTO). Other cities link to guides and remind operators to confirm local code with counsel.

## City presets (app + guides)

| City | State | Clock in app | Guide slug |
|------|-------|--------------|------------|
| Chicago | IL | **45-day RLTO** | `chicago-45-day-deposit-deadline` (existing) |
| Evanston | IL | 30-day IL default | `evanston-illinois-rental-deposit-guide` |
| Indianapolis | IN | 45-day IN default | `indianapolis-indiana-deposit-local-guide` |
| Fort Wayne | IN | 45-day | `fort-wayne-indiana-deposit-local-guide` |
| Columbus | OH | 30-day | `columbus-ohio-deposit-local-guide` |
| Cleveland | OH | 30-day | `cleveland-ohio-deposit-local-guide` |
| Cincinnati | OH | 30-day | `cincinnati-ohio-deposit-local-guide` |
| Detroit | MI | 30-day | `detroit-michigan-deposit-local-guide` |
| Grand Rapids | MI | 30-day | `grand-rapids-michigan-deposit-local-guide` |
| Des Moines | IA | 30-day | `des-moines-iowa-deposit-local-guide` |
| Iowa City | IA | 30-day | `iowa-city-iowa-deposit-local-guide` |
| Kansas City | MO | 30-day (MO side) | `kansas-city-missouri-deposit-local-guide` |
| St. Louis | MO | 30-day | `st-louis-missouri-deposit-local-guide` |

Source of truth for dropdown labels: `web/lib/city-overlays.mjs`.

## Fee and pet research posts (SEO)

| Topic | Slug |
|-------|------|
| Move-in / move-out fees vs deposit | `move-in-move-out-fees-midwest-landlords` |
| Pet deposits and withholds | `pet-deposits-security-deposit-midwest` |
| Application fee vs security deposit | `application-fees-vs-security-deposit-midwest` |

Tone: factual, pain-easing, **no em dashes** (use ` · ` or periods).

## Regenerate

```bash
npm run generate-city-seo
npm run generate-fee-pet-seo
npm run build-blog
npm run audit
npm run audit:em-dash
```

## Future overlay candidates (research only)

Add `returnDays` or jurisdiction in `city-overlays.mjs` only after counsel confirms a deposit clock differs from state default. Candidates to watch: local RLTO-style ordinances, rent control cities, and fee caps tied to move-in/move-out.
