# Blog swarm state audit · 2026-09-22

Six parallel state audits (Deposit Desk product scope: deadlines, surrender, itemization, move-in proof). **Not legal advice.**

## Consensus

| State | Days (app default) | Pre-audit gap | P0 batch (this deploy) |
|-------|-------------------|---------------|-------------------------|
| IL | 30 / Chicago 45 | No peer `illinois-30-day` post; thin move-out letter | `illinois-30-day-deposit-deadline`, `move-in-inspection-checklist-illinois`, `illinois-return-and-itemization-letter` |
| IN | 45 | One deadline post only; IL-titled posts in locale | `indiana-deposit-itemization`, `indiana-security-deposit-checklist`, `indiana-surrender-date-deposit` |
| OH | 30 | Same thin pattern | `ohio-deposit-itemization`, `ohio-renter-deposit-rights`, `ohio-security-deposit-checklist` |
| MI | 30 | Same | `michigan-deposit-itemization`, `michigan-renter-deposit-rights`, `michigan-security-deposit-checklist` |
| IA | 30 | Same | `iowa-deposit-itemization`, `iowa-renter-deposit-timeline`, `iowa-security-deposit-checklist` |
| MO | 30 | Same | `missouri-deposit-itemization`, `missouri-renter-deposit-rights`, `missouri-security-deposit-checklist` |

## Generator

```bash
node scripts/generate-state-blog-p0.mjs
npm run build-blog
```

## Deferred (P1+)

- WI (forwarding-address clock not shipped)
- Per-state forks of shared IL posts (`surrender-date-illinois-deposit`, return-by-mail) or explicit IN/OH callouts in body
- Deep Chicago RLTO cluster beyond existing 45-day post
- Linking operator log tickets to deposit deduction lines (product E6)

## Verification

```bash
npm run audit
npm run audit:blog
```
