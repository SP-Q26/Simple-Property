/** Prod smoke · stylesheet link present and loads (version may lag deploy). */
import { CSS_VERSION } from "../../web/lib/brand-locale.mjs";

export async function verifyPageStylesheet(base, html, label = "page") {
  const m = html.match(/\/simple-property\.css\?v=(\d+)/);
  if (!m) {
    console.error(`  FAIL ${label}: missing /simple-property.css?v= link`);
    return false;
  }
  const deployed = m[1];
  const root = base.replace(/\/$/, "");
  const cssUrl = `${root}/simple-property.css?v=${deployed}`;
  const res = await fetch(cssUrl, { method: "HEAD", redirect: "follow" });
  if (res.status !== 200) {
    console.error(`  FAIL ${label}: css HEAD ${res.status} ${cssUrl}`);
    return false;
  }
  const strict = process.env.SPT_SMOKE_STRICT_CSS === "1";
  if (deployed !== String(CSS_VERSION)) {
    const msg = `prod css v${deployed} · repo v${CSS_VERSION}`;
    if (strict) {
      console.error(`  FAIL ${label}: ${msg}`);
      return false;
    }
    console.warn(`  warn ${label}: ${msg} (deploy may still be rolling)`);
  }
  console.log(`  ok simple-property.css?v=${deployed}`);
  return true;
}
