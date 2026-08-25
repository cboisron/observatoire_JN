(function () {
  "use strict";

  // Fiche d'une solution et interactions propres à la carte.
  const DATA = window.OBSERVATORY_DATA;
  const U = window.DataUtils;
  const UI = window.DashboardUI;
  const T = (key, parameters) => window.I18n.t(key, parameters);

  const DETAIL_FIELDS = [
    { name: "development_stage" },
    { name: "maturity_level" },
    { name: "territory_classification" },
    { name: "creation_date_raw" },
    { name: "providers", wide: true },
    { name: "project_reference", wide: true },
    { name: "targets", wide: true },
    { name: "technologies", wide: true },
    { name: "standards", wide: true },
    { name: "use_case_domains", wide: true },
    { name: "user_types", wide: true },
    { name: "funding_sources", wide: true },
    { name: "data_models_publication", wide: true },
    { name: "data_publication", wide: true },
    { name: "twin_type" }
  ];

  function locationLabel(record) {
    return [record.geographic_scope, record.country].filter(Boolean).join(" — ") || T("detail.noLocation");
  }

  function fieldHtml(record, field) {
    const value = record[field.name];
    const missing = value === null || value === undefined || value === "";
    const displayedValue = missing
      ? `<span class="missing-data">${T("detail.missing")}</span>`
      : U.escapeHtml(value);
    return `<div class="detail-field${field.wide ? " wide" : ""}">
      <dt>${U.escapeHtml(U.fieldLabel(field.name))}</dt><dd>${displayedValue}</dd>
    </div>`;
  }

  function openDetail(record, elements) {
    const quality = U.qualityBand(record.quality_score);
    elements.detail.innerHTML = `<header class="detail-title">
      <span class="eyebrow">${T("detail.kicker")}</span>
      <h2 id="detail-title">${U.escapeHtml(record.solution_name || T("detail.unnamed"))}</h2>
      <p>${U.escapeHtml(locationLabel(record))}</p>
    </header>
    <div class="detail-meta">
      <span class="status-pill ${UI.statusClass(record.stage_group)}">${U.escapeHtml(UI.stageLabel(record.stage_group))}</span>
      <span class="quality-pill ${quality.className}">${T("detail.completeness", { score: record.quality_score })}</span>
      <span class="card-tag">${T("common.source")} : ${U.escapeHtml(record.data_source)}</span>
      ${record.potential_duplicate ? `<span class="quality-pill quality-medium">${T("detail.duplicate", { count: record.duplicate_group_size })}</span>` : ""}
    </div>
    ${!record.has_valid_coordinates ? UI.notice(T("detail.noCoordinates"), "warning") : ""}
    <dl class="detail-grid">${DETAIL_FIELDS.map((field) => fieldHtml(record, field)).join("")}</dl>`;

    elements.dialog.hidden = false;
    document.body.style.overflow = "hidden";
    elements.dialog.querySelector(".dialog-close").focus();
  }

  function openMapCluster(cluster) {
    const panel = cluster.closest(".world-map").querySelector(".map-cluster-panel");
    const recordIds = (cluster.dataset.recordIds || "").split("|").filter(Boolean);
    const records = recordIds
      .map((recordId) => DATA.records.find((record) => record.record_id === recordId))
      .filter(Boolean);
    const solutions = records.map((record) => `<button class="cluster-solution" type="button" data-record-id="${U.escapeHtml(record.record_id)}">
      <strong>${U.escapeHtml(record.solution_name || T("detail.unnamed"))}</strong>
      <small>${U.escapeHtml(locationLabel(record))}</small>
    </button>`).join("");

    panel.innerHTML = `<header>
      <div><h4>${T("map.clusterPanel", { count: records.length })}</h4><p>${T("map.clusterHelp")}</p></div>
      <button class="cluster-close" type="button" data-close-map-cluster aria-label="${T("common.close")}">&times;</button>
    </header><div class="cluster-solution-list">${solutions}</div>`;
    panel.hidden = false;
    panel.querySelector(".cluster-solution, .cluster-close")?.focus();
  }

  function closeDialog(dialog) {
    dialog.hidden = true;
    document.body.style.overflow = "";
  }

  function setupMapInteractions() {
    document.querySelectorAll(".world-map").forEach((map) => {
      const svg = map.querySelector("[data-map-svg]");
      if (!svg || svg.dataset.zoomReady) return;
      svg.dataset.zoomReady = "true";
      svg.addEventListener("wheel", (event) => {
        event.preventDefault();
        updateMapView(map, event.deltaY < 0 ? "zoom-in" : "zoom-out", event.clientX, event.clientY);
      }, { passive: false });
    });
  }

  function updateMapView(map, action, clientX = null, clientY = null) {
    if (!map) return;
    const svg = map.querySelector("[data-map-svg]");
    const viewBox = svg.viewBox.baseVal;
    let { x, y, width, height } = viewBox;

    if (action === "reset") {
      [x, y, width, height] = [0, 0, 960, 440];
    } else if (action === "zoom-in" || action === "zoom-out") {
      const factor = action === "zoom-in" ? 0.68 : 1.47;
      const rect = svg.getBoundingClientRect();
      const anchorX = clientX === null ? x + width / 2 : x + ((clientX - rect.left) / rect.width) * width;
      const anchorY = clientY === null ? y + height / 2 : y + ((clientY - rect.top) / rect.height) * height;
      const nextWidth = Math.min(960, Math.max(120, width * factor));
      const nextHeight = nextWidth * (440 / 960);
      const ratioX = width ? (anchorX - x) / width : 0.5;
      const ratioY = height ? (anchorY - y) / height : 0.5;
      x = anchorX - ratioX * nextWidth;
      y = anchorY - ratioY * nextHeight;
      width = nextWidth;
      height = nextHeight;
    } else {
      const horizontalStep = width * 0.24;
      const verticalStep = height * 0.24;
      if (action === "pan-left") x -= horizontalStep;
      if (action === "pan-right") x += horizontalStep;
      if (action === "pan-up") y -= verticalStep;
      if (action === "pan-down") y += verticalStep;
    }

    x = Math.max(0, Math.min(960 - width, x));
    y = Math.max(0, Math.min(440 - height, y));
    svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);

    const zoom = 960 / width;
    svg.querySelectorAll(".map-svg-point").forEach((point) => point.setAttribute("r", String(5 / zoom)));
    svg.querySelectorAll(".map-cluster circle").forEach((point) => point.setAttribute("r", String(10 / zoom)));
    svg.querySelectorAll(".map-cluster text").forEach((text) => { text.style.fontSize = `${9 / zoom}px`; });
    const label = map.querySelector(".map-zoom-level");
    if (label) label.textContent = T("map.zoom", { value: Math.round(zoom * 100) });
  }

  window.RecordInteractions = {
    closeDialog,
    openDetail,
    openMapCluster,
    setupMapInteractions,
    updateMapView
  };
})();
