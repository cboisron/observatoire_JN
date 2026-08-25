(function () {
  "use strict";

  // Configuration et fonctionnement du formulaire de contribution.
  // Pour ajouter ou retirer une question, modifier uniquement FORM_SECTIONS.
  const DATA = window.OBSERVATORY_DATA;
  const U = window.DataUtils;
  const UI = window.DashboardUI;
  const T = (key, parameters) => window.I18n.t(key, parameters);

  const FORM_SECTIONS = [
    {
      key: "project",
      fields: [
        { name: "solution_name", type: "text", required: true },
        { name: "development_stage", type: "single", list: "development_stages" },
        { name: "twin_type", type: "single", list: "twin_types" }
      ]
    },
    {
      key: "territory",
      fields: [
        { name: "country", type: "single", list: "countries" },
        { name: "geographic_scope", type: "text" },
        { name: "territory_classification", type: "single", list: "territory_classifications" },
        { name: "in_eu_raw", type: "single", list: "in_eu" }
      ]
    },
    {
      key: "ecosystem",
      fields: [
        { name: "providers", type: "multiple", list: "providers" },
        { name: "technologies", type: "multiple", list: "technologies" },
        { name: "user_types", type: "multiple", list: "user_types" }
      ]
    },
    {
      key: "uses",
      fields: [
        { name: "use_case_domains", type: "multiple", list: "use_case_domains" },
        { name: "funding_sources", type: "multiple", list: "funding_sources" }
      ]
    }
  ];

  const FIELD_TRANSLATIONS = {
    solution_name: "field.formSolutionName",
    development_stage: "field.formDevelopmentStage",
    twin_type: "field.formTwinType",
    country: "field.formCountry",
    geographic_scope: "field.formGeographicScope",
    territory_classification: "field.formTerritoryClassification",
    in_eu_raw: "field.formInEu",
    providers: "field.formProviders",
    technologies: "field.formTechnologies",
    user_types: "field.formUserTypes",
    use_case_domains: "field.formUseCaseDomains",
    funding_sources: "field.formFundingSources"
  };

  function allFields() {
    return FORM_SECTIONS.flatMap((section) => section.fields);
  }

  function fieldLabel(fieldName) {
    return T(FIELD_TRANSLATIONS[fieldName] || fieldName);
  }

  function serializeMultiple(values) {
    return values.map((value) => {
      const escaped = value.replaceAll('"', '""');
      return /[",\n]/.test(value) ? `"${escaped}"` : escaped;
    }).join(", ");
  }

  function formControl(field, draft) {
    const { name, type, required = false, list } = field;
    const value = draft[name] || (type === "multiple" ? [] : "");
    const label = `${U.escapeHtml(fieldLabel(name))}${required ? ` <span class="required-mark" title="${U.escapeHtml(T("form.required"))}">*</span>` : ""}`;
    const controlId = `form-field-${name}`;
    const labelId = `form-label-${name}`;
    const commonAttributes = `id="${controlId}" name="${name}" ${required ? "required" : ""}`;
    const choices = list ? DATA.reference_lists[list] || [] : [];
    let control;

    if (type === "textarea") {
      control = `<textarea ${commonAttributes} rows="3">${U.escapeHtml(value)}</textarea>`;
    } else if (type === "single") {
      const options = choices.map((choice) => {
        const displayedChoice = list === "in_eu" ? T(choice === "Yes" ? "form.yes" : "form.no") : choice;
        return `<option value="${U.escapeHtml(choice)}" ${value === choice ? "selected" : ""}>${U.escapeHtml(displayedChoice)}</option>`;
      }).join("");
      control = `<select ${commonAttributes}><option value="">${U.escapeHtml(T("form.choose"))}</option>${options}</select>`;
    } else if (type === "multiple") {
      const selected = Array.isArray(value) ? value : [];
      const options = choices.map((choice) =>
        `<label class="multi-option"><input type="checkbox" name="${name}" value="${U.escapeHtml(choice)}" ${selected.includes(choice) ? "checked" : ""}><span>${U.escapeHtml(choice)}</span></label>`
      ).join("");
      control = `<details class="multi-picker" aria-labelledby="${labelId}">
        <summary>${U.escapeHtml(T(selected.length === 1 ? "form.selectedOne" : "form.selectedMany", { count: selected.length }))}</summary>
        <div class="multi-picker-panel">
          <input type="search" data-multi-search placeholder="${U.escapeHtml(T("form.filterChoices"))}" aria-label="${U.escapeHtml(T("form.filterChoices"))}">
          <div class="multi-options">${options}</div>
        </div>
      </details>`;
    } else {
      control = `<input type="${type}" ${commonAttributes} value="${U.escapeHtml(value)}">`;
    }

    const labelElement = type === "multiple"
      ? `<span id="${labelId}">${label}</span>`
      : `<label for="${controlId}">${label}</label>`;
    const wideClass = type === "textarea" || type === "multiple" ? " field-wide" : "";
    return `<div class="submission-field${wideClass}">${labelElement}${control}</div>`;
  }

  function render(state) {
    const api = state.submissionApi;
    const status = !api.checked
      ? UI.notice(T("form.checking"), "info")
      : api.available
        ? UI.notice(T(api.count === 1 ? "form.readyOne" : "form.readyMany", { file: U.escapeHtml(api.file), count: U.formatInteger(api.count) }), "info")
        : UI.notice(T(api.error === "invalid_workbook" ? "form.invalidWorkbook" : "form.unavailable"), "warning");
    const resultKey = state.submissionResult?.ok
      ? "form.success"
      : state.submissionResult?.error === "rate_limited"
        ? "form.rateLimited"
        : "form.error";
    const result = state.submissionResult
      ? UI.notice(T(resultKey, state.submissionResult), state.submissionResult.ok ? "info" : "danger")
      : "";
    const sections = FORM_SECTIONS.map((section) => `<fieldset class="submission-section">
      <legend>${U.escapeHtml(T(`form.section.${section.key}`))}</legend>
      <p>${U.escapeHtml(T(`form.section.${section.key}Help`))}</p>
      <div class="submission-grid">${section.fields.map((field) => formControl(field, state.formDraft)).join("")}</div>
    </fieldset>`).join("");

    return `${UI.pageHeading(T("form.kicker"), T("form.title"))}
      ${status}${result}
      <form id="digital-twin-form" class="submission-form">
        ${sections}
        <div class="form-actions">
          <button class="primary-button" type="submit" ${api.available ? "" : "disabled"}>${T("form.submit")}</button>
          <button class="secondary-button" type="reset">${T("form.clear")}</button>
          <small>${T("form.requiredHelp")}</small>
        </div>
      </form>`;
  }

  function handleInput(event, state) {
    if (event.target.matches("[data-multi-search]")) {
      const query = U.normalize(event.target.value);
      event.target.closest(".multi-picker").querySelectorAll(".multi-option").forEach((option) => {
        option.hidden = Boolean(query && !U.normalize(option.textContent).includes(query));
      });
      return;
    }
    if (event.target.form?.id !== "digital-twin-form" || !event.target.name) return;

    if (event.target.closest(".multi-picker")) {
      const selected = [...event.target.form.querySelectorAll(`[name="${event.target.name}"]:checked`)]
        .map((input) => input.value);
      state.formDraft[event.target.name] = selected;
      event.target.closest(".multi-picker").querySelector("summary").textContent =
        T(selected.length === 1 ? "form.selectedOne" : "form.selectedMany", { count: selected.length });
    } else {
      state.formDraft[event.target.name] = event.target.value;
    }
  }

  async function checkApi(state, refresh) {
    try {
      const response = await fetch("/api/submissions/status", { cache: "no-store" });
      if (!response.ok) throw new Error("unavailable");
      const status = await response.json();
      state.submissionApi = { checked: true, available: true, ...status };
    } catch (_) {
      state.submissionApi = { ...state.submissionApi, checked: true, available: false };
    }
    if (state.page === "submit") refresh();
  }

  async function submit(event, state, refresh) {
    if (event.target.id !== "digital-twin-form") return;
    event.preventDefault();
    if (!state.submissionApi.available) return;

    const form = event.target;
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    button.textContent = T("form.saving");

    const formData = new FormData(form);
    const payload = {};
    allFields().forEach((field) => {
      payload[field.name] = field.type === "multiple"
        ? serializeMultiple(formData.getAll(field.name))
        : formData.get(field.name) || "";
    });

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "save_error");
      state.formDraft = {};
      state.submissionApi.count = result.count;
      state.submissionResult = { ok: true, id: result.id, file: result.file };
      refresh();
      document.querySelector(".submission-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      state.submissionResult = { ok: false, error: error.message };
      refresh();
    }
  }

  window.DashboardForm = { checkApi, handleInput, render, submit };
})();
