import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_TAG, CSS_VERSION, FONT_GOOGLE } from "../../web/lib/brand-locale.mjs";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "web");
const atmosphereBlock = readFileSync(join(webRoot, "brand/atmosphere.html"), "utf8").trimEnd();

function articleShell({ title, description, slug, published, bodyHtml }) {
  const url = `https://simple-property.com/blog/${slug}`;
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: published,
    dateModified: published,
    author: { "@type": "Organization", name: "Simple Property Tools" },
    publisher: { "@type": "Organization", name: "Simple Property Tools" },
    mainEntityOfPage: url,
    description,
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${title} · Simple Property Tools</title>
  <meta name="description" content="${description.replace(/"/g, "&quot;")}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" type="application/rss+xml" title="Simple Property Tools guides" href="/blog/feed.rss">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONT_GOOGLE}" rel="stylesheet">
  <link rel="stylesheet" href="/simple-property.css?v=${CSS_VERSION}">
  <script type="application/ld+json">${ld}</script>
</head>
<body>
${atmosphereBlock}
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="page">
    <header class="site-header">
      <a class="brand-lockup" href="/">
        <img class="brand-mark" src="/favicon.svg" alt="" width="36" height="36">
        <span class="brand-text">
          <span class="brand-word">Simple Property Tools</span>
          <span class="brand-tag">${BRAND_TAG}</span>
        </span>
      </a>
      <nav class="header-nav" aria-label="Primary">
        <a href="/app">App</a><a href="/logs">Logs</a>
        <a href="/pricing">Pricing</a>
        <a href="/launch-stack">Stack</a>
        <a href="/blog">Guides</a>
      </nav>
    </header>
    <main id="main" class="prose">
${bodyHtml}
    </main>
    <footer class="site-footer">
      <p class="footer-colophon"><img class="footer-mark" src="/favicon.svg" alt="" width="22" height="22"><span>Simple Property Tools · not legal advice</span></p>
      <nav class="footer-links"><a href="/blog">Guides</a><a href="/blog/feed.rss">RSS</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/">Home</a></nav>
    </footer>
  </div>
  <script src="/sp-nav.js" defer></script>
  <script defer src="/_vercel/insights/script.js"></script>
  <script defer src="/_vercel/speed-insights/script.js"></script>
</body>
</html>
`;
}

export { articleShell };
