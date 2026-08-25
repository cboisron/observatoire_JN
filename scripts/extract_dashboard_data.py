"""Extrait les données du classeur vers un fichier JavaScript autonome.

Le script n'utilise que la bibliothèque standard Python. Il lit directement les
fichiers XML contenus dans le classeur XLSX, filtre les lignes sans observation,
ajoute quelques champs d'aide au dashboard et conserve toutes les valeurs brutes.
"""

from __future__ import annotations

import csv
import json
import os
import re
import unicodedata
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(os.environ.get(
    "OBSERVATORY_SOURCE_FILE", "/data/source/benchmark_from_mapping_pdf.xlsx"
)).resolve()
OUTPUT = Path(os.environ.get(
    "DASHBOARD_DATA_FILE", ROOT / "app" / "data" / "dashboard-data.js"
)).resolve()

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS = {"m": MAIN_NS}

OBSERVATORY_SHEET = "xl/worksheets/sheet1.xml"
REFERENCE_SHEETS = {
    "providers": ("xl/worksheets/sheet2.xml", 1),
    "technologies": ("xl/worksheets/sheet3.xml", 1),
    "user_types": ("xl/worksheets/sheet4.xml", 2),
}
VALIDATION_COLUMNS = {
    "development_stages": 2,
    "countries": 4,
    "territory_classifications": 9,
    "maturity_levels": 12,
    "twin_types": 19,
    "use_case_domains": 20,
    "funding_sources": 22,
    "in_eu": 31,
    "data_sources": 32,
}

# Ces libellés contiennent des virgules internes. Excel les stocke comme si
# elles séparaient plusieurs choix ; on rassemble donc les fragments connus.
VALIDATION_REPAIRS = {
    19: [
        (["Progressively", "structured and followed Twin"], "Progressively, structured and followed Twin"),
    ],
    20: [
        (["Environmental management", "sustainaibility", "and resilience"], "Environmental management, sustainaibility, and resilience"),
        (["Promoting youth", "sports", "culture"], "Promoting youth, sports, culture"),
    ],
}

FIELD_NAMES = {
    "#": "source_id",
    "Platform's_development_stage": "development_stage",
    "Name_of_solution": "solution_name",
    "Country_location": "country",
    "Geographic_Scope_(LDT_user)": "geographic_scope",
    "French_name_city_etc": "french_place_name",
    "latitude": "latitude_raw",
    "longitude": "longitude_raw",
    "City_Community_Region_Classification": "territory_classification",
    "LDT_provider(s) / Consortium": "providers",
    "Source_for_project_reference": "project_reference",
    "Maturity_Level_[DUET_Framework]": "maturity_level",
    "Publication_of_data_models": "data_models_publication",
    "Publication_of_data": "data_publication",
    "Targets": "targets",
    "Norms_and_standardization": "standards",
    "Used_technologies / Characteristics": "technologies",
    "Creation_date": "creation_date_raw",
    "Type_of_twin": "twin_type",
    "Use case domains": "use_case_domains",
    "Types_of_users": "user_types",
    "Funding_sources": "funding_sources",
    "Urban mobility and traffic systems": "domain_mobility_raw",
    "Urban planning and infrastructure": "domain_planning_raw",
    "Environmental management, sustainaibility, and resilience": "domain_environment_raw",
    "Energy management": "domain_energy_raw",
    "Community Engagement": "domain_engagement_raw",
    "Water management": "domain_water_raw",
    "Urban logistics": "domain_logistics_raw",
    "Total_domains_per_LDT": "total_domains_raw",
    "in EU ?": "in_eu_raw",
    "where_data_from": "data_source",
}

QUALITY_FIELDS = (
    "solution_name",
    "development_stage",
    "country",
    "geographic_scope",
    "territory_classification",
    "providers",
    "project_reference",
    "technologies",
    "user_types",
    "funding_sources",
    "maturity_level",
    "use_case_domains",
)


# ---------------------------------------------------------------------------
# Lecture du format XLSX (un fichier XLSX est une archive de fichiers XML)
# ---------------------------------------------------------------------------


def column_number(reference: str) -> int:
    """Convertit une référence Excel comme AF12 en numéro de colonne."""
    letters = re.match(r"[A-Z]+", reference)
    if not letters:
        raise ValueError(f"Référence de cellule invalide : {reference}")
    result = 0
    for character in letters.group(0):
        result = result * 26 + ord(character) - 64
    return result


def read_shared_strings(archive: ZipFile) -> list[str]:
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return [
        "".join(node.text or "" for node in item.iter(f"{{{MAIN_NS}}}t"))
        for item in root.findall("m:si", NS)
    ]


