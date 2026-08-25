(function () {
  "use strict";

  // Fonctions sans effet de bord : texte, comptages, pourcentages et qualité.
  // Elles peuvent être utilisées par toutes les pages sans connaître l'interface.

  const FIELD_LABEL_KEYS = {
    solution_name: "field.solutionName", development_stage: "field.developmentStage",
    country: "field.country", geographic_scope: "field.geographicScope",
    territory_classification: "field.territoryClassification", providers: "field.providers",
    project_reference: "field.projectReference", technologies: "field.technologies",
    user_types: "field.userTypes", funding_sources: "field.fundingSources",
    maturity_level: "field.maturityLevel", use_case_domains: "field.useCaseDomains",
    standards: "field.standards", targets: "field.targets",
    creation_date_raw: "field.creationDate", twin_type: "field.twinType",
    data_models_publication: "field.dataModelsPublication", data_publication: "field.dataPublication"
  };

  function fieldLabel(field) {
    return window.I18n.t(FIELD_LABEL_KEYS[field] || field);
  }

  function locale() {
    return window.I18n.getLanguage() === "en" ? "en-GB" : "fr-FR";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr");
  }

  function countBy(records, accessor, options = {}) {
    const counts = new Map();
    records.forEach((record) => {
      const rawValue = typeof accessor === "function" ? accessor(record) : record[accessor];
      const values = options.multiple ? (rawValue || []) : [rawValue];
      values.forEach((value) => {
        const label = value || options.emptyLabel;
        if (!label) return;
        counts.set(label, (counts.get(label) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value || String(a.label).localeCompare(String(b.label), "fr"));
  }

  function uniqueValues(records, field) {
    return [...new Set(records.map((record) => record[field]).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "fr"));
  }

  function formatInteger(value) {
    return new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(value || 0);
  }

  function formatPercent(numerator, denominator, digits = 0) {
    if (!denominator) return "—";
    return `${new Intl.NumberFormat(locale(), {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits
    }).format((100 * numerator) / denominator)} %`;
  }

  function average(values) {
    const usable = values.filter((value) => Number.isFinite(value));
    return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : 0;
  }

  function truncate(value, length = 70) {
    if (!value) return "";
    return value.length > length ? `${value.slice(0, length - 1)}…` : value;
  }

  function completeness(records, field) {
    const count = records.filter((record) => {
      const value = record[field];
      return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== "";
    }).length;
    return { label: fieldLabel(field), value: count, total: records.length };
  }

  function qualityBand(score) {
    if (score >= 75) return { label: window.I18n.t("qualityBand.good"), className: "quality-good" };
    if (score >= 50) return { label: window.I18n.t("qualityBand.medium"), className: "quality-medium" };
    return { label: window.I18n.t("qualityBand.low"), className: "quality-low" };
  }

  window.DataUtils = {
    average,
    completeness,
    countBy,
    escapeHtml,
    formatInteger,
    formatPercent,
    fieldLabel,
    normalize,
    qualityBand,
    truncate,
    uniqueValues
  };
})();
