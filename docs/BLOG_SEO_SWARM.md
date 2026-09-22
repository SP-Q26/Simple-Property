# Blog SEO swarm · law · landlords · renters · news

**Gate:** `npm run audit:blog` · chained in `npm run audit` and swarm metric **Blog SEO**.  
**Build bus:** `npm run sync-blog-seo` (JSON-LD + index + RSS + sitemap + vercel rewrites).

**Source of truth:** `web/data/blog-manifest.json` — every slug must have `web/blog/{slug}.html`.

---

## Four SEO pillars

| Pillar | `category` | SEO intent | Min posts (gate) |
|--------|------------|------------|------------------|
| **Rules & law** | `law` | 765 ILCS 715/, RLTO, itemization, surrender, wear vs damage | ≥ 2 |
| **Landlords** | `landlord` | Operator how-to, tools, mail, comparisons | ≥ 2 |
| **Renters** | `renter` | Tenant-facing facts (traffic + trust); always link operator tools | ≥ 2 |
| **News & law watch** | `news` | Roundups, seasonal reminders, `lawWatch: true` | ≥ 2 · **law watch ≥ 2** |

Renters content is **balanced facts**, not legal advice — captures search intent without pretending to be tenant law firm.

---

## Full swarm · issue matrix

Run **`node scripts/audit-blog-seo.mjs`** — every row below is a check.

| Issue | Swarm check | Fix |
|-------|-------------|-----|
| Orphan HTML not in manifest | manifest row for each `.html` | Add row + `build-blog-seo` |
| Manifest without HTML | `MISSING HTML` in build | Write post HTML first |
| Sitemap drift | each slug in `sitemap.xml` | `npm run build-blog` |
| Vercel 404 on clean URL | rewrite per slug | `build-blog-seo.mjs` |
| Broken internal `/blog/…` links | `audit-links.mjs` reads manifest | Add route via manifest |
| Missing RSS | `feed.rss` exists + self atom link | `build-blog` |
| Blog index taxonomy | clusters `cluster-law` etc. | manifest markers in `blog/index.html` |
| Duplicate Article JSON-LD | single `@type":"Article"` | `sync-blog-article-seo.mjs` |
| Missing JSON-LD | Article on every post | sync script |
| Missing canonical | each post | hand + sync |
| Missing disclaimer | “not legal advice” on every guide | sync script |
| Missing `/app` CTA | product funnel | add button on post |
| Missing og:image | shared card OK | sync script |
| Pillar under-filled | law/landlord/renter/news ≥ 2 | ship posts |
| Law watch lane thin | `lawWatch` posts ≥ 2 | monthly news post |
| robots | `Sitemap:` line | `robots.txt` |
| Content depth score | ≥ 12 posts → 98+ swarm | editorial calendar |
| Statute tracking | `statutes[]` on manifest rows | update when law changes |

---

## Editorial calendar · law watch

**Monthly (news pillar):**

1. Publish `illinois-rental-law-watch-YYYY-MM` — what we track, not “bill passed” unless verified.
2. Update **`updated`** on affected law posts when 765 ILCS / RLTO guidance changes.
3. Add row to manifest `statutes` array when a post cites a new section.

**Seasonal (news):**

- Fall: Chicago heat season (see `chicago-heat-season-landlord-reminder`).
- Spring: turnover / deposit peak — cross-link checklist + wear vs damage.

**When Illinois rules change (process):**

1. Counsel confirms text · we do **not** scrape legiscan as truth.
2. Update fact strips in app (`il-deposit-rules.mjs`) if math changes.
3. Update blog posts + `dateModified` in JSON-LD via sync script.
4. Ship news post “Law watch · {month}” with links to updated guides.
5. Bump RSS · run full `npm run preflight`.

---

## Backlog · SEO queue (next posts)

| Slug (proposed) | Pillar | Query lane |
|-----------------|--------|------------|
| `late-deposit-return-illinois` | renter | deposit late what to do |
| `illinois-5-day-notice-basics` | law | operator notice (counsel) |
| `move-in-inspection-checklist-illinois` | landlord | move-in photos |
| `illinois-rental-law-watch-oct-2026` | news | monthly |
| `fair-housing-listing-language` | landlord | listing launcher prep |

---

## Agent / discoverability

| Asset | URL |
|-------|-----|
| RSS | `/blog/feed.rss` |
| Guides hub | `/blog` |
| llms.txt | cites blog + RSS |
| spt-ai-bus | `guides` + add `blog_feed` when bumped |

---

## Commands

```bash
# New post workflow
# 1. web/blog/my-slug.html
# 2. row in web/data/blog-manifest.json
npm run sync-blog-seo
npm run audit:blog
npm run audit:swarm
```

---

## Swarm scores (main swarm doc)

See `docs/SWARM_AUDIT.md` — add **Blog SEO** metric ≥ 95.

Related: `docs/SMALL_PM_LANE_MAP.md` (product lanes blog should announce when shipped).
