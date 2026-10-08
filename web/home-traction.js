(function () {
  var el = document.getElementById("hero-traction");
  if (!el) return;
  fetch("/api/public-traction", { credentials: "same-origin" })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (d) {
      if (!d || !d.landlordsMin) return;
      var j = d.jurisdictionsMin ? d.jurisdictionsMin + "+ jurisdictions" : "19 states + DC";
      el.textContent = d.landlordsMin + "+ landlords · " + j + " · paperwork-ready packets";
      el.hidden = false;
    })
    .catch(function () {});
})();
