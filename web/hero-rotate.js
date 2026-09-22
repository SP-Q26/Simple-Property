/** Home hero · rotating court-record subtitles (respect reduced motion). */
(function () {
  const el = document.getElementById("hero-rotate");
  if (!el) return;

  const lines = [
    "Illinois and Chicago filings still turn on missed 30- and 45-day return windows after surrender, not lease end alone.",
    "Indiana and Ohio dockets often award tenants when move-in photos and dated itemization never made it into the packet.",
    "Landlords still lose full deposits in small claims when the return deadline passes before a line-item letter goes out.",
    "Michigan and Iowa disputes hinge on documented wear vs damage and a dated withhold list, not memory at hearing.",
    "Missouri and downstate operators get hit twice when keys are late and the statutory clock never gets logged.",
  ];

  let index = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || lines.length < 2) return;

  function show(next) {
    el.classList.add("is-fading");
    window.setTimeout(function () {
      el.textContent = lines[next];
      el.classList.remove("is-fading");
    }, 320);
  }

  window.setInterval(function () {
    index = (index + 1) % lines.length;
    show(index);
  }, 8000);
})();