def read_sheet(
    archive: ZipFile, path: str, shared_strings: list[str]
) -> list[tuple[int, dict[int, Any]]]:
    root = ET.fromstring(archive.read(path))
    rows: list[tuple[int, dict[int, Any]]] = []

    for row in root.findall(".//m:sheetData/m:row", NS):
        values: dict[int, Any] = {}
        for cell in row.findall("m:c", NS):
            cell_type = cell.attrib.get("t")
            value_node = cell.find("m:v", NS)
            column = column_number(cell.attrib["r"])

            if cell_type == "inlineStr":
                value = "".join(
                    node.text or "" for node in cell.iter(f"{{{MAIN_NS}}}t")
                )
            elif value_node is None:
                value = None
            elif cell_type == "s":
                value = shared_strings[int(value_node.text)]
            elif cell_type == "b":
                value = value_node.text == "1"
            else:
                value = value_node.text

            if value not in (None, ""):
                values[column] = value

        rows.append((int(row.attrib["r"]), values))

    return rows


def read_validation_lists(archive: ZipFile, path: str) -> dict[int, list[str]]:
    """Lit les listes de validation explicites de la feuille, par colonne."""
    root = ET.fromstring(archive.read(path))
    result: dict[int, list[str]] = {}
    for validation in root.findall(".//m:dataValidation", NS):
        if validation.attrib.get("type") != "list":
            continue
        formula = validation.find("m:formula1", NS)
        if formula is None or not formula.text or formula.text == "#REF!":
            continue
        # Excel a découpé certaines longues listes en chaînes concaténées.
        joined = "".join(re.findall(r'"([^"]*)"', formula.text))
        if not joined:
            continue
        choices = list(dict.fromkeys(item.strip() for item in joined.split(",") if item.strip()))
        for cell_range in validation.attrib.get("sqref", "").split():
            match = re.match(r"([A-Z]+)", cell_range)
            if match:
                column = column_number(match.group(1))
                repaired = list(choices)
                for fragments, combined in VALIDATION_REPAIRS.get(column, []):
                    for index in range(len(repaired) - len(fragments) + 1):
                        if repaired[index:index + len(fragments)] == fragments:
                            repaired[index:index + len(fragments)] = [combined]
                            break
                result[column] = repaired
    return result


# ---------------------------------------------------------------------------
# Nettoyage élémentaire des valeurs
# ---------------------------------------------------------------------------


def clean_text(value: Any) -> str | None:
    if value is None:
        return None
    text = re.sub(r"\s+", " ", str(value)).strip()
    return text or None


