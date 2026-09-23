# Social link previews · Open Graph

**Canon image:** `https://simple-property.com/og/spt-share-door.png` (1200×630, open door + SP monogram)

Facebook and LinkedIn do not reliably use SVG for `og:image`. PNG is generated from `web/og/spt-share-door.svg`.

## Maintain

```bash
npm run sync:seo    # export PNGs + inject <!-- spt-social --> on drop pages + blog
npm run audit:social
```

After deploy, refresh Facebook cache: [Sharing Debugger](https://developers.facebook.com/tools/debug/) → scrape `https://simple-property.com/app` and `/`.

**Drop pages with full OG + Twitter:** `/`, `/app`, `/pricing`, `/launch-stack`, `/feedback`, `/blog`, legal trio, logs/success (noindex but preview-ready).

**JSON-LD:** home (Organization + SoftwareApplication + FAQ), `/app` (WebApplication), `/launch-stack` (WebPage), each guide (Article via `sync-blog-article-seo.mjs`).
