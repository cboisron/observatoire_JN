(function () {
  "use strict";

  // Point d'entrée de l'application.
  // Ce fichier gère uniquement l'état, les filtres, la navigation et les événements.
  const DATA = window.OBSERVATORY_DATA;
  const U = window.DataUtils;
  const UI = window.DashboardUI;
  const Pages = window.DashboardPages;
  const Form = window.DashboardForm;
  const Interactions = window.RecordInteractions;
  const T = (key, parameters) => window.I18n.t(key, parameters);

  if (!DATA || !Array.isArray(DATA.records)) {
    document.body.innerHTML = `<p>${T("common.noData")}</p>`;
    return;
  }

  const NAVIGATION = [
    { id: "overview", label: "nav.overview", icon: "◈" },
    { id: "geography", label: "nav.geography", icon: "◎" },
    { id: "maturity", label: "nav.maturity", icon: "◔" },
    { id: "ecosystem", label: "nav.ecosystem", icon: "✦" },
    { id: "catalog", label: "nav.catalog", icon: "☷" },
    { id: "quality", label: "nav.quality", icon: "!" },
    { id: "submit", label: "nav.submit", icon: "+" }
  ];

  const requestedPage = window.location.hash.slice(1);
  const initialPage = NAVIGATION.some((item) => item.id === requestedPage)
    ? requestedPage
    : "overview";

  // Toutes les valeurs qui peuvent changer pendant l'utilisation sont regroupées ici.
  const state = {
    page: initialPage,
    search: "",
    source: "",
    country: "",
    stage: "",
    namedOnly: true,
    catalogPage: 1,
    formDraft: {},
    submissionResult: null,
    submissionApi: {
      checked: false,
      available: false,
      count: 0,
      file: "saisies_jumeaux_numeriques.xlsx"
    }
  };

  // Les éléments HTML utilisés plusieurs fois sont recherchés une seule fois.
  const elements = {
    navigation: document.querySelector("#main-navigation"),
    content: document.querySelector("#page-content"),
    resultCount: document.querySelector("#filter-result-count"),
    search: document.querySelector("#filter-search"),
    source: document.querySelector("#filter-source"),
    country: document.querySelector("#filter-country"),
    stage: document.querySelector("#filter-stage"),
    named: document.querySelector("#filter-named"),
    reset: document.querySelector("#reset-filters"),
    dialog: document.querySelector("#detail-dialog"),
    detail: document.querySelector("#detail-content"),
    mobileMenu: document.querySelector(".mobile-menu-button"),
    sidebar: document.querySelector(".sidebar"),
    filterPanel: document.querySelector(".filter-panel")
  };

  function initialize() {
    applyStaticTranslations();
    renderNavigation();
    renderFilterOptions();
    bindEvents();
    render();
    Form.checkApi(state, render);
  }

  function applyStaticTranslations() {
    document.documentElement.lang = window.I18n.getLanguage();
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = T(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      element.setAttribute("aria-label", T(element.dataset.i18nAria));
    });
    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
      element.setAttribute("content", T(element.dataset.i18nContent));
    });
    document.title = T("meta.title");
    elements.search.placeholder = T("filter.searchPlaceholder");

    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === window.I18n.getLanguage();
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const locale = window.I18n.getLanguage() === "en" ? "en-GB" : "fr-FR";
    const date = new Date(`${DATA.meta.generated_at}T12:00:00`).toLocaleDateString(locale);
    document.querySelector("#data-date").textContent = T("footer.generated", { date });
  }

  function renderNavigation() {
    const buttons = NAVIGATION.map((item) => `
      <button class="nav-button${item.id === state.page ? " active" : ""}" data-page="${item.id}" type="button">
        <span class="nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${U.escapeHtml(T(item.label))}</span>
      </button>`).join("");
    elements.navigation.innerHTML = `<div class="nav-label">${U.escapeHtml(T("nav.explore"))}</div>${buttons}`;
  }

  function renderFilterOptions() {
    elements.source.innerHTML = UI.optionList(U.uniqueValues(DATA.records, "data_source"), T("filter.allSources"));
    elements.country.innerHTML = UI.optionList(U.uniqueValues(DATA.records, "country"), T("filter.allCountries"));
    elements.stage.innerHTML = UI.optionList(
      ["Opérationnelle", "En développement", "Stratégie / initiative", "Autre", "Non renseigné"],
      T("filter.allStages"),
      UI.stageLabel
    );
    elements.source.value = state.source;
    elements.country.value = state.country;
    elements.stage.value = state.stage;
  }

  function bindEvents() {
    elements.navigation.addEventListener("click", handleNavigationClick);
    document.querySelector(".language-switch").addEventListener("click", handleLanguageClick);
    window.addEventListener("languagechange", handleLanguageChange);

    elements.search.addEventListener("input", () => updateFilter("search", elements.search.value));
    elements.source.addEventListener("change", () => updateFilter("source", elements.source.value));
    elements.country.addEventListener("change", () => updateFilter("country", elements.country.value));
    elements.stage.addEventListener("change", () => updateFilter("stage", elements.stage.value));
    elements.named.addEventListener("change", () => updateFilter("namedOnly", elements.named.checked));
    elements.reset.addEventListener("click", resetFilters);
    elements.mobileMenu.addEventListener("click", toggleMobileMenu);

    elements.content.addEventListener("click", handleContentClick);
    elements.content.addEventListener("input", (event) => Form.handleInput(event, state));
    elements.content.addEventListener("submit", (event) => Form.submit(event, state, render));
    elements.content.addEventListener("reset", handleFormReset);
    elements.content.addEventListener("keydown", handleContentKeydown);

    elements.dialog.querySelector(".dialog-close").addEventListener("click", closeDialog);
    elements.dialog.addEventListener("click", (event) => {
      if (event.target === elements.dialog) closeDialog();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.dialog.hidden) closeDialog();
    });
  }

  function handleNavigationClick(event) {
    const button = event.target.closest("[data-page]");
    if (!button) return;
    state.page = button.dataset.page;
    state.catalogPage = 1;
    window.history.replaceState(null, "", `#${state.page}`);
    elements.sidebar.classList.remove("open");
    elements.mobileMenu.setAttribute("aria-expanded", "false");
    renderNavigation();
    render();
    document.querySelector("#main-content").focus({ preventScroll: true });
  }

  function handleLanguageClick(event) {
    const button = event.target.closest("[data-language]");
    if (button) window.I18n.setLanguage(button.dataset.language);
  }

  function handleLanguageChange() {
    applyStaticTranslations();
    renderNavigation();
    renderFilterOptions();
    render();
  }

  function updateFilter(name, value) {
    state[name] = value;
    state.catalogPage = 1;
    render();
  }

  function resetFilters() {
    Object.assign(state, {
      search: "",
      source: "",
      country: "",
      stage: "",
      namedOnly: true,
      catalogPage: 1
    });
    elements.search.value = "";
    elements.source.value = "";
    elements.country.value = "";
    elements.stage.value = "";
    elements.named.checked = true;
    render();
  }

  function toggleMobileMenu() {
    const open = elements.sidebar.classList.toggle("open");
    elements.mobileMenu.setAttribute("aria-expanded", String(open));
  }

  function filteredRecords() {
    const query = U.normalize(state.search);
    return DATA.records.filter((record) => {
      if (state.namedOnly && !record.named) return false;
      if (state.source && record.data_source !== state.source) return false;
      if (state.country && record.country !== state.country) return false;
      if (state.stage && record.stage_group !== state.stage) return false;
      if (!query) return true;

      const searchableText = [
        record.solution_name,
        record.country,
        record.geographic_scope,
        record.providers,
        record.technologies,
        record.user_types,
        record.targets
      ].map(U.normalize).join(" ");
      return searchableText.includes(query);
    });
  }

  function render() {
    const records = filteredRecords();
    elements.filterPanel.hidden = state.page === "submit";
    elements.resultCount.textContent = T(
      records.length === 1 ? "filter.result.one" : "filter.result.many",
      { count: U.formatInteger(records.length) }
    );

    elements.content.innerHTML = state.page === "submit"
      ? Form.render(state)
      : Pages[state.page](records, state);
    requestAnimationFrame(Interactions.setupMapInteractions);
  }

  function handleContentClick(event) {
    const clusterClose = event.target.closest("[data-close-map-cluster]");
    if (clusterClose) {
      const panel = clusterClose.closest(".map-cluster-panel");
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }

    const mapAction = event.target.closest("[data-map-action]");
    if (mapAction) {
      Interactions.updateMapView(mapAction.closest(".world-map"), mapAction.dataset.mapAction);
      return;
    }

    const cluster = event.target.closest("[data-map-cluster]");
    if (cluster) {
      Interactions.openMapCluster(cluster);
      return;
    }

    const countryShape = event.target.closest("[data-map-country]");
    if (countryShape) {
      state.country = countryShape.dataset.mapCountry;
      elements.country.value = state.country;
      state.catalogPage = 1;
      render();
      return;
    }

    const detailButton = event.target.closest("[data-record-id]");
    if (detailButton) {
      const record = DATA.records.find((item) => item.record_id === detailButton.dataset.recordId);
      if (record) Interactions.openDetail(record, elements);
      return;
    }

    const pager = event.target.closest("[data-catalog-page]");
    if (pager && !pager.disabled) {
      state.catalogPage += pager.dataset.catalogPage === "next" ? 1 : -1;
      render();
    }
  }

  function handleFormReset(event) {
    if (event.target.id !== "digital-twin-form") return;
    state.formDraft = {};
    state.submissionResult = null;
    requestAnimationFrame(render);
  }

  function handleContentKeydown(event) {
    const interactive = event.target.matches("[data-record-id], [data-map-country], [data-map-cluster]");
    if (interactive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      event.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  }

  function closeDialog() {
    Interactions.closeDialog(elements.dialog);
  }

  initialize();
})();
