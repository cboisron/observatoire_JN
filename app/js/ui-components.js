(function () {
  "use strict";

  // Petits composants HTML partagés par toutes les pages du dashboard.
  // Ce fichier ne gère ni les données ni les événements utilisateur.
  const U = window.DataUtils;
  const T = (key, parameters) => window.I18n.t(key, parameters);

  const STAGE_TRANSLATIONS = {
    "Opérationnelle": "stage.operational",
    "En développement": "stage.development",
    "Stratégie / initiative": "stage.strategy",
    "Autre": "stage.other",
    "Non renseigné": "common.missing"
  };

  function stageLabel(stage) {
    return T(STAGE_TRANSLATIONS[stage] || stage);
  }

  function statusClass(stage) {
    if (stage === "Opérationnelle") return "status-operational";
    if (stage === "En développement") return "status-development";
    return "status-other";
  }

  function optionList(values, allLabel, labeler = (value) => value) {
    const options = values.map((value) =>
      `<option value="${U.escapeHtml(value)}">${U.escapeHtml(labeler(value))}</option>`
    ).join("");
    return `<option value="">${U.escapeHtml(allLabel)}</option>${options}`;
  }

  function pageHeading(kicker, title, records = null) {
    const scope = records
      ? `<span class="data-scope">${T("page.scope", { count: `<strong>${U.formatInteger(records.length)}</strong>` })}</span>`
      : "";
    return `<header class="page-heading">
      <div><span class="eyebrow">${U.escapeHtml(kicker)}</span><h2>${U.escapeHtml(title)}</h2></div>
      ${scope}
    </header>`;
  }

  function kpi(label, value, detail, icon, color) {
    return `<article class="kpi-card" style="--accent:${color}">
      <span class="kpi-icon" aria-hidden="true">${icon}</span><small>${U.escapeHtml(label)}</small>
      <strong>${U.escapeHtml(value)}</strong><p>${U.escapeHtml(detail)}</p>
    </article>`;
  }

  function card(title, subtitle, content, className = "") {
    const explanation = subtitle ? `<p>${U.escapeHtml(subtitle)}</p>` : "";
    return `<section class="card ${className}">
      <header class="card-header"><div><h3>${U.escapeHtml(title)}</h3>${explanation}</div></header>
      ${content}
    </section>`;
  }

  function notice(text, kind = "warning") {
    const icon = kind === "info" ? "i" : "!";
    return `<div class="notice ${kind}"><span class="notice-icon" aria-hidden="true">${icon}</span><div>${text}</div></div>`;
  }

  function stageDistribution(records) {
    const counts = new Map(U.countBy(records, "stage_group").map((item) => [item.label, item.value]));
    return [
      { label: T("stage.operational"), value: counts.get("Opérationnelle") || 0, color: "#17375e" },
      { label: T("stage.development"), value: counts.get("En développement") || 0, color: "#e95d2a" },
      { label: T("stage.strategy"), value: counts.get("Stratégie / initiative") || 0, color: "#55a630" },
      { label: T("stage.other"), value: counts.get("Autre") || 0, color: "#168aad" },
      { label: T("common.missing"), value: counts.get("Non renseigné") || 0, color: "#aeb9c4" }
    ];
  }

  function addMissingCategory(items, records, field) {
    const missing = records.filter((record) => {
      const value = record[field];
      return Array.isArray(value) ? value.length === 0 : !value;
    }).length;
    return [{ label: T("common.missing"), value: missing, color: "#aeb9c4" }, ...items];
  }

  window.DashboardUI = {
    addMissingCategory,
    card,
    kpi,
    notice,
    optionList,
    pageHeading,
    stageDistribution,
    stageLabel,
    statusClass
  };
})();
