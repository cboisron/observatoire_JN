"""Prépare le fond de carte Natural Earth pour une utilisation hors ligne.

Entrée : app/data/natural-earth-countries.geojson
Sortie : app/data/world-countries.js

Seules la géométrie et quelques propriétés utiles sont conservées afin de
limiter la taille du fichier chargé par le dashboard.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "app" / "data" / "natural-earth-countries.geojson"
OUTPUT = ROOT / "app" / "data" / "world-countries.js"


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    features = []
    for feature in source.get("features", []):
        properties = feature.get("properties") or {}
        features.append(
            {
                "name": properties.get("NAME_FR")
                or properties.get("NAME")
                or properties.get("ADMIN"),
                "name_en": properties.get("ADMIN") or properties.get("NAME"),
                "iso_a3": properties.get("ADM0_A3") or properties.get("ISO_A3"),
                "map_color": properties.get("MAPCOLOR7") or 1,
                "geometry": feature.get("geometry"),
            }
        )

    payload = {
        "source": "Natural Earth, Admin 0 – Countries, 1:110m",
        "version": "dépôt Natural Earth consulté le 2026-08-24",
        "features": features,
    }
    OUTPUT.write_text(
        "// Fond de carte Natural Earth embarqué pour un usage hors ligne.\n"
        f"window.WORLD_COUNTRIES={json.dumps(payload, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )
    print(f"{OUTPUT.relative_to(ROOT)} généré : {len(features)} pays ou territoires")


if __name__ == "__main__":
    main()
