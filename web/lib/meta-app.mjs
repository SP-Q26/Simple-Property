/**
 * Optional Meta (Facebook) Developer App ID for fb:app_id in HTML.
 * Not required for link previews. Only silences Sharing Debugger and future FB products.
 * App ID is public. Set FALLBACK_FB_APP_ID or env SPT_FB_APP_ID when you create an app.
 */
const FALLBACK_FB_APP_ID = "";
export const FB_APP_ID = String(process.env.SPT_FB_APP_ID || FALLBACK_FB_APP_ID).trim();
