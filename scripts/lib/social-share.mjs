/** Canonical Open Graph / Twitter tags for link previews (FB, LinkedIn, iMessage). */

export const SITE = "https://simple-property.com";
export const SITE_NAME = "Simple Property Tools";
export const OG_IMAGE = `${SITE}/og/spt-share-door.png`;
export const OG_IMAGE_ALT =
  "Simple Property Tools Deposit Desk · open door with SP monogram · 18 states + DC deposit packets";
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";

/**
 * @param {{
 *   canonicalPath: string;
 *   ogTitle: string;
 *   ogDescription: string;
 *   robots?: string;
 *   ogType?: string;
 *   image?: string;
 *   imageAlt?: string;
 * }} opts
 */
export function buildSocialMetaBlock(opts) {
  const url = `${SITE}${opts.canonicalPath}`;
  const image = opts.image || OG_IMAGE;
  const imageAlt = opts.imageAlt || OG_IMAGE_ALT;
  const robots = opts.robots ?? "index,follow";
  const ogType = opts.ogType ?? "website";
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
  ];
  return `  <!-- spt-social -->\n${lines.join("\n")}\n  <!-- /spt-social -->`;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** Remove injected or legacy social tags before re-sync. */
export function stripSocialMeta(html) {
  let out = html.replace(/\n?\s*<!-- spt-social -->[\s\S]*?<!-- \/spt-social -->\n?/g, "\n");
  out = out.replace(/\n?\s*<meta property="og:[^"]+" content="[^"]*">\n?/g, "\n");
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
