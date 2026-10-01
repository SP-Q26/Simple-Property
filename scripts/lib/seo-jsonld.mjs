/** JSON-LD builders · breadcrumbs · article graph · meta trim. */
export const SITE = "https://simple-property.com";

export function trimMetaDescription(text, max = 160) {
  const t = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

export function breadcrumbList(slug, headline) {
  const url = `${SITE}/blog/${slug}`;
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: headline, item: url },
    ],
  };
}

export function articleGraph({ headline, description, url, published, modified, law }) {
  const article = {
    "@type": "Article",
    headline,
    datePublished: published,
    dateModified: modified || published,
    author: { "@type": "Organization", name: "Simple Property Tools" },
    publisher: {
      "@type": "Organization",
      name: "Simple Property Tools",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
    },
    mainEntityOfPage: url,
    description,
  };
  if (law) {
    article.citation = [{ "@type": "CreativeWork", name: law.name, url: law.url }];
    article.isBasedOn = { "@type": "Legislation", name: law.name, url: law.url };
  }
  const slug = url.replace(`${SITE}/blog/`, "");
  return {
    "@context": "https://schema.org",
    "@graph": [article, breadcrumbList(slug, headline)],
  };
}

export function stripJsonLd(html) {
  return html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
}

export function injectJsonLdBeforeHeadClose(html, data) {
  const block = `<script type="application/ld+json">${JSON.stringify(data)}</script>\n`;
  return html.replace("</head>", block + "</head>");
}
