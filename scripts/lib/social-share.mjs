/** Canonical Open Graph / Twitter tags for link previews (FB, LinkedIn, iMessage). */

export const SITE = "https://simple-property.com";
export const SITE_NAME = "Simple Property Tools";
/** Bump when OG PNG art changes so Facebook Debugger picks up fresh previews. */
export const OG_CACHE_VERSION = "20260923";
export const OG_IMAGE_PATH = "/og/spt-share-door.png";
export const OG_IMAGE_COVERAGE_PATH = "/og/spt-share-coverage-expansion.png";
export const OG_IMAGE = `${SITE}${OG_IMAGE_PATH}?v=${OG_CACHE_VERSION}`;
export const OG_IMAGE_COVERAGE = `${SITE}${OG_IMAGE_COVERAGE_PATH}?v=${OG_CACHE_VERSION}`;
export const OG_IMAGE_ALT =
  "Simple Property Tools Deposit Desk · coverage color bar · 18 states + DC deposit packets";
export const OG_IMAGE_COVERAGE_ALT =
  "Deposit Desk new state coverage · 18 states + DC color chips · thank you to operator contributors";
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";

export function ogImageUrl(path) {
  const base = path.startsWith("http") ? path : `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${OG_CACHE_VERSION}`;
}

/**
 * @param {{
 *   canonicalPath: string;
 *   ogTitle: string;
 *   ogDescription: string;
 *   robots?: string;
 *   ogType?: string;
 *   image?: string;
 *   imageAlt?: string;
 *   articlePublished?: string;
 *   articleModified?: string;
 * }} opts
 */
export function buildSocialMetaBlock(opts) {
  const url = `${SITE}${opts.canonicalPath}`;
  const image = opts.image ? ogImageUrl(opts.image.replace(SITE, "").split("?")[0]) : OG_IMAGE;
  const imageAlt = opts.imageAlt || OG_IMAGE_ALT;
  const robots = opts.robots ?? "index,follow";
  const ogType = opts.ogType ?? "website";
  const articleLines = [];
  if (opts.articlePublished && ogType === "article") {
    const pub = iso8601Chicago(opts.articlePublished);
    const mod = iso8601Chicago(opts.articleModified || opts.articlePublished);
    articleLines.push(`  <meta property="article:published_time" content="${pub}">`);
    articleLines.push(`  <meta property="article:modified_time" content="${mod}">`);
    articleLines.push(`  <meta property="og:updated_time" content="${mod}">`);
  }
  const lines = [
    `  <meta name="robots" content="${robots}">`,
    `  <link rel="canonical" href="${url}">`,
    `  <meta property="og:type" content="${ogType}">`,
    `  <meta property="og:site_name" content="${SITE_NAME}">`,
    `  <meta property="og:locale" content="en_US">`,
    `  <meta property="og:title" content="${escapeAttr(opts.ogTitle)}">`,
    `  <meta property="og:description" content="${escapeAttr(opts.ogDescription)}">`,
    `  <meta property="og:url" content="${url}">`,
    `  <meta property="og:image" content="${image}">`,
    `  <meta property="og:image:secure_url" content="${image}">`,
    `  <meta property="og:image:type" content="image/png">`,
    `  <meta property="og:image:width" content="${OG_IMAGE_WIDTH}">`,
    `  <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">`,
    `  <meta property="og:image:alt" content="${escapeAttr(imageAlt)}">`,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${escapeAttr(opts.ogTitle)}">`,
    `  <meta name="twitter:description" content="${escapeAttr(opts.ogDescription)}">`,
    `  <meta name="twitter:image" content="${image}">`,
    `  <meta name="twitter:image:alt" content="${escapeAttr(imageAlt)}">`,
    ...articleLines,
  ];
  return `  <!-- spt-social -->\n${lines.join("\n")}\n  <!-- /spt-social -->`;
}

function iso8601Chicago(isoDate) {
  return `${isoDate}T12:00:00-05:00`;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** Remove injected or legacy social tags before re-sync. */
export function stripSocialMeta(html) {
  let out = html.replace(/\n?\s*<!-- spt-social -->[\s\S]*?<!-- \/spt-social -->\n?/g, "\n");
  out = out.replace(/\n?\s*<meta property="og:[^"]+" content="[^"]*">\n?/g, "\n");
  out = out.replace(/\n?\s*<meta property="article:[^"]+" content="[^"]*">\n?/g, "\n");
  out = out.replace(/\n?\s*<meta name="twitter:[^"]+" content="[^"]*">\n?/g, "\n");
  out = out.replace(/\n?\s*<link rel="canonical" href="[^"]*">\n?/g, "\n");
  out = out.replace(/https:\/\/simple-property\.com\/og\/spt-card\.svg/g, OG_IMAGE);
  return out;
}

export function injectSocialMetaAfterDescription(html, block) {
  const descRe = /(<meta name="description" content="[^"]*">)/;
  if (descRe.test(html)) {
    return html.replace(descRe, `$1\n${block}`);
  }
  const viewportRe = /(<meta name="viewport"[^>]*>)/;
  if (viewportRe.test(html)) {
    return html.replace(viewportRe, `$1\n${block}`);
  }
  return html.replace("<head>", `<head>\n${block}`);
}
