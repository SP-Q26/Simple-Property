(function () {
  "use strict";
  /** Preview-only Pro bypass — not honored on production apex. */
  window.sptIsDemoPro = function () {
    if (new URLSearchParams(location.search).get("demo") !== "pro") return false;
    var h = location.hostname;
    return h === "localhost" || h === "127.0.0.1" || h.endsWith(".vercel.app");
  };
})();
