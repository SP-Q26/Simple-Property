/** Home · boost Deposit Desk path when paid social lands with UTMs. */
(function () {
  "use strict";
  if (location.pathname !== "/" && location.pathname !== "") return;
  var p = new URLSearchParams(location.search);
  var src = (p.get("utm_source") || "").toLowerCase();
  var ref = (p.get("ref") || "").toLowerCase();
  var fb = src === "facebook" || src === "fb" || src === "instagram" || ref === "fb" || ref === "facebook";
  if (!fb) return;
  var card = document.querySelector(".pathway-deck .pathway-card[data-spt-geo-cta], .pathway-deck .pathway-card");
  if (!card) return;
  card.classList.add("pathway-card--fb-priority");
  var state = (p.get("state") || p.get("utm_content") || "IL").toUpperCase().slice(0, 2);
  if (/^[A-Z]{2}$/.test(state)) {
    card.setAttribute("href", "/app?state=" + state + "&turnover=1&ref=fb");
  } else {
    card.setAttribute("href", "/app?state=IL&turnover=1&ref=fb");
  }
})();