def comparison_key(value: str | None) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    normalized = "".join(c for c in normalized if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", normalized.casefold()).strip()


def parse_number(value: str | None) -> float | None:
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def normalized_stage(value: str | None) -> str:
    key = comparison_key(value)
    if not key:
        return "Non renseigné"
    if "implemented operating" in key or key.startswith("operational"):
        return "Opérationnelle"
    if "planned or under development" in key:
        return "En développement"
    if "strategy" in key or "initiatives" in key:
        return "Stratégie / initiative"
    return "Autre"


def split_list(value: str | None) -> list[str]:
    if not value:
        return []
    try:
        return [
            item.strip()
            for item in next(csv.reader([value], skipinitialspace=True))
            if item.strip()
        ]
    except csv.Error:
        return [value]


# ---------------------------------------------------------------------------
# Transformation des feuilles Excel en données du dashboard
# ---------------------------------------------------------------------------


def read_reference_lists(
    archive: ZipFile,
    shared_strings: list[str],
    validation_lists: dict[int, list[str]],
) -> dict[str, list[str]]:
    """Lit les trois feuilles de référentiels et les validations Excel."""
    references: dict[str, list[str]] = {}

    for name, (path, header_row) in REFERENCE_SHEETS.items():
        references[name] = []
        for row_number, values in read_sheet(archive, path, shared_strings):
            value = clean_text(values.get(1))
            if row_number > header_row and value:
                references[name].append(value)

    for name, column in VALIDATION_COLUMNS.items():
        references[name] = validation_lists.get(column, [])
    return references


def is_observation(values: dict[int, Any]) -> bool:
    """Une observation possède au moins une valeur dans les 31 champs métier."""
    return any(values.get(column) not in (None, "") for column in range(1, 32))


def build_record(
    excel_row: int,
    values: dict[int, Any],
    header_by_column: dict[int, Any],
) -> dict[str, Any]:
    """Transforme une ligne Excel en observation directement exploitable."""
    record: dict[str, Any] = {"excel_row": excel_row}
    for column, original_header in header_by_column.items():
        field = FIELD_NAMES.get(original_header)
        if field:
            record[field] = clean_text(values.get(column))

    latitude = parse_number(record.get("latitude_raw"))
    longitude = parse_number(record.get("longitude_raw"))
    valid_coordinates = (
        latitude is not None
        and longitude is not None
        and -90 <= latitude <= 90
        and -180 <= longitude <= 180
    )
    record["latitude"] = latitude if valid_coordinates else None
    record["longitude"] = longitude if valid_coordinates else None
    record["has_valid_coordinates"] = valid_coordinates
    record["stage_group"] = normalized_stage(record.get("development_stage"))
    record["named"] = bool(record.get("solution_name"))

    eu_value = comparison_key(record.get("in_eu_raw"))
    record["in_eu"] = True if eu_value == "yes" else False if eu_value == "no" else None

    list_fields = {
        "technology_items": "technologies",
        "user_items": "user_types",
        "funding_items": "funding_sources",
        "domain_items": "use_case_domains",
        "provider_items": "providers",
    }
    for output_field, source_field in list_fields.items():
        record[output_field] = split_list(record.get(source_field))

    record["missing_fields"] = [field for field in QUALITY_FIELDS if not record.get(field)]
    present_count = len(QUALITY_FIELDS) - len(record["missing_fields"])
    record["quality_score"] = round(100 * present_count / len(QUALITY_FIELDS))
    source_key = comparison_key(record.get("data_source")).replace(" ", "-") or "source"
    record["record_id"] = f"{source_key}-{excel_row}"
    return record


def add_duplicate_information(records: list[dict[str, Any]]) -> None:
    """Marque les noms strictement identiques après normalisation."""
    name_counts = Counter(
        comparison_key(record.get("solution_name"))
        for record in records
        if record.get("solution_name")
    )
    for record in records:
        name_key = comparison_key(record.get("solution_name"))
        record["potential_duplicate"] = bool(name_key and name_counts[name_key] > 1)
        record["duplicate_group_size"] = name_counts[name_key] if name_key else 0


def complete_reference_lists(
    references: dict[str, list[str]], records: list[dict[str, Any]]
) -> None:
    """Ajoute aux référentiels les valeurs multivaluées réellement observées."""
    references["funding_sources"] = list(dict.fromkeys(
        item for record in records for item in record["funding_items"]
    ))
    references["use_case_domains"] = list(dict.fromkeys([
        *references.get("use_case_domains", []),
        *(item for record in records for item in record["domain_items"]),
    ]))


def calculate_diagnostics(
    rows: list[tuple[int, dict[int, Any]]], records: list[dict[str, Any]]
) -> dict[str, int]:
    """Calcule les diagnostics affichés dans la page Qualité des données."""
    data_rows = rows[1:]
    return {
        "physical_data_rows": max((row_number for row_number, _ in rows), default=1) - 1,
        "empty_physical_rows": sum(not values for _, values in data_rows),
        "excluded_non_observation_rows": sum(
            not is_observation(values) and bool(values.get(32))
            for _, values in data_rows
        ),
        "distinct_development_stage_count": len({
            record["development_stage"]
            for record in records
            if record.get("development_stage")
        }),
    }


def load_records() -> tuple[list[dict[str, Any]], dict[str, list[str]], dict[str, int]]:
    """Orchestre la lecture du classeur sans modifier le fichier source."""
    with ZipFile(SOURCE) as archive:
        shared_strings = read_shared_strings(archive)
        rows = read_sheet(archive, OBSERVATORY_SHEET, shared_strings)
        validation_lists = read_validation_lists(archive, OBSERVATORY_SHEET)
        references = read_reference_lists(archive, shared_strings, validation_lists)

    header_by_column = rows[0][1]
    records = [
        build_record(excel_row, values, header_by_column)
        for excel_row, values in rows[1:]
        if is_observation(values)
    ]
    add_duplicate_information(records)
    complete_reference_lists(references, records)
    diagnostics = calculate_diagnostics(rows, records)
    return records, references, diagnostics


# ---------------------------------------------------------------------------
# Création du fichier JavaScript autonome
# ---------------------------------------------------------------------------


def build_payload() -> dict[str, Any]:
    records, references, diagnostics = load_records()
    source_counts = Counter(record.get("data_source") for record in records)
    named_records = [record for record in records if record["named"]]

    return {
        "meta": {
            "generated_at": date.today().isoformat(),
            "source_file": SOURCE.name,
            "record_count": len(records),
            "named_record_count": len(named_records),
            "country_count": len({record["country"] for record in records if record.get("country")}),
            "valid_coordinate_count": sum(
                record["has_valid_coordinates"] for record in records
            ),
            "potential_duplicate_group_count": len(
                {
                    comparison_key(record.get("solution_name"))
                    for record in records
                    if record["potential_duplicate"]
                }
            ),
            "source_counts": dict(source_counts),
            "quality_fields": list(QUALITY_FIELDS),
            "quality_field_count": len(QUALITY_FIELDS),
            **diagnostics,
        },
        "records": records,
        "reference_lists": references,
    }


def main() -> None:
    payload = build_payload()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(
        "// Fichier généré par scripts/extract_dashboard_data.py\n"
        f"window.OBSERVATORY_DATA={serialized};\n",
        encoding="utf-8",
    )
    try:
        displayed_output = OUTPUT.relative_to(ROOT)
    except ValueError:
        displayed_output = OUTPUT
    print(f"{displayed_output} généré")
    print(f"Observations : {payload['meta']['record_count']}")
    print(f"Solutions nommées : {payload['meta']['named_record_count']}")


if __name__ == "__main__":
    main()
