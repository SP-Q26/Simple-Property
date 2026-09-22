/** Pricing questionnaire · recommends Free / per-turn / Pro. */
(function () {
  const units = document.getElementById("pf-units");
  const turns = document.getElementById("pf-turns");
  const out = document.getElementById("pf-result");
  const cards = document.querySelectorAll("[data-pricing-tier]");
  if (!units || !turns || !out) return;

  function recommend() {
    const u = Number(units.value);
    const t = Number(turns.value);
    let tier = "free";
    let copy =
      "Start free. You will see deadlines and the full wizard before you pay for print.";

    if (t >= 7 || u >= 11) {
      tier = "pro-annual";
      copy =
        "Pro annual fits your volume: print packets across the year for up to 40 units on one subscription.";
    } else if (t >= 3 || u >= 5) {
      tier = "pro-annual";
      copy =
        "Pro annual usually beats per-turn math at your turn rate. Monthly works for one heavy season.";
    } else if (t <= 2 && u <= 4) {
      tier = "per-turn";
      copy =
        "Per-turn pass-through (like screening) matches seasonal turnover. Full tenancy $49 · single move $29.";
    }

    out.textContent = copy;
    out.dataset.recommended = tier;
    cards.forEach((el) => {
      const match = el.dataset.pricingTier === tier;
      el.classList.toggle("price-card--highlight", match);
      el.setAttribute("aria-current", match ? "true" : "false");
    });
  }

  units.addEventListener("change", recommend);
  turns.addEventListener("change", recommend);
  recommend();
})();
