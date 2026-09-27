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

### `fb:app_id` (optional — you do **not** need a Meta app to post)

Facebook’s [Sharing Debugger](https://developers.facebook.com/tools/debug/) may say **“required properties are missing: fb:app_id”**. That is a **debugger checklist item**, not a blocker.

**What actually drives the link card** when you paste a URL on Facebook: `og:title`, `og:description`, `og:url`, and **`og:image`** (our PNGs). Those are already on the site. You can publish the coverage post without any Meta Developer account.

**When to create a Meta app (free, ~10 minutes):** only if you want a green Debugger report, or later for Login / Pixel / Business API. Not required for Simple Property marketing posts today.

If you add an app later:

1. [Meta for Developers](https://developers.facebook.com/apps/) → **Create app** → use case **Other** → type **Business** (name e.g. “Simple Property Tools Website”).
2. **Settings → Basic** → copy **App ID** → set **App Domains** `simple-property.com`, **Website** `https://simple-property.com/`.
3. Put the ID in `web/lib/meta-app.mjs` (`FALLBACK_FB_APP_ID`) or Vercel env `SPT_FB_APP_ID`.
4. `npm run sync:seo` → commit → deploy → scrape again in the Debugger.

After deploy, refresh Facebook cache: [Sharing Debugger](https://developers.facebook.com/tools/debug/) → scrape the blog URL and `/`.

**Drop pages with full OG + Twitter:** `/`, `/app`, `/pricing`, `/launch-stack`, `/feedback`, `/blog`, legal trio, logs/success (noindex but preview-ready).

Per-post `ogImage` / `ogImageAlt` live in `web/data/blog-manifest.json`.
