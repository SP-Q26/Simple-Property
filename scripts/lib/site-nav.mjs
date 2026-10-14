/** Primary header nav · sync via scripts/sync-site-nav.mjs */

export const HEADER_NAV_INNER = `<a href="/app">Deposit Desk</a>
        <a href="/logs">Logs</a>
        <a href="/pricing">Pricing</a>
        <a href="/hub">Condition hub</a>
        <a href="/launch-stack">Stack</a>
        <a href="/blog">Guides</a>
        <a href="/feedback">Feedback</a>`;

export const HEADER_NAV_BLOCK = `<nav class="header-nav" aria-label="Primary">
        ${HEADER_NAV_INNER}
      </nav>`;

/** Hub SPA: skip self-link to /hub */
export const HEADER_NAV_HUB_INNER = `<a href="/app">Deposit Desk</a>
        <a href="/logs">Logs</a>
        <a href="/pricing">Pricing</a>
        <a href="/launch-stack">Stack</a>
        <a href="/blog">Guides</a>
        <a href="/feedback">Feedback</a>`;

export const HEADER_NAV_HUB_BLOCK = `<nav class="header-nav" aria-label="Primary">
        ${HEADER_NAV_HUB_INNER}
      </nav>`;
