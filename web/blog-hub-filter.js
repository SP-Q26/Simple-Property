/** Guides hub · filter links by title and cluster (client-side index). */
(function () {
  "use strict";

  const main = document.getElementById("main");
  if (!main || main.dataset.sptPage !== "blog_hub") return;

  const clusterFromSection = (section) => {
    if (!section) return "all";
    if (section.classList.contains("blog-cluster--pain")) return "pain";
    if (section.classList.contains("blog-cluster--city")) return "city";
    if (section.classList.contains("blog-cluster--metro")) return "metro";
    if (section.id === "cluster-state" || section.classList.contains("blog-cluster--state")) return "state";
    if (section.classList.contains("blog-cluster--compare")) return "compare";
    return "other";
  };

  const entries = [];
  main.querySelectorAll("section.guides-hub a[href^='/blog/']").forEach((a) => {
    const section = a.closest("section");
    entries.push({
      el: a.closest("li") || a,
      href: a.getAttribute("href") || "",
      title: (a.textContent || "").trim(),
      cluster: clusterFromSection(section),
    });
  });

  if (!entries.length) return;

  const toolbar = document.createElement("div");
  toolbar.className = "blog-hub-toolbar form-panel";
  toolbar.innerHTML =
    '<label class="blog-hub-search-label" for="blog-hub-search">Search guides</label>' +
    '<input id="blog-hub-search" type="search" class="blog-hub-search" placeholder="State, city, deadline, Innago, spreadsheet…" autocomplete="off" />' +
    '<div class="blog-hub-filters" role="group" aria-label="Guide topics">' +
    [
      ["all", "All"],
      ["pain", "Pain"],
      ["city", "Cities"],
      ["metro", "Metro"],
      ["state", "State law"],
      ["compare", "Compare"],
    ]
      .map(
        ([id, label]) =>
          `<button type="button" class="btn btn-secondary blog-hub-filter-btn" data-cluster="${id}" aria-pressed="${id === "all" ? "true" : "false"}">${label}</button>`
      )
      .join("") +
    "</div>" +
    '<p class="field-hint blog-hub-filter-status" id="blog-hub-filter-status" aria-live="polite"></p>";

  const anchor = main.querySelector(".hero-actions") || main.querySelector("h1");
  anchor?.insertAdjacentElement("afterend", toolbar);

  const search = toolbar.querySelector("#blog-hub-search");
  const status = toolbar.querySelector("#blog-hub-filter-status");
  let activeCluster = "all";

  function applyFilter() {
    const q = (search.value || "").trim().toLowerCase();
    let shown = 0;
    entries.forEach((entry) => {
      const clusterOk = activeCluster === "all" || entry.cluster === activeCluster;
      const textOk = !q || entry.title.toLowerCase().includes(q) || entry.href.toLowerCase().includes(q);
      const visible = clusterOk && textOk;
      if (entry.el) entry.el.style.display = visible ? "" : "none";
      if (visible) shown++;
    });
    if (status) {
      status.textContent = q || activeCluster !== "all"
        ? `Showing ${shown} of ${entries.length} guides`
        : `${entries.length} guides · use search or filters`;
    }
  }

  search.addEventListener("input", applyFilter);
  toolbar.querySelectorAll(".blog-hub-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCluster = btn.getAttribute("data-cluster") || "all";
      toolbar.querySelectorAll(".blog-hub-filter-btn").forEach((b) => {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      applyFilter();
    });
  });

  applyFilter();
})();
