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
      "Start free. See statutory deadlines first · one missed clock costs more than any unlock fee.";

    if (t >= 7 || u >= 11) {
      tier = "pro-annual";
      copy =
        "Pro annual prints packets all year for up to 40 units. At your volume, per-turn fees add up fast · one dispute still costs more.";
    } else if (t >= 3 || u >= 5) {
      tier = "pro-annual";
      copy =
        "Pro annual usually beats per-turn math at your turn rate · one mistake still costs more than $99/yr.";
    } else if (t <= 2 && u <= 4) {
      tier = "per-turn";
      copy =
        "Per-turn pass-through on the lease ledger · skip monthly SaaS · one weak packet costs more than $29.";
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
