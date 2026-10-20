/** Guides hub · filter links by title and cluster (client-side index). */
(function () {
  "use strict";

  const main = document.getElementById("main");
  if (!main || main.dataset.sptPage !== "blog_hub") return;

  const clusterFromSection = (section) => {
    if (!section) return "other";
    if (section.classList.contains("blog-cluster--pain")) return "pain";
    if (section.classList.contains("blog-cluster--city")) return "city";
    if (section.classList.contains("blog-cluster--metro")) return "metro";
    if (section.classList.contains("blog-cluster--state") || /^locale-[A-Z]{2}$/.test(section.id || "")) {
      return "state";
    }
    if (section.id === "cluster-route" || section.classList.contains("blog-cluster--compare")) return "compare";
    if (section.id === "cluster-renter") return "renter";
    if (section.id === "cluster-news") return "news";
    return "other";
  };

  /** One row per guide URL · toggle every list item that repeats the same href (hub repeats related links). */
  const byHref = new Map();
  main.querySelectorAll("a[href^='/blog/']").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!href || href.includes("feed.rss")) return;
    const section = a.closest("section");
    const row = a.closest("li") || a;
    const title = (a.textContent || "").trim();
    const cluster = clusterFromSection(section);
    const existing = byHref.get(href);
    if (existing) {
      existing.elements.push(row);
      if (title.length > existing.title.length) existing.title = title;
    } else {
      byHref.set(href, { href, title, cluster, elements: [row] });
    }
  });

  const entries = [...byHref.values()];
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
      ["compare", "Product"],
      ["renter", "Renters"],
      ["news", "News"],
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
      entry.elements.forEach((el) => {
        if (el) el.style.display = visible ? "" : "none";
      });
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
