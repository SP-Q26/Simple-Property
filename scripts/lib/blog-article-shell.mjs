import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · Simple Property Tools</title>
  <meta name="description" content="${description.replace(/"/g, "&quot;")}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" type="application/rss+xml" title="Simple Property Tools guides" href="/blog/feed.rss">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/simple-property.css?v=31">
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
          <span class="brand-tag">Itemize it. Date it. Keep the clock. · 18 states + DC · Chicago RLTO</span>
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
