/** Live prod · court strip markup + CSS cascade tail (fixed stage + hover). */
import { CSS_VERSION } from "../../web/lib/brand-locale.mjs";

export async function verifyCourtStripLive(base, html, label = "home") {
  let fail = 0;
  const need = (msg, ok) => {
    if (!ok) {
      console.error(`  FAIL ${label} court-strip: ${msg}`);
      fail++;
    } else console.log(`  ok court-strip ${msg}`);
  };

  need("stage markup", html.includes("court-record-strip__stage"));
  need("rail text", html.includes("court-record-strip__rail-text"));
  need("footer links", html.includes("court-record-strip__footer"));

  const m = html.match(/\/simple-property\.css\?v=(\d+)/);
  if (!m) {
    need("css link", false);
    return fail > 0;
  }
  const deployed = m[1];
  const root = base.replace(/\/$/, "");
  const cssUrl = `${root}/simple-property.css?v=${deployed}`;
  const res = await fetch(cssUrl, { redirect: "follow" });
  if (res.status !== 200) {
    need(`css GET ${res.status}`, false);
    return fail > 0;
  }
  const css = await res.text();

  need("fixed stage height token", css.includes("--court-strip-stage-h"));
  need(
    "line min-height override",
    css.includes(".court-record-card--strip .court-record-strip__line.hero-rotate-line") &&
      /court-record-card--strip \.court-record-strip__line\.hero-rotate-line[\s\S]{0,200}min-height:\s*0/.test(css)
  );
  need(
    "strip hover rule",
    css.includes(".court-record-card.court-record-card--strip:hover") &&
      css.includes("is-strip-hover") &&
      css.includes("border-left-color")
  );
  need(
    "rail horizontal layout",
    /\.court-record-strip__rail[\s\S]{0,240}flex-direction:\s*row/.test(css)
  );
  need("cascade tail comment", css.includes("Court strip · cascade tail"));

  if (deployed !== String(CSS_VERSION)) {
    console.warn(`  warn ${label} court-strip: prod css v${deployed} · repo v${CSS_VERSION}`);
  }

  return fail === 0;
}
