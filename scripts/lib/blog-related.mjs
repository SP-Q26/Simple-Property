/**
 * Related guides block · state cluster + news cross-links.
 */

const RELATED_MARKERS = /<!-- spt-related-guides -->[\s\S]*?<!-- \/spt-related-guides -->/;

/**
 * @param {object} post
 * @param {object} manifest
 */
export function pickRelatedPosts(post, manifest) {
  const posts = manifest.posts || [];
  const chosen = [];
  const seen = new Set([post.slug]);

  const add = (slug) => {
    if (!slug || seen.has(slug)) return;
    const row = posts.find((p) => p.slug === slug);
    if (!row) return;
    seen.add(slug);
    chosen.push(row);
  };

  const state = post.states?.[0];
  if (state && manifest.primaryPainByState?.[state]) {
    add(manifest.primaryPainByState[state]);
  }

  const prefer = (re) => {
    for (const p of posts) {
      if (!p.states?.includes(state)) continue;
      if (re.test(p.slug)) add(p.slug);
    }
  };
  if (state) {
    prefer(/checklist/);
    prefer(/itemization/);
    prefer(/deadline/);
    prefer(/deposit-local-guide/);
  }

  if (post.category === "news") {
    add("deposit-desk-new-states-thanks-oct-2026");
    add("chicago-heat-season-landlord-reminder");
    if (state) add(manifest.primaryPainByState?.[state]);
  }

  add("deposit-desk-vs-spreadsheet");
  add("missed-illinois-deposit-deadline-what-now");

  return chosen.filter((p) => p.slug !== post.slug).slice(0, 4);
}

export function relatedGuidesHtml(post, manifest) {
  const related = pickRelatedPosts(post, manifest);
  if (!related.length) return "";
  const items = related
    .map((p) => `          <li><a href="/blog/${p.slug}">${p.title.replace(/ · Simple Property Tools$/, "")}</a></li>`)
    .join("\n");
  return `<!-- spt-related-guides -->
<aside class="guide-related" aria-label="Related guides">
  <p class="section-label">Related reading</p>
  <ul class="bullet-tight">
${items}
  </ul>
</aside>
<!-- /spt-related-guides -->`;
}

/**
 * @param {string} bodyHtml
 * @param {object} post
 * @param {object} manifest
 */
export function ensureRelatedGuides(bodyHtml, post, manifest) {
  let html = bodyHtml.replace(RELATED_MARKERS, "").trim();
  const block = relatedGuidesHtml(post, manifest);
  if (!block) return html;
  if (html.includes("<!-- spt-guide-cta -->")) {
    return html.replace("<!-- spt-guide-cta -->", `${block}\n\n      <!-- spt-guide-cta -->`);
  }
  return `${html}\n\n      ${block}`;
}
