"""Import finalized English DOCX content into the existing canonical data files.

This importer is intentionally narrow: it parses the approved English source
documents by Word paragraph style and exact heading text, then updates only the
English fields that the current repository schemas already expose.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from docx import Document


REPO_ROOT = Path(__file__).resolve().parents[1]

SOURCE_DOCS = {
    "general": Path(
        r"C:\Users\emmad\Music\english finalized\QC-Field-Execution-Platform-General-QC-Processes-English.docx"
    ),
    "system01": Path(
        r"C:\Users\emmad\Music\english finalized\System-01-Sitework-Earthworks-English-Interface-Content-EXPERT.docx"
    ),
    "system02": Path(
        r"C:\Users\emmad\Music\english finalized\System-02-Substructure-English-Interface-Content-EXPERT.docx"
    ),
    "system03": Path(
        r"C:\Users\emmad\Music\english finalized\System-03-Superstructure-English-Interface-Content-EXPERT.docx"
    ),
    "system04": Path(
        r"C:\Users\emmad\Music\english finalized\System-04-Building-Envelope-English-Interface-Content-EXPERT.docx"
    ),
    "system05": Path(
        r"C:\Users\emmad\Music\english finalized\System-05-Roofing-English-Interface-Content-EXPERT.docx"
    ),
    "system06": Path(
        r"C:\Users\emmad\Music\english finalized\System-06-Interior-Architectural-Construction-English-Interface-Content-EXPERT.docx"
    ),
    "system07": Path(
        r"C:\Users\emmad\Music\english finalized\System-07-Finishes-English-Interface-Content-EXPERT.docx"
    ),
    "system08": Path(
        r"C:\Users\emmad\Music\english finalized\System-08-Mechanical-Services-English-Interface-Content-EXPERT.docx"
    ),
    "system09": Path(
        r"C:\Users\emmad\Music\english finalized\System-09-Electrical-Building-Services-English-Interface-Content-EXPERT.docx"
    ),
    "system10": Path(
        r"C:\Users\emmad\Music\english finalized\System-10-Fire-Life-Safety-Construction-English-Interface-Content-EXPERT.docx"
    ),
    "system11": Path(
        r"C:\Users\emmad\Music\english finalized\System-11-Multidisciplinary-Interfaces-English-Interface-Content-EXPERT.docx"
    ),
    "system12": Path(
        r"C:\Users\emmad\Music\english finalized\System-12-External-Works-English-Interface-Content-EXPERT.docx"
    ),
    "system13": Path(
        r"C:\Users\emmad\Music\english finalized\System-13-Testing-Commissioning-System-Acceptance-English-Interface-Content-EXPERT.docx"
    ),
    "system14": Path(
        r"C:\Users\emmad\Music\english finalized\System-14-Deficiencies-Completion-Closeout-English-Interface-Content-EXPERT.docx"
    ),
}

GENERAL_PROCESS_FILE = REPO_ROOT / "src/data/generalQc/general-qc-processes.json"
GENERAL_UNIVERSAL_FILE = REPO_ROOT / "src/data/generalQc/universal-field-reference.json"
SECTIONS_FILE = REPO_ROOT / "src/data/sections/sections.json"

EXPECTED_GENERAL_LANDING_FIELDS = [
    "Title",
    "Subtitle",
    "All Processes",
    "Commonly Used",
    "Field Tips",
]

EXPECTED_GENERAL_DETAIL_FIELDS = [
    "Summary",
    "When to Use",
    "Field Workflow",
    "What to Capture",
    "Common Mistakes",
    "Key Reminders",
    "Typical Outputs",
    "Related Processes",
]

EXPECTED_UNIVERSAL_FIELDS = [
    "Field Principle",
    "Before Any Inspection",
    "When You Find a Problem",
    "Minimum Useful Quality Record",
    "Important Limitations",
]

EXPECTED_SYSTEM_LANDING_FIELDS = [
    "Description",
    "Activities in this System",
]

EXPECTED_INTERFACES = [
    "Quick",
    "Full",
    "Learn",
    "Contextual / Right Rail",
]

EXPECTED_QUICK_FIELDS = [
    "Before",
    "Inspect",
    "Evidence",
    "Watch For",
    "Do Not Miss",
    "Field Tip",
    "What This Activity Covers",
    "Stage",
    "Criticality",
    "Quality Impact",
]

EXPECTED_FULL_FIELDS = [
    "Quality Objective",
    "Applicability",
    "Authority & References",
    "Authority Note",
    "Document Control",
    "Communications",
    "Requirements",
    "Planning & Preparation",
    "Planning",
    "Material Control",
    "Before Inspection",
    "Execution",
    "During Inspection",
    "During Communications",
    "Inspection & Hold/Witness Points",
    "Testing",
    "Evidence & Documentation",
    "Evidence",
    "Records",
    "Acceptance Evidence",
    "Reporting Analysis",
    "Common Deficiencies",
    "Escalation Triggers",
    "Issue Escalation Communications",
    "Corrective Action",
    "Verification",
    "Acceptance & Closure",
    "After Inspection",
    "Closure Criteria",
    "Follow-up",
    "After Communications",
    "Specialist Boundary",
]

EXPECTED_LEARN_FIELDS = [
    "What is",
    "Why It Matters",
    "Key Principles",
    "How it works (at a glance)",
    "Common Interfaces",
    "Typical Materials",
    "Terms to Know",
    "Common Failures",
    "Practical Examples",
    "Interfaces & Sequence",
    "Specialist / Authority Boundary",
]

EXPECTED_CONTEXT_FIELDS = [
    "Next / Related Work - Before",
    "Next / Related Work - After",
    "Related Systems",
    "Related Inspections",
    "Action",
]

GENERAL_PROCESS_TITLES = [
    "Inspection Planning",
    "Requirement Review",
    "ITP / PIE / PRIE Execution",
    "Hold & Witness Points",
    "Inspection & Acceptance",
    "Deficiency Reporting",
    "Non-Conformity Reporting (NCR)",
    "Corrective Action",
    "Reinspection & Verification",
    "Quality Evidence & Photo Documentation",
    "Testing & Test Records",
    "Material Receiving & Verification",
    "RFI / Technical Clarification",
    "Change & Revised Document Control",
    "Traceability",
    "Quality Closeout",
]

EXPECTED_SYSTEMS = {
    "01": {
        "sectionId": "1",
        "fileStem": "01",
        "sourceKey": "system01",
        "activities": [
            "1.1",
            "1.2",
            "1.3",
            "1.4",
            "1.5",
            "1.6",
            "1.7",
        ],
    },
    "02": {
        "sectionId": "2",
        "fileStem": "02",
        "sourceKey": "system02",
        "activities": [
            "2.1",
            "2.2",
            "2.3",
            "2.4",
            "2.5",
            "2.6",
            "2.7",
            "2.8",
            "2.9",
            "2.10",
            "2.11",
            "2.12",
        ],
    },
    "03": {
        "sectionId": "3",
        "fileStem": "03",
        "sourceKey": "system03",
        "activities": [
            "3.1",
            "3.2",
            "3.3",
            "3.4",
            "3.5",
            "3.6",
            "3.7",
            "3.8",
        ],
    },
    "04": {
        "sectionId": "4",
        "fileStem": "04",
        "sourceKey": "system04",
        "activities": [
            "4.1",
            "4.2",
            "4.3",
            "4.4",
            "4.5",
            "4.6",
            "4.7",
            "4.8",
            "4.9",
            "4.10",
        ],
    },
    "05": {
        "sectionId": "5",
        "fileStem": "05",
        "sourceKey": "system05",
        "activities": [
            "5.1",
            "5.2",
            "5.3",
            "5.4",
            "5.5",
            "5.6",
            "5.7",
            "5.8",
            "5.9",
        ],
    },
    "06": {
        "sectionId": "6",
        "fileStem": "06",
        "sourceKey": "system06",
        "activities": [
            "6.1",
            "6.2",
            "6.3",
            "6.4",
            "6.5",
            "6.6",
            "6.7",
            "6.8",
            "6.9",
        ],
    },
    "07": {
        "sectionId": "7",
        "fileStem": "07",
        "sourceKey": "system07",
        "activities": [
            "7.1",
            "7.2",
            "7.3",
            "7.4",
            "7.5",
            "7.6",
            "7.7",
        ],
    },
    "08": {
        "sectionId": "8",
        "fileStem": "08",
        "sourceKey": "system08",
        "activities": [
            "8.1",
            "8.2",
            "8.3",
            "8.4",
            "8.5",
            "8.6",
            "8.7",
            "8.8",
            "8.9",
            "8.10",
            "8.11",
        ],
    },
    "09": {
        "sectionId": "9",
        "fileStem": "09",
        "sourceKey": "system09",
        "activities": [
            "9.1",
            "9.2",
            "9.3",
            "9.4",
            "9.5",
            "9.6",
            "9.7",
            "9.8",
            "9.9",
            "9.10",
            "9.11",
        ],
    },
    "10": {
        "sectionId": "10",
        "fileStem": "10",
        "sourceKey": "system10",
        "activities": [
            "10.1",
            "10.2",
            "10.3",
            "10.4",
            "10.5",
            "10.6",
            "10.7",
            "10.8",
        ],
    },
    "11": {
        "sectionId": "11",
        "fileStem": "11",
        "sourceKey": "system11",
        "activities": [
            "11.1",
            "11.2",
            "11.3",
            "11.4",
            "11.5",
            "11.6",
            "11.7",
            "11.8",
            "11.9",
            "11.10",
            "11.11",
        ],
    },
    "12": {
        "sectionId": "12",
        "fileStem": "12",
        "sourceKey": "system12",
        "activities": [
            "12.1",
            "12.2",
            "12.3",
            "12.4",
            "12.5",
            "12.6",
            "12.7",
            "12.8",
            "12.9",
            "12.10",
        ],
    },
    "13": {
        "sectionId": "13",
        "fileStem": "13",
        "sourceKey": "system13",
        "activities": [
            "13.1",
            "13.2",
            "13.3",
            "13.4",
            "13.5",
            "13.6",
            "13.7",
            "13.8",
            "13.9",
            "13.10",
            "13.11",
        ],
    },
    "14": {
        "sectionId": "14",
        "fileStem": "14",
        "sourceKey": "system14",
        "activities": [
            "14.1",
            "14.2",
            "14.3",
            "14.4",
            "14.5",
            "14.6",
            "14.7",
            "14.8",
            "14.9",
            "14.10",
            "14.11",
            "14.12",
            "14.13",
            "14.14",
            "14.15",
        ],
    },
}

UNMAPPED_FIELDS = {
    "generalLanding": {
        "Title": "General QC Processes landing title is currently part of the existing screen contract, not a data field.",
        "Subtitle": "General QC Processes landing subtitle is currently part of the existing screen contract, not a data field.",
        "Commonly Used": "No authored General QC landing commonly-used content destination exists in the current schema.",
        "Field Tips": "No authored General QC landing field-tip content destination exists in the current schema.",
    },
    "quick": {
        "What This Activity Covers": "The current QuickView schema has no separate authored coverage field; the existing UI derives this panel from Activity content.",
        "Stage": "The current QuickView schema has no authored stage field; stage display is derived from existing activity/gate metadata.",
        "Criticality": "The current QuickView schema has no authored criticality field; criticality display is derived from existing activity metadata.",
        "Quality Impact": "The current QuickView schema has no authored quality-impact field; the existing UI derives this panel from Activity content.",
    },
    "learn": {
        "How it works (at a glance)": "The current Learn screen derives this sequence from relationships/navigation services.",
        "Common Interfaces": "The current Learn screen derives common interfaces from relationship services.",
        "Typical Materials": "The current Learn screen uses Activity material-control content rather than a separate Learn field.",
        "Terms to Know": "The current Learn schema stores terminology references, not authored inline term definitions.",
    },
    "context": {
        "Next / Related Work - Before": "The current right rail derives before-links from relationship services.",
        "Next / Related Work - After": "The current right rail derives after-links from relationship services.",
        "Related Systems": "The current right rail derives related systems from relationship services.",
        "Related Inspections": "The current right rail derives related inspections from relationship services.",
        "Action": "The existing action control is part of screen behavior, not authored canonical content.",
    },
}


@dataclass
class ParagraphEntry:
    style: str
    text: str


@dataclass
class ParsedGeneral:
    landing: dict[str, list[ParagraphEntry]] = field(default_factory=dict)
    processes: dict[str, dict[str, list[ParagraphEntry]]] = field(default_factory=dict)
    universal: dict[str, list[ParagraphEntry]] = field(default_factory=dict)


@dataclass
class ParsedSystem:
    system_number: str
    landing: dict[str, list[ParagraphEntry]] = field(default_factory=dict)
    activity_titles: dict[str, str] = field(default_factory=dict)
    activities: dict[str, dict[str, dict[str, list[ParagraphEntry]]]] = field(
        default_factory=dict
    )


@dataclass
class ImportResult:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    counts: dict[str, int] = field(default_factory=dict)

    def fail_if_errors(self) -> None:
        if self.errors:
            for error in self.errors:
                print(f"ERROR: {error}", file=sys.stderr)
            raise SystemExit(1)


def clean_text(text: str) -> str:
    return re.sub(r"[ \t]+", " ", text.replace("\xa0", " ")).strip()


def docx_entries(path: Path) -> list[ParagraphEntry]:
    if not path.exists():
        raise FileNotFoundError(path)
    document = Document(str(path))
    entries: list[ParagraphEntry] = []
    for paragraph in document.paragraphs:
        text = clean_text(paragraph.text)
        if not text:
            continue
        entries.append(ParagraphEntry(paragraph.style.name, text))
    return entries


def require_fields(
    result: ImportResult,
    context: str,
    actual: dict[str, Any],
    expected: list[str],
    allow_what_is: bool = False,
) -> None:
    actual_keys = list(actual.keys())
    for field_name in expected:
        if allow_what_is and field_name == "What is":
            if not any(key.startswith("What is ") and key.endswith("?") for key in actual_keys):
                result.errors.append(f"{context} is missing required field '{field_name} ...?'")
            continue
        if field_name not in actual:
            result.errors.append(f"{context} is missing required field '{field_name}'")
    for field_name in actual_keys:
        if allow_what_is and field_name.startswith("What is ") and field_name.endswith("?"):
            continue
        if field_name not in expected:
            result.errors.append(f"{context} contains unrecognized field '{field_name}'")


def parse_general_doc(path: Path, result: ImportResult) -> ParsedGeneral:
    parsed = ParsedGeneral()
    current_h1: str | None = None
    current_process: str | None = None
    current_field: str | None = None

    for entry in docx_entries(path):
        if entry.style == "Navigation":
            continue
        if entry.style == "Title":
            continue
        if entry.style == "Heading 1":
            current_h1 = entry.text
            current_process = None
            current_field = None
            if current_h1 not in [
                "General QC Processes Landing Interface",
                "General QC Process Detail Interfaces",
                "Universal Field Reference",
            ]:
                result.errors.append(f"{path.name} contains unrecognized Heading 1 '{entry.text}'")
            continue
        if entry.style == "Heading 2":
            if current_h1 != "General QC Process Detail Interfaces":
                result.errors.append(f"{path.name} has unexpected Heading 2 '{entry.text}'")
                continue
            current_process = entry.text
            current_field = None
            parsed.processes.setdefault(current_process, {})
            continue
        if entry.style == "Heading 3":
            current_field = entry.text
            if current_h1 == "General QC Processes Landing Interface":
                parsed.landing.setdefault(current_field, [])
            elif current_h1 == "General QC Process Detail Interfaces" and current_process:
                parsed.processes[current_process].setdefault(current_field, [])
            elif current_h1 == "Universal Field Reference":
                parsed.universal.setdefault(current_field, [])
            else:
                result.errors.append(f"{path.name} has Heading 3 '{entry.text}' outside a valid block")
            continue
        if entry.style not in ["Normal", "List Bullet"]:
            result.errors.append(
                f"{path.name} has unsupported paragraph style '{entry.style}' for text '{entry.text}'"
            )
            continue
        if not current_h1 or not current_field:
            result.errors.append(f"{path.name} has unowned content '{entry.text}'")
            continue
        if current_h1 == "General QC Processes Landing Interface":
            parsed.landing[current_field].append(entry)
        elif current_h1 == "General QC Process Detail Interfaces" and current_process:
            parsed.processes[current_process][current_field].append(entry)
        elif current_h1 == "Universal Field Reference":
            parsed.universal[current_field].append(entry)

    require_fields(result, "General QC landing", parsed.landing, EXPECTED_GENERAL_LANDING_FIELDS)
    require_fields(result, "Universal Field Reference", parsed.universal, EXPECTED_UNIVERSAL_FIELDS)
    if list(parsed.processes.keys()) != GENERAL_PROCESS_TITLES:
        result.errors.append(
            "General QC process order or identity does not match the approved canonical set"
        )
    for title in GENERAL_PROCESS_TITLES:
        require_fields(
            result,
            f"General QC process '{title}'",
            parsed.processes.get(title, {}),
            EXPECTED_GENERAL_DETAIL_FIELDS,
        )
    return parsed


def parse_system_doc(path: Path, system_number: str, result: ImportResult) -> ParsedSystem:
    parsed = ParsedSystem(system_number=system_number)
    current_h1: str | None = None
    current_activity: str | None = None
    current_interface: str | None = None
    current_field: str | None = None
    activity_pattern = re.compile(r"^(\d+\.\d+)\s+(.+)$")

    for entry in docx_entries(path):
        if entry.style == "Navigation":
            continue
        if entry.style == "Title":
            continue
        if entry.style == "Heading 1":
            if entry.text in ["System Landing Interface", "Activity Detail Interfaces"]:
                current_h1 = entry.text
                current_activity = None
                current_interface = None
                current_field = None
                continue
            match = activity_pattern.match(entry.text)
            if match:
                current_h1 = "Activity"
                current_activity = match.group(1)
                parsed.activity_titles[current_activity] = match.group(2)
                current_interface = None
                current_field = None
                parsed.activities.setdefault(current_activity, {})
                continue
            result.errors.append(f"{path.name} contains unrecognized Heading 1 '{entry.text}'")
            continue
        if entry.style == "Heading 2":
            if current_h1 != "Activity" or not current_activity:
                result.errors.append(f"{path.name} has unexpected Heading 2 '{entry.text}'")
                continue
            current_interface = entry.text
            current_field = None
            parsed.activities[current_activity].setdefault(current_interface, {})
            continue
        if entry.style == "Heading 3":
            current_field = entry.text
            if current_h1 == "System Landing Interface":
                parsed.landing.setdefault(current_field, [])
            elif current_h1 == "Activity" and current_activity and current_interface:
                parsed.activities[current_activity][current_interface].setdefault(current_field, [])
            else:
                result.errors.append(f"{path.name} has Heading 3 '{entry.text}' outside a valid block")
            continue
        if entry.style not in ["Normal", "List Bullet"]:
            result.errors.append(
                f"{path.name} has unsupported paragraph style '{entry.style}' for text '{entry.text}'"
            )
            continue
        if current_h1 == "System Landing Interface" and current_field:
            parsed.landing[current_field].append(entry)
        elif current_h1 == "Activity" and current_activity and current_interface and current_field:
            parsed.activities[current_activity][current_interface][current_field].append(entry)
        elif entry.text != "Activity Detail Interfaces":
            result.errors.append(f"{path.name} has unowned content '{entry.text}'")

    expected_activity_ids = EXPECTED_SYSTEMS[system_number]["activities"]
    if list(parsed.activities.keys()) != expected_activity_ids:
        result.errors.append(
            f"System {system_number} activity order or identity does not match the approved canonical set"
        )
    require_fields(
        result,
        f"System {system_number} landing",
        parsed.landing,
        EXPECTED_SYSTEM_LANDING_FIELDS,
    )
    for activity_id in expected_activity_ids:
        interfaces = parsed.activities.get(activity_id, {})
        if list(interfaces.keys()) != EXPECTED_INTERFACES:
            result.errors.append(f"Activity {activity_id} does not contain the four required interfaces")
            continue
        require_fields(result, f"Activity {activity_id} Quick", interfaces["Quick"], EXPECTED_QUICK_FIELDS)
        require_fields(result, f"Activity {activity_id} Full", interfaces["Full"], EXPECTED_FULL_FIELDS)
        require_fields(
            result,
            f"Activity {activity_id} Learn",
            interfaces["Learn"],
            EXPECTED_LEARN_FIELDS,
            allow_what_is=True,
        )
        require_fields(
            result,
            f"Activity {activity_id} Contextual / Right Rail",
            interfaces["Contextual / Right Rail"],
            EXPECTED_CONTEXT_FIELDS,
        )
    return parsed


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def section_activity_file(section_id: str) -> Path:
    return REPO_ROOT / f"src/data/activities/section-{section_id}.json"


def section_quick_file(section_id: str) -> Path:
    return REPO_ROOT / f"src/data/quick/section-{section_id}.quick.json"


def section_learn_file(section_id: str) -> Path:
    return REPO_ROOT / f"src/data/learn/section-{section_id}.learn.json"


def write_json(path: Path, value: Any) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def paragraphs(entries: list[ParagraphEntry]) -> list[str]:
    return [entry.text for entry in entries]


def localized(existing: Any, en: str) -> dict[str, Any]:
    next_value = dict(existing) if isinstance(existing, dict) else {}
    next_value["en"] = en
    return next_value


def localized_join(existing: Any, entries: list[ParagraphEntry]) -> dict[str, Any]:
    return localized(existing, "\n".join(paragraphs(entries)))


def source_ref(source_file: str, section: str) -> dict[str, str]:
    return {
        "build": "Build 2",
        "document": source_file,
        "section": section,
    }


def flatten_content_items(blocks: Any) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    if not isinstance(blocks, list):
        return items
    for block in blocks:
        if not isinstance(block, dict):
            continue
        if block.get("type") in ["bulletList", "checkList"]:
            for item in block.get("items", []):
                if isinstance(item, dict):
                    items.append(item)
        elif block.get("type") in ["paragraph", "subheading", "notice"]:
            item = block.get("item")
            if isinstance(item, dict):
                items.append(item)
    return items


def content_item(
    existing: dict[str, Any] | None,
    item_id: str,
    text: str,
    source_file: str,
    field_path: str,
) -> dict[str, Any]:
    item = copy.deepcopy(existing) if isinstance(existing, dict) else {"id": item_id}
    item["id"] = item.get("id") or item_id
    item["text"] = localized(item.get("text"), text)
    item["sourceRef"] = source_ref(source_file, field_path)
    return item


def entries_to_blocks(
    entries: list[ParagraphEntry],
    existing_blocks: Any,
    prefix: str,
    source_file: str,
    field_path: str,
    list_type: str = "bulletList",
) -> list[dict[str, Any]]:
    existing_items = flatten_content_items(existing_blocks)
    existing_index = 0
    block_index = 1
    blocks: list[dict[str, Any]] = []
    index = 0
    while index < len(entries):
        entry = entries[index]
        if entry.style == "List Bullet":
            list_items: list[dict[str, Any]] = []
            while index < len(entries) and entries[index].style == "List Bullet":
                list_items.append(
                    content_item(
                        existing_items[existing_index]
                        if existing_index < len(existing_items)
                        else None,
                        f"{prefix}-{existing_index + 1}",
                        entries[index].text,
                        source_file,
                        field_path,
                    )
                )
                existing_index += 1
                index += 1
            blocks.append({"type": list_type, "items": list_items})
            block_index += 1
            continue
        blocks.append(
            {
                "type": "paragraph",
                "item": content_item(
                    existing_items[existing_index] if existing_index < len(existing_items) else None,
                    f"{prefix}-{existing_index + 1}",
                    entry.text,
                    source_file,
                    field_path,
                ),
            }
        )
        existing_index += 1
        block_index += 1
        index += 1
    return blocks


def localized_array(
    existing: Any,
    entries: list[ParagraphEntry],
) -> list[dict[str, Any]]:
    existing_items = existing if isinstance(existing, list) else []
    values: list[dict[str, Any]] = []
    for index, text in enumerate(paragraphs(entries)):
        values.append(localized(existing_items[index] if index < len(existing_items) else None, text))
    return values


def parse_workflow_entries(
    existing: Any,
    entries: list[ParagraphEntry],
    process_title: str,
    result: ImportResult,
) -> list[dict[str, Any]]:
    existing_items = existing if isinstance(existing, list) else []
    workflow: list[dict[str, Any]] = []
    pattern = re.compile(r"^(?:(\d+)[.)]\s*)?(.+?)(?:\s[-\u2013\u2014]\s)(.+)$")
    for index, text in enumerate(paragraphs(entries)):
        match = pattern.match(text)
        if not match:
            result.errors.append(
                f"General QC process '{process_title}' has an unparseable Field Workflow item '{text}'"
            )
            continue
        existing_item = existing_items[index] if index < len(existing_items) else {}
        sequence = int(match.group(1)) if match.group(1) else index + 1
        workflow.append(
            {
                "sequence": sequence,
                "action": localized(existing_item.get("action") if isinstance(existing_item, dict) else None, match.group(2)),
                "detail": localized(existing_item.get("detail") if isinstance(existing_item, dict) else None, match.group(3)),
            }
        )
    return workflow


def process_title_to_id(processes: list[dict[str, Any]]) -> dict[str, str]:
    return {
        process.get("title", {}).get("en", ""): process["id"]
        for process in processes
        if isinstance(process.get("title"), dict)
    }


def update_general_content(parsed: ParsedGeneral, result: ImportResult) -> None:
    processes = read_json(GENERAL_PROCESS_FILE)
    universal = read_json(GENERAL_UNIVERSAL_FILE)
    by_title = {process["title"]["en"]: process for process in processes}
    title_ids = process_title_to_id(processes)

    for title in GENERAL_PROCESS_TITLES:
        source_fields = parsed.processes[title]
        process = by_title.get(title)
        if not process:
            result.errors.append(f"General QC process '{title}' was not found in existing canonical data")
            continue
        process["title"] = localized(process.get("title"), title)
        process["summary"] = localized_join(process.get("summary"), source_fields["Summary"])
        process["whenToUse"] = localized_join(process.get("whenToUse"), source_fields["When to Use"])
        process["fieldWorkflow"] = parse_workflow_entries(
            process.get("fieldWorkflow"),
            source_fields["Field Workflow"],
            title,
            result,
        )
        process["whatToCapture"] = localized_array(
            process.get("whatToCapture"),
            source_fields["What to Capture"],
        )
        process["commonMistakes"] = localized_array(
            process.get("commonMistakes"),
            source_fields["Common Mistakes"],
        )
        process["keyReminders"] = localized_array(
            process.get("keyReminders"),
            source_fields["Key Reminders"],
        )
        process["typicalOutputs"] = localized_array(
            process.get("typicalOutputs"),
            source_fields["Typical Outputs"],
        )

        related_ids: list[str] = []
        for related_title in paragraphs(source_fields["Related Processes"]):
            if related_title not in title_ids:
                result.errors.append(
                    f"General QC process '{title}' references unknown related process '{related_title}'"
                )
                continue
            related_ids.append(title_ids[related_title])
        process["relatedProcessIds"] = related_ids

    universal["fieldPrinciple"] = localized_array(
        universal.get("fieldPrinciple"),
        parsed.universal["Field Principle"],
    )
    universal["beforeAnyInspection"] = localized_array(
        universal.get("beforeAnyInspection"),
        parsed.universal["Before Any Inspection"],
    )
    universal["whenYouFindAProblem"] = localized_array(
        universal.get("whenYouFindAProblem"),
        parsed.universal["When You Find a Problem"],
    )
    universal["importantLimitations"] = localized_array(
        universal.get("importantLimitations"),
        parsed.universal["Important Limitations"],
    )
    universal["minimumUsefulQualityRecord"] = parse_minimum_quality_record(
        universal.get("minimumUsefulQualityRecord"),
        parsed.universal["Minimum Useful Quality Record"],
        result,
    )

    for field_name, reason in UNMAPPED_FIELDS["generalLanding"].items():
        if paragraphs(parsed.landing.get(field_name, [])):
            result.warnings.append(f"General QC landing '{field_name}' not imported: {reason}")

    result.fail_if_errors()
    write_json(GENERAL_PROCESS_FILE, processes)
    write_json(GENERAL_UNIVERSAL_FILE, universal)
    result.counts["generalProcesses"] = len(processes)


def parse_minimum_quality_record(
    existing: Any,
    entries: list[ParagraphEntry],
    result: ImportResult,
) -> list[dict[str, Any]]:
    existing_items = existing if isinstance(existing, list) else []
    records: list[dict[str, Any]] = []
    values = paragraphs(entries)
    if len(values) % 2 != 0:
        result.errors.append("Minimum Useful Quality Record must contain key/question pairs")
        return records
    for pair_index in range(0, len(values), 2):
        index = pair_index // 2
        existing_item = existing_items[index] if index < len(existing_items) else {}
        key_text = values[pair_index]
        question_text = values[pair_index + 1]
        records.append(
            {
                "key": localized(
                    existing_item.get("key") if isinstance(existing_item, dict) else None,
                    key_text,
                ),
                "question": localized(
                    existing_item.get("question") if isinstance(existing_item, dict) else None,
                    question_text,
                ),
            }
        )
    return records


def activity_field_prefix(activity_id: str, field_name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", f"{activity_id}-{field_name}").strip("-").lower()
    return cleaned


def update_system_content(system: ParsedSystem, result: ImportResult) -> None:
    sections = read_json(SECTIONS_FILE)

    section_id = EXPECTED_SYSTEMS[system.system_number]["sectionId"]
    file_stem = EXPECTED_SYSTEMS[system.system_number]["fileStem"]
    activities_file = section_activity_file(file_stem)
    quick_file = section_quick_file(file_stem)
    learn_file = section_learn_file(file_stem)
    activities = read_json(activities_file)
    quick_views = read_json(quick_file)
    learn_content = read_json(learn_file)

    section = next((item for item in sections if item.get("id") == section_id), None)
    if not section:
        result.errors.append(f"System {system.system_number} section '{section_id}' was not found")
        result.fail_if_errors()
    description_entries = system.landing.get("Description", [])
    if description_entries:
        section["description"] = localized_join(section.get("description"), description_entries)

    activity_by_id = {activity["id"]: activity for activity in activities}
    quick_by_activity = {view["activityId"]: view for view in quick_views}
    learn_by_activity = {learn["activityId"]: learn for learn in learn_content}

    for activity_id in EXPECTED_SYSTEMS[system.system_number]["activities"]:
        parsed_activity = system.activities[activity_id]
        activity = activity_by_id.get(activity_id)
        quick = quick_by_activity.get(activity_id)
        learn = learn_by_activity.get(activity_id)
        if not activity:
            result.errors.append(f"Activity '{activity_id}' was not found in existing canonical data")
            continue
        if not quick:
            result.errors.append(f"QuickView for activity '{activity_id}' was not found")
            continue
        if not learn:
            result.errors.append(f"LearnContent for activity '{activity_id}' was not found")
            continue

        title = system.activity_titles.get(activity_id)
        if title:
            activity["title"] = localized(activity.get("title"), title)

        source_file = SOURCE_DOCS[EXPECTED_SYSTEMS[system.system_number]["sourceKey"]].name
        update_quick(activity_id, quick, parsed_activity["Quick"], source_file, result)
        update_full(activity_id, activity, parsed_activity["Full"], source_file)
        update_learn(activity_id, learn, parsed_activity["Learn"], source_file, result)

        for field_name, reason in UNMAPPED_FIELDS["context"].items():
            if paragraphs(parsed_activity["Contextual / Right Rail"].get(field_name, [])):
                result.warnings.append(
                    f"Activity {activity_id} Contextual / Right Rail '{field_name}' not imported: {reason}"
                )

    result.fail_if_errors()
    write_json(SECTIONS_FILE, sections)
    write_json(activities_file, activities)
    write_json(quick_file, quick_views)
    write_json(learn_file, learn_content)
    result.counts[f"system{system.system_number}Activities"] = len(
        EXPECTED_SYSTEMS[system.system_number]["activities"]
    )


def update_quick(
    activity_id: str,
    quick: dict[str, Any],
    fields: dict[str, list[ParagraphEntry]],
    source_file: str,
    result: ImportResult,
) -> None:
    quick_mapping = {
        "Before": "before",
        "Inspect": "inspect",
        "Evidence": "evidence",
        "Watch For": "watchFor",
        "Do Not Miss": "dontMiss",
    }
    for source_field, destination_field in quick_mapping.items():
        quick[destination_field] = entries_to_blocks(
            fields[source_field],
            quick.get(destination_field),
            activity_field_prefix(activity_id, f"quick-{destination_field}"),
            source_file,
            f"{activity_id} Quick {source_field}",
            list_type="checkList",
        )
    quick["fieldTip"] = localized_join(quick.get("fieldTip"), fields["Field Tip"])
    for field_name, reason in UNMAPPED_FIELDS["quick"].items():
        if paragraphs(fields.get(field_name, [])):
            result.warnings.append(f"Activity {activity_id} Quick '{field_name}' not imported: {reason}")


def update_full(
    activity_id: str,
    activity: dict[str, Any],
    fields: dict[str, list[ParagraphEntry]],
    source_file: str,
) -> None:
    single_field_mapping = {
        "Quality Objective": "qualityObjective",
        "Applicability": "applicability",
        "Authority Note": "authorityNote",
    }
    for source_field, destination_field in single_field_mapping.items():
        activity[destination_field] = localized_join(activity.get(destination_field), fields[source_field])

    block_mapping = {
        "Document Control": ("documentControl",),
        "Requirements": ("requirements",),
        "Planning": ("planning",),
        "Material Control": ("materialControl",),
        "Before Inspection": ("inspection", "before"),
        "During Inspection": ("inspection", "during"),
        "Testing": ("inspection", "testing"),
        "Evidence": ("evidence",),
        "Common Deficiencies": ("issues", "commonDeficiencies"),
        "Escalation Triggers": ("issues", "escalationTriggers"),
        "Corrective Action": ("correctiveAction",),
        "Verification": ("verification",),
        "After Inspection": ("inspection", "after"),
        "Closure Criteria": ("closureCriteria",),
        "Reporting Analysis": ("reportingAnalysis",),
        "Inspection & Hold/Witness Points": ("qualityCheckpoint",),
        "Records": ("outputs", "records"),
        "Acceptance Evidence": ("outputs", "acceptanceEvidence"),
        "Follow-up": ("outputs", "followUp"),
        "Communications": ("communications", "before"),
        "During Communications": ("communications", "during"),
        "Issue Escalation Communications": ("communications", "issueEscalation"),
        "After Communications": ("communications", "after"),
    }
    for source_field, path in block_mapping.items():
        if not fields[source_field]:
            continue
        parent = activity
        for segment in path[:-1]:
            parent = parent.setdefault(segment, {})
        destination = path[-1]
        parent[destination] = entries_to_blocks(
            fields[source_field],
            parent.get(destination),
            activity_field_prefix(activity_id, f"full-{destination}"),
            source_file,
            f"{activity_id} Full {source_field}",
            list_type="bulletList",
        )

    if fields["Specialist Boundary"]:
        existing = activity.get("specialistBoundary")
        existing_item = existing if isinstance(existing, dict) else None
        activity["specialistBoundary"] = content_item(
            existing_item,
            activity_field_prefix(activity_id, "full-specialist-boundary"),
            "\n".join(paragraphs(fields["Specialist Boundary"])),
            source_file,
            f"{activity_id} Full Specialist Boundary",
        )


def update_learn(
    activity_id: str,
    learn: dict[str, Any],
    fields: dict[str, list[ParagraphEntry]],
    source_file: str,
    result: ImportResult,
) -> None:
    what_is_field = next(field for field in fields if field.startswith("What is "))
    learn["whatIsThis"] = entries_to_blocks(
        fields[what_is_field],
        learn.get("whatIsThis"),
        activity_field_prefix(activity_id, "learn-what-is-this"),
        source_file,
        f"{activity_id} Learn {what_is_field}",
        list_type="bulletList",
    )
    learn["whyItMatters"] = entries_to_blocks(
        fields["Why It Matters"],
        learn.get("whyItMatters"),
        activity_field_prefix(activity_id, "learn-why-it-matters"),
        source_file,
        f"{activity_id} Learn Why It Matters",
        list_type="bulletList",
    )
    learn["howGoodWorkLooks"] = entries_to_blocks(
        fields["Key Principles"],
        learn.get("howGoodWorkLooks"),
        activity_field_prefix(activity_id, "learn-key-principles"),
        source_file,
        f"{activity_id} Learn Key Principles",
        list_type="bulletList",
    )
    learn["commonFailures"] = entries_to_blocks(
        fields["Common Failures"],
        learn.get("commonFailures"),
        activity_field_prefix(activity_id, "learn-common-failures"),
        source_file,
        f"{activity_id} Learn Common Failures",
        list_type="bulletList",
    )
    learn["interfacesAndSequence"] = entries_to_blocks(
        fields["Interfaces & Sequence"],
        learn.get("interfacesAndSequence"),
        activity_field_prefix(activity_id, "learn-interfaces-sequence"),
        source_file,
        f"{activity_id} Learn Interfaces & Sequence",
        list_type="bulletList",
    )
    learn["specialistAuthorityBoundary"] = localized_join(
        learn.get("specialistAuthorityBoundary"),
        fields["Specialist / Authority Boundary"],
    )
    learn["practicalExamples"] = practical_examples(
        learn.get("practicalExamples"),
        fields["Practical Examples"],
        activity_id,
    )
    for field_name, reason in UNMAPPED_FIELDS["learn"].items():
        if paragraphs(fields.get(field_name, [])):
            result.warnings.append(f"Activity {activity_id} Learn '{field_name}' not imported: {reason}")


def practical_examples(
    existing: Any,
    entries: list[ParagraphEntry],
    activity_id: str,
) -> list[dict[str, Any]]:
    existing_items = existing if isinstance(existing, list) else []
    examples: list[dict[str, Any]] = []
    for index, text in enumerate(paragraphs(entries)):
        existing_item = existing_items[index] if index < len(existing_items) else {}
        examples.append(
            {
                "id": existing_item.get("id", f"{activity_id}-practical-example-{index + 1}")
                if isinstance(existing_item, dict)
                else f"{activity_id}-practical-example-{index + 1}",
                "situation": localized(
                    existing_item.get("situation") if isinstance(existing_item, dict) else None,
                    text,
                ),
            }
        )
    return examples


def validate_imported_content(result: ImportResult) -> None:
    processes = read_json(GENERAL_PROCESS_FILE)
    universal = read_json(GENERAL_UNIVERSAL_FILE)
    activities: list[dict[str, Any]] = []
    quick_views: list[dict[str, Any]] = []
    learn_content: list[dict[str, Any]] = []
    for system_config in EXPECTED_SYSTEMS.values():
        file_stem = system_config["fileStem"]
        activities.extend(read_json(section_activity_file(file_stem)))
        quick_views.extend(read_json(section_quick_file(file_stem)))
        learn_content.extend(read_json(section_learn_file(file_stem)))

    if len(processes) != 16:
        result.errors.append(f"Expected 16 General QC process records; found {len(processes)}")
    for process in processes:
        for field_name in [
            "summary",
            "whenToUse",
            "fieldWorkflow",
            "whatToCapture",
            "commonMistakes",
            "keyReminders",
            "typicalOutputs",
            "relatedProcessIds",
        ]:
            if not process.get(field_name):
                result.errors.append(f"General QC process '{process.get('id')}' has empty field '{field_name}'")
    for field_name in [
        "fieldPrinciple",
        "beforeAnyInspection",
        "whenYouFindAProblem",
        "minimumUsefulQualityRecord",
        "importantLimitations",
    ]:
        if not universal.get(field_name):
            result.errors.append(f"Universal Field Reference has empty field '{field_name}'")

    activity_by_id = {activity["id"]: activity for activity in activities}
    quick_by_activity = {view["activityId"]: view for view in quick_views}
    learn_by_activity = {learn["activityId"]: learn for learn in learn_content}
    for system_number, system_config in EXPECTED_SYSTEMS.items():
        for activity_id in system_config["activities"]:
            activity = activity_by_id.get(activity_id)
            quick = quick_by_activity.get(activity_id)
            learn = learn_by_activity.get(activity_id)
            if not activity or not quick or not learn:
                result.errors.append(f"Activity '{activity_id}' is missing an Activity, QuickView, or LearnContent record")
                continue
            for quick_field in ["before", "inspect", "evidence", "watchFor", "dontMiss"]:
                if not quick.get(quick_field):
                    result.errors.append(f"Activity '{activity_id}' Quick field '{quick_field}' is empty")
            if not quick.get("fieldTip", {}).get("en"):
                result.errors.append(f"Activity '{activity_id}' Quick fieldTip is empty")
            for learn_field in [
                "whatIsThis",
                "whyItMatters",
                "howGoodWorkLooks",
                "commonFailures",
                "practicalExamples",
                "interfacesAndSequence",
                "specialistAuthorityBoundary",
            ]:
                if not learn.get(learn_field):
                    result.errors.append(f"Activity '{activity_id}' Learn field '{learn_field}' is empty")
            if activity.get("sectionId") != system_config["sectionId"]:
                result.errors.append(
                    f"Activity '{activity_id}' belongs to section '{activity.get('sectionId')}', not '{system_config['sectionId']}'"
                )
        result.counts[f"system{system_number}Activities"] = len(system_config["activities"])
    result.fail_if_errors()


def run_import(dry_run: bool = False) -> ImportResult:
    result = ImportResult()
    parsed_general = parse_general_doc(SOURCE_DOCS["general"], result)
    parsed_systems = [
        parse_system_doc(SOURCE_DOCS[system_config["sourceKey"]], system_number, result)
        for system_number, system_config in EXPECTED_SYSTEMS.items()
    ]
    result.fail_if_errors()

    system_files = [
        path
        for system_config in EXPECTED_SYSTEMS.values()
        for path in [
            section_activity_file(system_config["fileStem"]),
            section_quick_file(system_config["fileStem"]),
            section_learn_file(system_config["fileStem"]),
        ]
    ]
    before = {
        path: read_json(path)
        for path in [
            GENERAL_PROCESS_FILE,
            GENERAL_UNIVERSAL_FILE,
            SECTIONS_FILE,
            *system_files,
        ]
    }
    if not dry_run:
        update_general_content(parsed_general, result)
        for parsed_system in parsed_systems:
            update_system_content(parsed_system, result)
        validate_imported_content(result)
    else:
        result.counts["generalProcesses"] = len(parsed_general.processes)
        for parsed_system in parsed_systems:
            result.counts[f"system{parsed_system.system_number}Activities"] = len(parsed_system.activities)

    after = {
        path: read_json(path)
        for path in before
    } if not dry_run else before
    result.counts["changedFiles"] = sum(1 for path in before if before[path] != after[path])
    result.counts["importTimestampUtc"] = int(datetime.now(timezone.utc).timestamp())
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    result = run_import(dry_run=args.dry_run)
    print(json.dumps({"counts": result.counts, "warnings": result.warnings}, indent=2))


if __name__ == "__main__":
    main()
