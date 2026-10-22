"""Import the IFH source workbook using only Python's standard library.

Usage: python3 scripts/import-ecosystem.py /path/to/UAE_Startups_Funders_200_AR.xlsx
The original workbook and the normalized public dataset are copied into public/data.
"""
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
import xml.etree.ElementTree as ET
import zipfile

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
MISSING = "غير متاح في المصادر المراجعة"


def value_or_none(value):
    return None if value in (None, "", MISSING) else value


def url_list(value):
    return [line for line in (value or "").splitlines() if line.startswith("https://")]


def read_rows(archive, sheet, shared):
    root = ET.fromstring(archive.read(f"xl/worksheets/sheet{sheet}.xml"))
    records = []
    for row in root.findall(".//s:sheetData/s:row", NS):
        if int(row.attrib["r"]) < 6:
            continue
        cells = {}
        for cell in row.findall("s:c", NS):
            address = re.match(r"([A-Z]+)", cell.attrib["r"])[1]
            formula = cell.find("s:f", NS)
            raw = cell.find("s:v", NS)
            value = raw.text if raw is not None else ""
            if cell.attrib.get("t") == "s":
                value = shared[int(value)]
            elif cell.attrib.get("t") == "inlineStr":
                value = "".join(cell.itertext())
            if formula is not None:
                link = re.match(r'HYPERLINK\("((?:[^"]|"")*)",', formula.text or "")
                if not link:
                    raise ValueError("Unexpected formula in directory: " + cell.attrib["r"])
                value = link[1].replace('""', '"')
            cells[address] = value
        if cells.get("A"):
            records.append(cells)
    return records


def review_date(serial):
    if re.match(r"^\d{4}-\d{2}-\d{2}T", serial):
        return dt.datetime.fromisoformat(serial.replace("Z", "+00:00")).date().isoformat()
    return (dt.datetime(1899, 12, 30) + dt.timedelta(days=float(serial))).date().isoformat()


def main(source):
    with zipfile.ZipFile(source) as archive:
        shared = ["".join(e.itertext()) for e in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
        startups = read_rows(archive, 2, shared)
        funders = read_rows(archive, 3, shared)
    if len(startups) != 100 or len(funders) != 100:
        raise ValueError("Expected exactly 100 startups and 100 funding/support entities")
    records = []
    for r in startups:
        amount = value_or_none(r.get("M"))
        records.append({
            "id": r["A"], "kind": "startup", "name": r["B"], "location": r["C"],
            "category": r["D"], "founded": value_or_none(r.get("E")),
            "founders": value_or_none(r.get("F")), "website": r["J"],
            "email": value_or_none(r.get("G")), "phone": value_or_none(r.get("H")),
            "contactPurpose": r["I"], "contactPage": r["Y"],
            "fundraisingStatus": "unconfirmed", "fundraisingNote": r["K"],
            "historicalRound": {"stage": r["L"], "amountUSD": float(amount) if amount else None,
                                "announced": value_or_none(r.get("N")), "note": r["O"]}
                               if value_or_none(r.get("L")) else None,
            "notes": r.get("R", ""), "reviewedAt": review_date(r["S"]),
            "sources": {"profile": url_list(r.get("T")), "founders": url_list(r.get("U")),
                        "funding": url_list(r.get("V")), "email": url_list(r.get("W")),
                        "phone": url_list(r.get("X"))},
            "contactEvidence": {"email": value_or_none(r.get("Z")), "phone": value_or_none(r.get("AA"))}
        })
    for r in funders:
        records.append({
            "id": r["A"], "kind": "funder", "name": r["B"], "category": r["C"],
            "location": r["D"], "focus": r["E"], "stage": r["F"], "instrument": r["G"],
            "role": r["H"], "email": value_or_none(r.get("I")), "phone": value_or_none(r.get("J")),
            "contactPurpose": r["K"], "website": r["L"], "contactPage": r["M"],
            "eligibility": r["N"], "applicationStatus": "unconfirmed", "applicationNote": r["O"],
            "notes": r.get("R", ""), "reviewedAt": review_date(r["S"]),
            "sources": {"profile": url_list(r.get("T")), "email": url_list(r.get("U")),
                        "phone": url_list(r.get("V"))},
            "contactEvidence": {"email": value_or_none(r.get("W")), "phone": value_or_none(r.get("X"))}
        })
    if len({r["id"] for r in records}) != len(records):
        raise ValueError("Duplicate IDs")
    reviewed = {r["reviewedAt"] for r in records}
    if len(reviewed) != 1:
        raise ValueError("Workbook review dates differ")
    output = Path(__file__).resolve().parents[1] / "public" / "data"
    output.mkdir(exist_ok=True)
    payload = {"schemaVersion": 1, "reviewedAt": reviewed.pop(), "sourceLanguage": "ar",
               "sourceWorkbookSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
               "sourceWorkbook": "/data/UAE_Startups_Funders_200_AR.xlsx", "records": records}
    (output / "uae-ecosystem.v1.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    shutil.copyfile(source, output / "UAE_Startups_Funders_200_AR.xlsx")
    print(json.dumps({"startups": len(startups), "funders": len(funders), "reviewedAt": payload["reviewedAt"]}))


if __name__ == "__main__":
    main(Path(sys.argv[1]))
