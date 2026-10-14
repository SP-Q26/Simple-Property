/**
 * Highlights ordered form-flow rails and optional field stacks (wizard, feedback, pricing).
 */
export function bindFormFlowRail(form, options = {}) {
  if (!form) return;
  const rail =
    options.railEl ||
    form.querySelector(options.railSelector || ".form-flow-rail") ||
    form.closest(".pricing-finder")?.querySelector(".form-flow-rail");
  if (!rail) return;

  const items = [...rail.querySelectorAll("[class*='form-flow-rail__item']")];
  if (!items.length) return;

  const fieldSelector = options.fieldSelector || "[data-flow-step]";
  const fields = [...form.querySelectorAll(fieldSelector)];
  const hint =
    options.hintEl ||
    document.getElementById(options.hintId || "") ||
    form.querySelector(".form-flow-hint");

  function stepFromTarget(target) {
    const stack = target.closest?.("[data-flow-step]");
    if (stack) {
      const n = parseInt(stack.getAttribute("data-flow-step"), 10);
      if (!Number.isNaN(n)) return n;
    }
    if (target.matches?.("[type='submit']")) return items.length;
    return null;
  }

  function setCurrent(n) {
    const step = Math.min(Math.max(1, n), items.length);
    items.forEach((el, i) => {
      const k = i + 1;
      el.classList.toggle("form-flow-rail__item--current", k === step);
      el.classList.toggle("form-flow-rail__item--done", k < step);
      el.classList.toggle("form-flow-rail__item--upcoming", k > step);
    });
    if (hint) {
      const item = items[step - 1];
      const label =
        fields[step - 1]?.querySelector("span")?.textContent?.trim() || item?.textContent?.trim();
      if (label) {
        hint.textContent = `Step ${step} of ${items.length} · ${label} · work top to bottom.`;
      }
    }
    rail.setAttribute("data-flow-current", String(step));
  }

  form.addEventListener("focusin", (e) => {
    const n = stepFromTarget(e.target);
    if (n) setCurrent(n);
  });

  const submit = form.querySelector("[type='submit']");
  if (submit) {
    submit.addEventListener("focus", () => setCurrent(items.length));
  }

  setCurrent(1);
}
