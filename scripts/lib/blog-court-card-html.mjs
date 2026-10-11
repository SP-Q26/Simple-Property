/** Court-record rotate card for blog articles (injected at top of prose). */
export function blogCourtCardHtml({ states = [], cityPreset = "" }) {
  const stateAttr = states.filter(Boolean).join(",");
  const metroAttr = cityPreset || "";
  const kicker = metroAttr ? "What local dockets keep showing" : "What court records keep showing";
  return `
<!-- spt-court-record -->
      <aside class="court-record-card blog-court-record hero-rotate-wrap" role="note" aria-labelledby="blog-court-kicker" data-spt-court-card data-states="${stateAttr}" data-city-preset="${metroAttr}">
        <p class="hero-rotate-kicker" id="blog-court-kicker">${kicker}</p>
        <p class="hero-rotate-line" data-spt-court-line aria-live="polite">Loading docket patterns…</p>
        <p class="hero-rotate-note"><a href="#" data-spt-court-source rel="noopener noreferrer" target="_blank">Source</a> · patterns only · not legal advice · confirm with counsel.</p>
      </aside>
<!-- /spt-court-record -->
`;
}
