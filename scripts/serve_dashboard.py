"""Serveur local du dashboard et enregistrement incrémental des saisies.

Le serveur n'écoute que sur 127.0.0.1. Il sert les fichiers statiques de ``app``
et ajoute les formulaires validés à ``saisies_jumeaux_numeriques.xlsx`` sans
modifier le classeur source de l'observatoire.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import threading
import uuid
import webbrowser
from collections import defaultdict, deque
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from time import monotonic
from urllib.parse import urlparse
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, BadZipFile, ZipFile


ROOT = Path(__file__).resolve().parents[1]
APP_DIR = ROOT / "app"
OUTPUT = Path(os.environ.get(
    "CONTRIBUTIONS_FILE", ROOT / "saisies_jumeaux_numeriques.xlsx"
)).resolve()
HOST = os.environ.get("DASHBOARD_HOST", "127.0.0.1")
PORT = int(os.environ.get("DASHBOARD_PORT", "8765"))
MAX_BODY_SIZE = 250_000
RATE_LIMIT_REQUESTS = max(1, int(os.environ.get("RATE_LIMIT_REQUESTS", "5")))
RATE_LIMIT_WINDOW_SECONDS = max(1, int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", "600")))
LOCK = threading.Lock()
RATE_LIMIT_LOCK = threading.Lock()
REQUEST_HISTORY: dict[str, deque[float]] = defaultdict(deque)

FIELDS = (
    ("timestamp", "Timestamp"),
    ("development_stage", "What is your platform's development stage?"),
    ("capability", "What would you say is the capability of your Digital Twin? "),
    ("capability_justification", "Please justify the capability of your Digital Twin if you can."),
    ("column_4", "Column 4"),
    ("solution_name", "What is the name of your solution"),
    ("local_authorities", "For which local authority / authories was your digital twin solution created?"),
    ("territory_name", "For which city/community/local authority/region etc. ? "),
    ("local_perimeter", "What is the local perimeter of your digital twin?"),
    ("consortium", "Are you part of a consortium? "),
    ("consortium_members", "State the members of your consortium"),
)
FIELD_KEYS = {key for key, _ in FIELDS}
USER_FIELDS = FIELD_KEYS - {"timestamp", "column_4"}
REQUIRED_FIELDS = {"solution_name"}


def rate_limit_exceeded(client_ip: str) -> bool:
    """Autorise au maximum N requêtes par adresse IP pendant la fenêtre définie."""
    now = monotonic()
    oldest_allowed = now - RATE_LIMIT_WINDOW_SECONDS
    with RATE_LIMIT_LOCK:
        history = REQUEST_HISTORY[client_ip]
        while history and history[0] < oldest_allowed:
            history.popleft()
        if len(history) >= RATE_LIMIT_REQUESTS:
            return True
        history.append(now)
        return False


# ---------------------------------------------------------------------------
# Lecture et écriture du fichier Excel de contributions
# ---------------------------------------------------------------------------


def column_name(number: int) -> str:
    result = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result


def cell_xml(reference: str, value: object) -> str:
    text = "" if value is None else str(value)
    return f'<c r="{reference}" t="inlineStr"><is><t xml:space="preserve">{escape(text)}</t></is></c>'


def worksheet_xml(rows: list[dict[str, str]]) -> str:
    headers = [label for _, label in FIELDS]
    keys = [key for key, _ in FIELDS]
    table = [dict(zip(keys, headers)), *rows]
    xml_rows = []
    for row_number, row in enumerate(table, start=1):
        cells = "".join(
            cell_xml(f"{column_name(column)}{row_number}", row.get(key, ""))
            for column, key in enumerate(keys, start=1)
        )
        xml_rows.append(f'<row r="{row_number}">{cells}</row>')
    last_cell = f"{column_name(len(keys))}{len(table)}"
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<dimension ref="A1:{last_cell}"/><sheetViews><sheetView workbookViewId="0"/></sheetViews>'
        '<sheetFormatPr defaultRowHeight="15"/><sheetData>' + "".join(xml_rows) + '</sheetData>'
        f'<autoFilter ref="A1:{column_name(len(keys))}{len(table)}"/>'
        '</worksheet>'
    )


def write_workbook(path: Path, rows: list[dict[str, str]]) -> None:
    parts = {
        "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
        "_rels/.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
        "xl/workbook.xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Nouveaux jumeaux" sheetId="1" r:id="rId1"/></sheets></workbook>',
        "xl/_rels/workbook.xml.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
        "xl/worksheets/sheet1.xml": worksheet_xml(rows),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.parent / f".{path.stem}-{uuid.uuid4().hex}.tmp.xlsx"
    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as archive:
            for name, content in parts.items():
                archive.writestr(name, content)
        temporary_path.replace(path)
    finally:
        temporary_path.unlink(missing_ok=True)


def read_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with ZipFile(path) as archive:
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        shared_strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared_strings = [
                "".join(node.text or "" for node in item.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"))
                for item in shared_root.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si")
            ]
    namespace = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    sheet_rows = root.findall(".//m:sheetData/m:row", namespace)
    keys = [key for key, _ in FIELDS]
    expected_headers = [label for _, label in FIELDS]

    def values_for(sheet_row: ET.Element) -> list[str]:
        values = [""] * len(keys)
        for cell in sheet_row.findall("m:c", namespace):
            cell_type = cell.attrib.get("t")
            if cell_type == "inlineStr":
                value = "".join(node.text or "" for node in cell.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"))
            else:
                value_node = cell.find("m:v", namespace)
                raw_value = value_node.text if value_node is not None else ""
                value = shared_strings[int(raw_value)] if cell_type == "s" and raw_value else raw_value
            letters = re.match(r"[A-Z]+", cell.attrib.get("r", ""))
            if not letters:
                continue
            column = 0
            for character in letters.group(0):
                column = column * 26 + ord(character) - 64
            if column <= len(values):
                values[column - 1] = value
        return values

    if not sheet_rows or values_for(sheet_rows[0]) != expected_headers:
        raise ValueError("unexpected_workbook")
    rows = []
    for sheet_row in sheet_rows[1:]:
        rows.append(dict(zip(keys, values_for(sheet_row))))
    return rows


def clean_payload(payload: object) -> dict[str, str]:
    if not isinstance(payload, dict):
        raise ValueError("invalid_payload")
    unknown = set(payload) - USER_FIELDS
    if unknown:
        raise ValueError("unknown_fields")
    cleaned = {}
    for key in USER_FIELDS:
        value = payload.get(key, "")
        if not isinstance(value, (str, int, float, bool)) and value is not None:
            raise ValueError("invalid_value")
        text = re.sub(r"\s+", " ", str(value or "")).strip()
        if len(text) > 5000:
            raise ValueError("value_too_long")
        cleaned[key] = text
    if any(not cleaned[field] for field in REQUIRED_FIELDS):
        raise ValueError("required_fields")
    return cleaned


def append_submission(payload: object, path: Path = OUTPUT) -> tuple[str, int]:
    cleaned = clean_payload(payload)
    with LOCK:
        rows = read_rows(path)
        next_number = len(rows) + 1
        identifier = f"FORM-{next_number:05d}"
        row = {
            **cleaned,
            "timestamp": datetime.now().astimezone().isoformat(timespec="seconds"),
            "column_4": "",
        }
        write_workbook(path, [*rows, row])
    return identifier, len(rows) + 1


# ---------------------------------------------------------------------------
# Deux routes API, en plus des fichiers statiques du dossier app
# ---------------------------------------------------------------------------


class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def send_json(
        self,
        status: HTTPStatus,
        payload: dict[str, object],
        headers: dict[str, str] | None = None,
    ) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/health":
            self.send_json(HTTPStatus.OK, {"status": "ok"})
            return
        if path == "/api/submissions/status":
            try:
                with LOCK:
                    count = len(read_rows(OUTPUT))
                payload = {"available": True, "count": count, "file": OUTPUT.name}
            except (OSError, ValueError, ET.ParseError, BadZipFile):
                payload = {"available": False, "count": 0, "file": OUTPUT.name, "error": "invalid_workbook"}
            self.send_json(HTTPStatus.OK, payload)
            return
        super().do_GET()

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/submissions":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        if rate_limit_exceeded(self.client_address[0]):
            self.send_json(
                HTTPStatus.TOO_MANY_REQUESTS,
                {"ok": False, "error": "rate_limited"},
                {"Retry-After": str(RATE_LIMIT_WINDOW_SECONDS)},
            )
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_SIZE:
                raise ValueError("invalid_size")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            identifier, count = append_submission(payload)
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(error)})
            return
        except (OSError, ET.ParseError, BadZipFile) as error:
            self.log_error("Erreur d'écriture : %s", error)
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": "write_error"})
            return
        self.send_json(HTTPStatus.CREATED, {"ok": True, "id": identifier, "count": count, "file": OUTPUT.name})


# ---------------------------------------------------------------------------
# Démarrage
# ---------------------------------------------------------------------------


def main() -> None:
    print("Actualisation des données depuis le classeur source…")
    subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "extract_dashboard_data.py")],
        cwd=ROOT,
        check=True,
    )
    server = ThreadingHTTPServer((HOST, PORT), DashboardHandler)
    address = f"http://{HOST}:{PORT}/"
    print(f"Dashboard disponible sur {address}")
    print(f"Les nouvelles saisies seront enregistrées dans : {OUTPUT}")
    if "--no-browser" not in sys.argv:
        threading.Timer(0.6, lambda: webbrowser.open(address)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
