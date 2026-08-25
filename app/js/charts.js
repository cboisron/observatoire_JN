(function () {
  "use strict";

  // Génère les graphiques sous forme de HTML et SVG, sans bibliothèque externe.

  const { escapeHtml, formatInteger, formatPercent } = window.DataUtils;
  const T = (key, parameters) => window.I18n.t(key, parameters);
  const DEFAULT_COLORS = ["#17375e", "#e95d2a", "#55a630", "#f2c230", "#168aad", "#87b940", "#6c5ce7"];

  function emptyState(message) {
    return `<div class="empty-state"><span aria-hidden="true">!</span><p>${escapeHtml(message)}</p></div>`;
  }

  function horizontalBars(items, options = {}) {
    const data = items.slice(0, options.limit || 10);
    if (!data.length) return emptyState(options.emptyMessage || T("common.noFilteredData"));
    const maximum = Math.max(...data.map((item) => item.value), 1);
    const total = options.total || data.reduce((sum, item) => sum + item.value, 0);
    return `<div class="bar-chart">${data.map((item, index) => {
      const width = item.value ? Math.max(2, (100 * item.value) / maximum) : 0;
      const color = item.color || options.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      const detail = options.showShare ? ` <small>${formatPercent(item.value, total)}</small>` : "";
      return `<div class="bar-row">
        <div class="bar-label"><span title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span><strong>${formatInteger(item.value)}${detail}</strong></div>
        <div class="bar-track" aria-hidden="true"><span style="width:${width}%;background:${color}"></span></div>
      </div>`;
    }).join("")}</div>`;
  }

  function donut(items, options = {}) {
    if (!items.length) return emptyState(options.emptyMessage || T("common.noData"));
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (!total) return emptyState(options.emptyMessage || T("common.noData"));
    let cursor = 0;
    const segments = items.map((item, index) => {
      const start = cursor;
      cursor += (100 * item.value) / total;
      return `${item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} ${start}% ${cursor}%`;
    });
    return `<div class="donut-layout">
      <div class="donut" style="background:conic-gradient(${segments.join(",")})" role="img" aria-label="${escapeHtml(T("page.scope", { count: formatInteger(total) }))}">
        <div><strong>${formatInteger(total)}</strong><span>${escapeHtml(options.centerLabel || T("common.informed"))}</span></div>
      </div>
      <div class="legend">${items.map((item, index) => `
        <div><i style="background:${item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}"></i><span>${escapeHtml(item.label)}</span><strong>${formatInteger(item.value)}</strong></div>
      `).join("")}</div>
    </div>`;
  }

  // Fonctions propres à la carte mondiale.

  function coordinatePath(ring) {
    return ring.map((coordinate, index) => {
      const x = ((coordinate[0] + 180) / 360) * 960;
      const y = ((90 - coordinate[1]) / 180) * 440;
      return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") + " Z";
  }

  function geometryPath(geometry) {
    if (!geometry || !geometry.coordinates) return "";
    if (geometry.type === "Polygon") {
      return geometry.coordinates.map(coordinatePath).join(" ");
    }
    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.flatMap((polygon) => polygon.map(coordinatePath)).join(" ");
    }
    return "";
  }

  function canonicalCountryKey(country) {
    const key = window.DataUtils.normalize(country);
    const aliases = {
      "usa": "united states of america"
    };
    return aliases[key] || key;
  }

  function countryFill(count, maximum) {
    if (!count) return "#dfe7e2";
    const ratio = count / Math.max(maximum, 1);
    if (ratio > 0.66) return "#0e5f7e";
    if (ratio > 0.33) return "#168aad";
    if (ratio > 0.12) return "#67afc1";
    return "#a9d3dc";
  }

  function distanceKm(first, second) {
    const radians = (value) => (value * Math.PI) / 180;
    const latitudeDelta = radians(second.latitude - first.latitude);
    const longitudeDelta = radians(second.longitude - first.longitude);
    const latitude1 = radians(first.latitude);
    const latitude2 = radians(second.latitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(haversine));
  }

  function groupNearbyRecords(records, thresholdKm = 15) {
    const parents = records.map((_, index) => index);
    const find = (index) => {
      let current = index;
      while (parents[current] !== current) {
        parents[current] = parents[parents[current]];
        current = parents[current];
      }
      return current;
    };
    const union = (first, second) => {
      const firstRoot = find(first);
      const secondRoot = find(second);
      if (firstRoot !== secondRoot) parents[secondRoot] = firstRoot;
    };
    records.forEach((record, firstIndex) => {
      for (let secondIndex = firstIndex + 1; secondIndex < records.length; secondIndex += 1) {
        if (distanceKm(record, records[secondIndex]) <= thresholdKm) union(firstIndex, secondIndex);
      }
    });
    const groups = new Map();
    records.forEach((record, index) => {
      const root = find(index);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(record);
    });
    return [...groups.values()];
  }

  function worldMap(records) {
    const positioned = records.filter((record) => record.has_valid_coordinates);
    const x = (longitude) => ((longitude + 180) / 360) * 960;
    const y = (latitude) => ((90 - latitude) / 180) * 440;
    const countryCounts = new Map();
    records.forEach((record) => {
      if (!record.country || record.country === "International") return;
      const key = canonicalCountryKey(record.country);
      const current = countryCounts.get(key) || { label: record.country, value: 0 };
      current.value += 1;
      countryCounts.set(key, current);
    });
    const maximum = Math.max(0, ...[...countryCounts.values()].map((item) => item.value));
    const mapData = window.WORLD_COUNTRIES && window.WORLD_COUNTRIES.features;
    const countries = mapData ? mapData.map((feature) => {
      const key = canonicalCountryKey(feature.name_en || feature.name);
      const match = countryCounts.get(key);
      const count = match ? match.value : 0;
      const label = match ? match.label : feature.name;
      const observationLabel = T(count === 1 ? "common.observation.one" : "common.observation.many");
      return `<path class="country${count ? " country-with-data" : ""}" d="${geometryPath(feature.geometry)}" style="fill:${countryFill(count, maximum)}"${count ? ` data-map-country="${escapeHtml(label)}" tabindex="0"` : ""}><title>${escapeHtml(label)}${count ? ` : ${count} ${escapeHtml(observationLabel)}` : ""}</title></path>`;
    }).join("") : "";
    const nearbyGroups = groupNearbyRecords(positioned, 15);
    const points = nearbyGroups.sort((a, b) => a.length - b.length).map((group, groupIndex) => {
      const centerLatitude = group.reduce((sum, record) => sum + record.latitude, 0) / group.length;
      const centerLongitude = group.reduce((sum, record) => sum + record.longitude, 0) / group.length;
      const pointX = x(centerLongitude);
      const pointY = y(centerLatitude);
      if (group.length > 1) {
        const names = group.map((record) => record.solution_name || record.geographic_scope || T("catalog.unnamed"));
        return `<g class="map-cluster" data-map-cluster="cluster-${groupIndex}" data-record-ids="${group.map((record) => escapeHtml(record.record_id)).join("|")}" tabindex="0" role="button" aria-label="${escapeHtml(T("map.clusterAria", { count: group.length }))}">
          <circle cx="${pointX.toFixed(2)}" cy="${pointY.toFixed(2)}" r="10"></circle>
          <text x="${pointX.toFixed(2)}" y="${(pointY + 0.4).toFixed(2)}">${group.length}</text>
          <title>${escapeHtml(T("map.clusterTitle", { count: group.length }))} : ${escapeHtml(names.join(", "))}</title>
        </g>`;
      }
      const record = group[0];
      const label = record.solution_name || record.geographic_scope || T("catalog.unnamed");
      return `<circle class="map-svg-point" data-record-id="${escapeHtml(record.record_id)}" cx="${pointX.toFixed(2)}" cy="${pointY.toFixed(2)}" r="5" tabindex="0" role="button" aria-label="${escapeHtml(T("common.view"))} ${escapeHtml(label)}"><title>${escapeHtml(label)}</title></circle>`;
    }).join("");
    return `<div class="world-map" role="group" aria-label="${escapeHtml(T("geo.knownLocations"))}">
      <svg viewBox="0 0 960 440" data-map-svg role="img" aria-label="${escapeHtml(T("geo.byCountry"))}">
        <g class="map-grid"><path d="M0 110H960M0 220H960M0 330H960M240 0V440M480 0V440M720 0V440"/></g>
        <g class="map-content"><g class="countries">${countries}</g><g class="solution-points">${points}</g></g>
      </svg>
      <div class="map-controls" aria-label="${escapeHtml(T("geo.knownLocations"))}">
        <button type="button" data-map-action="zoom-in" aria-label="${escapeHtml(T("map.zoomIn"))}">+</button>
        <button type="button" data-map-action="zoom-out" aria-label="${escapeHtml(T("map.zoomOut"))}">−</button>
        <span class="map-control-separator"></span>
        <button type="button" data-map-action="pan-left" aria-label="${escapeHtml(T("map.west"))}">←</button>
        <button type="button" data-map-action="pan-up" aria-label="${escapeHtml(T("map.north"))}">↑</button>
        <button type="button" data-map-action="pan-down" aria-label="${escapeHtml(T("map.south"))}">↓</button>
        <button type="button" data-map-action="pan-right" aria-label="${escapeHtml(T("map.east"))}">→</button>
        <span class="map-control-separator"></span>
        <button type="button" data-map-action="reset" aria-label="${escapeHtml(T("map.reset"))}">1:1</button>
      </div>
      <div class="map-zoom-level" aria-live="polite">${escapeHtml(T("map.zoom", { value: 100 }))}</div>
      <aside class="map-cluster-panel" hidden aria-live="polite"></aside>
      <div class="map-legend" aria-hidden="true"><span></span> ${escapeHtml(T("map.countryShown"))} <i></i> ${escapeHtml(T("map.solution"))} <b>2+</b> ${escapeHtml(T("map.group"))}</div>
      <div class="map-caption">${T("map.positioned", { positioned: `<strong>${formatInteger(positioned.length)}</strong>`, total: formatInteger(records.length) })}</div>
    </div>`;
  }

  function completionRows(items) {
    if (!items.length) return emptyState(T("common.noField"));
    return `<div class="completion-list">${items.map((item) => {
      const percent = item.total ? Math.round((100 * item.value) / item.total) : 0;
      const tone = percent >= 75 ? "good" : percent >= 40 ? "medium" : "low";
      return `<div class="completion-row">
        <div><span>${escapeHtml(item.label)}</span><strong>${percent} %</strong></div>
        <div class="completion-track"><span class="${tone}" style="width:${percent}%"></span></div>
        <small>${formatInteger(item.value)} / ${formatInteger(item.total)}</small>
      </div>`;
    }).join("")}</div>`;
  }

  window.Charts = { completionRows, donut, emptyState, horizontalBars, worldMap };
})();
