/** Sitewide footer identity · sync via scripts/sync-site-footer.mjs */
export const FOOTER_COLLECTIVE = "The Isles Collective";
export const FOOTER_YEAR = 2026;
export const FOOTER_WEB_CREDIT = "AJ Nichols";

export function footerIdentityHtml() {
  return `        <div class="footer-identity">
          <p class="footer-colophon">
            <img class="footer-mark" src="/favicon.svg" alt="" width="22" height="22">
            <span class="footer-product">Simple Property Tools</span>
          </p>
          <p class="footer-disclaimer">Documentation only · not legal advice</p>
          <p class="footer-collective"><span class="footer-collective__name">${FOOTER_COLLECTIVE}</span> <span class="footer-collective__year">© ${FOOTER_YEAR}</span></p>
          <p class="footer-rights">All rights reserved.</p>
          <p class="footer-credit">Web by <span class="footer-credit__name">${FOOTER_WEB_CREDIT}</span></p>
        </div>`;
}

/** @param {string} footerClass e.g. site-footer or site-footer no-print */
export function wrapFooter(footerClass, navInnerHtml, navLabel = "Footer") {
  const nav = navInnerHtml.trim();
  const hasNav = nav.length > 0;
  return `<footer class="${footerClass}">
      <div class="footer-shell">
${footerIdentityHtml()}
${hasNav ? `        <nav class="footer-links" aria-label="${navLabel}">${nav}</nav>` : ""}
      </div>
    </footer>`;
}

export const FOOTER_NAV_FULL = `<a href="/app">App</a><a href="/logs">Logs</a>
        <a href="/pricing">Pricing</a>
        <a href="/launch-stack">Stack</a>
        <a href="/blog">Guides</a>
        <a href="/blog/feed.rss">RSS</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/legal">Legal</a>
        <a href="/feedback">Feedback</a>
        <a href="mailto:hello@simple-property.com">Contact</a>`;

export const FOOTER_NAV_BLOG_POST = `<a href="/blog">Guides</a><a href="/blog/feed.rss">RSS</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/">Home</a>`;

export const FOOTER_NAV_BLOG_HUB = `<a href="/">Home</a><a href="/app">App</a><a href="/logs">Logs</a><a href="/blog/feed.rss">RSS</a>`;

export const FOOTER_NAV_APP = `<a href="/terms">Terms</a><a href="/privacy">Privacy</a>`;

export const FOOTER_NAV_LOGS = `<a href="/app">Deposit Desk</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a>`;

export const FOOTER_NAV_STATUTES = `<a href="/legal">Legal hub</a><a href="/blog">Guides</a><a href="/">Home</a>`;
