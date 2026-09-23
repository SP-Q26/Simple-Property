# Social link previews · Open Graph

**Default image:** `https://simple-property.com/og/spt-share-door.png?v=20260923` (1200×630 · coverage color bar + door)

**Coverage announcement:** `https://simple-property.com/og/spt-share-coverage-expansion.png?v=20260923` (blog post `deposit-desk-new-states-thanks-sep-2026`)

Facebook and LinkedIn do not reliably use SVG for `og:image`. PNG is generated from `web/og/*.svg` via `build-og-share-svg.mjs` (reads `deposit-rules.mjs` for 30/45 chips).

## Maintain

```bash
npm run sync:seo    # rebuild SVG art + export PNGs + inject <!-- spt-social -->
npm run audit:social
```

Bump `OG_CACHE_VERSION` in `scripts/lib/social-share.mjs` when art changes so Facebook Debugger fetches a new URL.

After deploy, refresh Facebook cache: [Sharing Debugger](https://developers.facebook.com/tools/debug/) → scrape the blog URL and `/`.

**Drop pages with full OG + Twitter:** `/`, `/app`, `/pricing`, `/launch-stack`, `/feedback`, `/blog`, legal trio, logs/success (noindex but preview-ready).

Per-post `ogImage` / `ogImageAlt` live in `web/data/blog-manifest.json`.
