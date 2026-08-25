(function () {
  "use strict";

  // Une fonction par page thématique. Chaque fonction reçoit les observations
  // déjà filtrées et renvoie simplement le HTML à afficher.
  const DATA = window.OBSERVATORY_DATA;
  const U = window.DataUtils;
  const C = window.Charts;
  const UI = window.DashboardUI;
  const T = (key, parameters) => window.I18n.t(key, parameters);

  function renderOverview(records, state) {
    const countries = new Set(records.map((record) => record.country).filter(Boolean));
    const knownStages = records.filter((record) => record.stage_group !== "Non renseigné");
    const operational = knownStages.filter((record) => record.stage_group === "Opérationnelle").length;
    const coordinateCount = records.filter((record) => record.has_valid_coordinates).length;
    const averageQuality = Math.round(U.average(records.map((record) => record.quality_score)));
    const stages = UI.stageDistribution(records);
    const countriesTop = U.countBy(records, "country").slice(0, 10);
    const sources = U.countBy(records, "data_source");
    const distinctStageCount = new Set(records.map((record) => record.development_stage).filter(Boolean)).size;
    const qualityFieldCount = DATA.meta.quality_field_count || DATA.meta.quality_fields.length;
    const unnamedCount = DATA.meta.record_count - DATA.meta.named_record_count;
    const topCountry = countriesTop[0];

    return `${UI.pageHeading(T("overview.kicker"), T("overview.title"), records)}
      ${state.namedOnly ? UI.notice(T("overview.defaultNotice", { named: DATA.meta.named_record_count, excluded: unnamedCount }), "info") : ""}
      <div class="kpi-grid">
        ${UI.kpi(T("overview.solutions"), U.formatInteger(records.length), T("overview.sourceTotal", { count: U.formatInteger(DATA.meta.record_count) }), "▣", "#17375e")}
        ${UI.kpi(T("overview.countries"), U.formatInteger(countries.size), topCountry ? T("overview.topCountry", { country: topCountry.label, count: topCountry.value }) : T("overview.noCountry"), "◎", "#168aad")}
        ${UI.kpi(T("overview.operational"), U.formatPercent(operational, knownStages.length), T("overview.knownStatuses", { value: operational, total: knownStages.length }), "✓", "#55a630")}
        ${UI.kpi(T("overview.completeness"), `${averageQuality} %`, T("overview.structuredFields", { count: qualityFieldCount }), "◔", "#e95d2a")}
      </div>
      <div class="dashboard-grid">
        ${UI.card(T("overview.deployment"), T("overview.deploymentSub", { count: distinctStageCount }), C.donut(stages, { centerLabel: T("common.statuses") }), "wide")}
        ${UI.card(T("overview.decision"), T("overview.decisionSub"), `<div class="insight-list">
          <div class="insight" style="--accent:#55a630"><strong>${T("overview.statusInsight", { percent: U.formatPercent(operational, knownStages.length) })}</strong><span>${T("overview.statusInsightSub")}</span></div>
          <div class="insight" style="--accent:#168aad"><strong>${T("overview.mapInsight", { count: U.formatInteger(coordinateCount) })}</strong><span>${T("overview.mapInsightSub")}</span></div>
          <div class="insight" style="--accent:#e95d2a"><strong>${T("overview.duplicateInsight", { count: U.formatInteger(records.filter((record) => record.potential_duplicate).length) })}</strong><span>${T("overview.duplicateInsightSub")}</span></div>
        </div>`, "narrow")}
        ${UI.card(T("overview.topCountries"), T("overview.countryCount"), C.horizontalBars(countriesTop, { limit: 10, showShare: true, total: records.length }), "wide")}
        ${UI.card(T("overview.origins"), T("overview.originsSub"), C.horizontalBars(sources, { limit: 6, color: "#168aad", showShare: true, total: records.length }), "narrow")}
      </div>`;
  }

  function renderGeography(records) {
    const positioned = records.filter((record) => record.has_valid_coordinates);
    const missing = records.length - positioned.length;
    const classifications = U.countBy(records, "territory_classification", { emptyLabel: T("common.missing") }).slice(0, 10);
    const countries = U.countBy(records, "country");
    const euKnown = records.filter((record) => record.in_eu !== null);
    const eu = [
      { label: T("geo.euYes"), value: euKnown.filter((record) => record.in_eu).length, color: "#17375e" },
      { label: T("geo.euNo"), value: euKnown.filter((record) => !record.in_eu).length, color: "#e95d2a" },
      { label: T("common.missing"), value: records.length - euKnown.length, color: "#aeb9c4" }
    ];

    return `${UI.pageHeading(T("geo.kicker"), T("geo.title"), records)}
      ${UI.notice(T("geo.missingNotice", { count: U.formatInteger(missing) }), missing ? "warning" : "info")}
      <div class="dashboard-grid">
        ${UI.card(T("geo.knownLocations"), T("geo.mapSub"), C.worldMap(records), "full")}
        ${UI.card(T("geo.byCountry"), T("geo.byCountrySub"), C.horizontalBars(countries, { limit: 15, showShare: true, total: records.length }), "wide")}
        ${UI.card(T("geo.eu"), T("geo.euMissing", { count: records.length - euKnown.length }), C.donut(eu, { centerLabel: T("common.observation.many") }), "narrow")}
        ${UI.card(T("geo.territories"), T("geo.territoriesSub"), C.horizontalBars(classifications, { limit: 10, color: "#55a630" }), "full")}
      </div>`;
  }

  function renderMaturity(records) {
    const maturityKnown = records.filter((record) => record.maturity_level);
    const validDuet = maturityKnown.filter((record) => /_(Predictive|Experimental) Twins/i.test(record.maturity_level));
    const twinKnown = records.filter((record) => record.twin_type);
    const missingLabel = T("common.missing");
    const stages = UI.stageDistribution(records);
    const maturity = U.countBy(records, "maturity_level", { emptyLabel: missingLabel })
      .map((item) => item.label === missingLabel ? { ...item, color: "#aeb9c4" } : item);
    const twinTypes = U.countBy(records, "twin_type", { emptyLabel: missingLabel })
      .map((item) => item.label === missingLabel ? { ...item, color: "#aeb9c4" } : item);
    const statusKnown = records.filter((record) => record.development_stage).length;

    return `${UI.pageHeading(T("maturity.kicker"), T("maturity.title"), records)}
      ${UI.notice(T("maturity.notice", { maturity: maturityKnown.length, duet: validDuet.length, twin: twinKnown.length }), "warning")}
      <div class="kpi-grid">
        ${UI.kpi(T("maturity.statusKnown"), U.formatPercent(statusKnown, records.length), `${statusKnown} / ${records.length} ${T("common.observation.many")}`, "✓", "#55a630")}
        ${UI.kpi(T("maturity.levelKnown"), U.formatPercent(maturityKnown.length, records.length), T("maturity.missingValues", { count: records.length - maturityKnown.length }), "◔", "#e95d2a")}
        ${UI.kpi(T("maturity.duet"), U.formatInteger(validDuet.length), T("maturity.duetSub"), "D", "#168aad")}
        ${UI.kpi(T("maturity.twinKnown"), U.formatInteger(twinKnown.length), T("maturity.missingValues", { count: records.length - twinKnown.length }), "T", "#f2c230")}
      </div>
      <div class="dashboard-grid">
        ${UI.card(T("maturity.grouped"), T("maturity.groupedSub"), C.donut(stages, { centerLabel: T("common.observation.many") }), "full")}
        ${UI.card(T("maturity.levels"), T("maturity.levelsSub"), C.horizontalBars(maturity, { limit: 10, color: "#e95d2a" }), "wide")}
        ${UI.card(T("maturity.twins"), T("maturity.twinsSub"), C.horizontalBars(twinTypes, { limit: 8, color: "#168aad" }), "narrow")}
      </div>`;
  }

  function renderEcosystem(records) {
    const technologyCounts = U.countBy(records, (record) =>
      record.technology_items.filter((item) => !/^\d{4}$/.test(item) && U.normalize(item) !== "not specified"),
    { multiple: true });
    const userCounts = U.countBy(records, (record) =>
      record.user_items.filter((item) => !/^fiware4cities/i.test(item)),
    { multiple: true });
    const providerCounts = U.countBy(records, "provider_items", { multiple: true });
    const technologies = UI.addMissingCategory(technologyCounts, records, "technologies");
    const users = UI.addMissingCategory(userCounts, records, "user_types");
    const providers = UI.addMissingCategory(providerCounts, records, "providers");
    const domains = U.countBy(records, "domain_items", { multiple: true });
    const domainKnown = records.filter((record) => record.domain_items.length).length;
    const domainAvailability = [
      { label: T("common.informed"), value: domainKnown, color: "#55a630" },
      { label: T("common.missing"), value: records.length - domainKnown, color: "#aeb9c4" }
    ];

    return `${UI.pageHeading(T("eco.kicker"), T("eco.title"), records)}
      ${UI.notice(T("eco.notice", { count: domainKnown }), "warning")}
      <div class="dashboard-grid">
        ${UI.card(T("eco.technologies"), T("eco.technologiesSub"), C.horizontalBars(technologies, { limit: 15, color: "#168aad" }), "wide")}
        ${UI.card(T("eco.findings"), T("eco.findingsSub"), `<div class="insight-list">
          <div class="insight" style="--accent:#168aad"><strong>${T("eco.techCount", { count: technologyCounts.length })}</strong><span>${T("eco.techCountSub")}</span></div>
          <div class="insight" style="--accent:#55a630"><strong>${T("eco.userCount", { count: userCounts.length })}</strong><span>${T("eco.userCountSub")}</span></div>
          <div class="insight" style="--accent:#e95d2a"><strong>${T("eco.providerCount", { count: providerCounts.length })}</strong><span>${T("eco.providerCountSub")}</span></div>
        </div>`, "narrow")}
        ${UI.card(T("eco.users"), T("eco.usersSub"), C.horizontalBars(users, { limit: 15, color: "#55a630" }), "wide")}
        ${UI.card(T("eco.providers"), T("eco.providersSub"), C.horizontalBars(providers, { limit: 12, color: "#e95d2a" }), "narrow")}
        ${UI.card(T("eco.domains"), T("eco.domainsSub"), `<div class="domain-analysis">
          <section><h4>${T("eco.availability")}</h4>${C.donut(domainAvailability, { centerLabel: T("common.observation.many") })}</section>
          <section><h4>${T("eco.domainRanking")}</h4>${domains.length ? C.horizontalBars(domains, { limit: 18, color: "#168aad" }) : C.emptyState(T("eco.domainEmpty"))}</section>
        </div>`, "full")}
      </div>`;
  }

  function renderCatalog(records, state) {
    const pageSize = 20;
    const language = window.I18n.getLanguage();
    const sorted = [...records].sort((first, second) =>
      (first.solution_name || first.geographic_scope || "").localeCompare(second.solution_name || second.geographic_scope || "", language)
    );
    const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
    state.catalogPage = Math.min(state.catalogPage, pageCount);
    const start = (state.catalogPage - 1) * pageSize;
    const pageRows = sorted.slice(start, start + pageSize);

    const table = pageRows.length ? `<div class="data-table-wrapper"><table class="data-table">
      <thead><tr><th>${T("catalog.solution")}</th><th>${T("catalog.location")}</th><th>${T("catalog.status")}</th><th>${T("catalog.provider")}</th><th>${T("catalog.quality")}</th><th>${T("catalog.sheet")}</th></tr></thead>
      <tbody>${pageRows.map((record) => {
        const quality = U.qualityBand(record.quality_score);
        return `<tr>
          <td><strong>${U.escapeHtml(record.solution_name || T("catalog.unnamed"))}</strong>${record.potential_duplicate ? `<br><small class="missing">${T("catalog.duplicate", { count: record.duplicate_group_size })}</small>` : ""}</td>
          <td>${U.escapeHtml(record.country || T("common.missing"))}${record.geographic_scope ? `<br><small>${U.escapeHtml(record.geographic_scope)}</small>` : ""}</td>
          <td><span class="status-pill ${UI.statusClass(record.stage_group)}">${U.escapeHtml(UI.stageLabel(record.stage_group))}</span></td>
          <td>${record.providers ? U.escapeHtml(U.truncate(record.providers, 58)) : `<span class="missing">${T("common.missing")}</span>`}</td>
          <td><span class="quality-pill ${quality.className}">${record.quality_score} %</span></td>
          <td><button class="row-button" type="button" data-record-id="${U.escapeHtml(record.record_id)}">${T("common.view")}</button></td>
        </tr>`;
      }).join("")}</tbody></table></div>
      <div class="pagination"><span>${U.formatInteger(start + 1)}–${U.formatInteger(Math.min(start + pageSize, sorted.length))} / ${U.formatInteger(sorted.length)}</span><div><button type="button" data-catalog-page="prev" ${state.catalogPage === 1 ? "disabled" : ""}>${T("common.previous")}</button><button type="button" data-catalog-page="next" ${state.catalogPage === pageCount ? "disabled" : ""}>${T("common.next")}</button></div></div>`
      : C.emptyState(T("catalog.empty"));

    return `${UI.pageHeading(T("catalog.kicker"), T("catalog.title"), records)}
      ${UI.card(T("catalog.solutions"), T("catalog.sub", { count: DATA.meta.quality_field_count || DATA.meta.quality_fields.length }), table, "full")}`;
  }

  function renderQuality(records) {
    const qualityFieldCount = DATA.meta.quality_field_count || DATA.meta.quality_fields.length;
    const qualityFields = DATA.meta.quality_fields.map((field) => U.completeness(records, field));
    const sourceColors = ["#168aad", "#e95d2a", "#55a630"];
    const sources = U.uniqueValues(records, "data_source").map((source, index) => {
      const sourceRecords = records.filter((record) => record.data_source === source);
      return {
        source,
        records: sourceRecords,
        average: Math.round(U.average(sourceRecords.map((record) => record.quality_score))),
        color: sourceColors[index % sourceColors.length]
      };
    });
    const duplicateGroups = U.countBy(records.filter((record) => record.potential_duplicate), "solution_name")
      .filter((item) => item.value > 1);
    const invalidCoordinates = records.filter((record) =>
      (record.latitude_raw || record.longitude_raw) && !record.has_valid_coordinates
    ).length;
    const lowQuality = records.filter((record) => record.quality_score < 50).length;

    return `${UI.pageHeading(T("quality.kicker"), T("quality.title"), records)}
      ${UI.notice(T("quality.notice", { count: qualityFieldCount }), "danger")}
      <div class="kpi-grid">
        ${UI.kpi(T("quality.average"), `${Math.round(U.average(records.map((record) => record.quality_score)))} %`, T("overview.structuredFields", { count: qualityFieldCount }), "◔", "#168aad")}
        ${UI.kpi(T("quality.low"), U.formatInteger(lowQuality), T("quality.lowSub"), "!", "#e95d2a")}
        ${UI.kpi(T("quality.duplicates"), U.formatInteger(duplicateGroups.length), T("quality.duplicatesSub"), "≈", "#f2c230")}
        ${UI.kpi(T("quality.invalidCoords"), U.formatInteger(invalidCoordinates), T("quality.invalidCoordsSub"), "◎", "#c53b38")}
      </div>
      <div class="dashboard-grid">
        ${UI.card(T("quality.byField"), T("quality.byFieldSub"), C.completionRows(qualityFields), "wide")}
        ${UI.card(T("quality.bySource"), T("quality.bySourceSub"), `<div class="source-quality">${sources.map((source) => `<article class="source-card" style="--accent:${source.color}"><strong>${U.escapeHtml(source.source)}</strong><span>${source.average} %</span><small>${T("quality.shown", { count: source.records.length })}</small></article>`).join("")}</div>`, "narrow")}
        ${UI.card(T("quality.importDiagnostics"), T("quality.importDiagnosticsSub"), `<div class="insight-list">
          <div class="insight" style="--accent:#168aad"><strong>${T("quality.physicalRows", { count: U.formatInteger(DATA.meta.physical_data_rows) })}</strong><span>${T("quality.physicalRowsSub")}</span></div>
          <div class="insight" style="--accent:#f2c230"><strong>${T("quality.emptyRowsCalculated", { count: U.formatInteger(DATA.meta.empty_physical_rows) })}</strong><span>${T("quality.emptyRowsCalculatedSub")}</span></div>
          <div class="insight" style="--accent:#e95d2a"><strong>${T("quality.excludedRows", { count: U.formatInteger(DATA.meta.excluded_non_observation_rows) })}</strong><span>${T("quality.excludedRowsSub")}</span></div>
          <div class="insight" style="--accent:#55a630"><strong>${T("quality.stageLabels", { count: U.formatInteger(DATA.meta.distinct_development_stage_count) })}</strong><span>${T("quality.stageLabelsSub")}</span></div>
        </div>`, "wide")}
        ${UI.card(T("quality.exactDuplicates"), T("quality.exactDuplicatesSub"), duplicateGroups.length ? C.horizontalBars(duplicateGroups, { limit: 15, color: "#e95d2a" }) : C.emptyState(T("quality.noDuplicates")), "narrow")}
      </div>`;
  }

  window.DashboardPages = {
    overview: renderOverview,
    geography: renderGeography,
    maturity: renderMaturity,
    ecosystem: renderEcosystem,
    catalog: renderCatalog,
    quality: renderQuality
  };
})();
