import { statuteUrlFor } from "../../web/lib/statute-urls.mjs";

export function citeLinkHtml(cite, appCode) {
  const url = statuteUrlFor(appCode);
  if (!url) return cite;
  return `<a href="${url}" rel="noopener noreferrer" target="_blank">${cite}</a>`;
}

export function cta(stateName, app) {
  return `<p class="disclaimer">Not legal advice. Confirm facts and deadlines with qualified counsel.</p>
      <p><a class="btn btn-primary" href="/app?state=${app}">Start ${stateName} packet</a> · <a href="/blog#locale-${app}">More ${stateName} guides</a></p>`;
}

export function painBody({ stateName, app, days, cite, headline, problem, bullets, fix }) {
  const list = bullets.map((b) => `<li>${b}</li>`).join("\n        ");
  return `
      <p class="hero-eyebrow">${stateName} · operator pain</p>
      <h1>${headline}</h1>
      <p class="pain-solution-lead"><span class="ps-problem">${problem}</span></p>
      <dl class="fact-strip">
        <div><dt>Wizard default</dt><dd><strong>${days} days</strong> from surrender (Deposit Desk)</dd></div>
        <div><dt>Label</dt><dd>${citeLinkHtml(cite, app)}</dd></div>
      </dl>
      <h2>What goes wrong</h2>
      <ul>
        ${list}
      </ul>
      <p class="ps-fix"><strong>Fix:</strong> ${fix}</p>
      ${cta(stateName, app)}`;
}

export function itemizationBody({ stateName, cite, days, app, localNote = "" }) {
  return `
      <p class="hero-eyebrow">${stateName} · deposit desk</p>
      <h1>${stateName} deposit itemization</h1>
      <p>When you withhold any part of a security deposit, operators typically owe a <strong>written itemization</strong> that matches amounts returned or kept. Deposit Desk step 4 is built for line items that roll into your print packet.</p>
      <dl class="fact-strip">
        <div><dt>Return window</dt><dd><strong>${days} days</strong> (Deposit Desk default from surrender)</dd></div>
        <div><dt>Citation</dt><dd>${citeLinkHtml(cite, app)}</dd></div>
      </dl>
      ${localNote}
      ${cta(stateName, app)}`;
}

export function checklistBody({ stateName, cite, days, app, localNote = "" }) {
  return `
      <p class="hero-eyebrow">${stateName} · operators</p>
      <h1>${stateName} security deposit checklist</h1>
      <p>Move-in through move-out checklist for ${days}-day math and itemization discipline.</p>
      <h2>Move-out</h2>
      <ul>
        <li>Record surrender date · start clock in Deposit Desk.</li>
        <li>Itemize withholds · mail or deliver remainder with proof.</li>
      </ul>
      <p class="field-hint">${citeLinkHtml(cite, app)}</p>
      ${localNote}
      ${cta(stateName, app)}`;
}

export function deadlineBody({ stateName, cite, days, app, localNote = "" }) {
  return `
      <p class="hero-eyebrow">${stateName} · deposit clock</p>
      <h1>${stateName} ${days}-day deposit return window</h1>
      <p>Deposit Desk starts the clock on <strong>surrender</strong> (keys back, unit vacant), not the lease end date on paper alone.</p>
      <dl class="fact-strip">
        <div><dt>${stateName}</dt><dd><strong>${days} days</strong> after surrender (wizard default)</dd></div>
        <div><dt>Citation</dt><dd>${citeLinkHtml(cite, app)}</dd></div>
      </dl>
      ${localNote}
      ${cta(stateName, app)}`;
}
