"""Import revised French content into existing canonical JSON.

The importer reads supplied French DOCX files by Word paragraph style and
heading order, then updates only French values in existing canonical JSON. It
never creates IDs, changes English values, or writes until every selected source
and target shape has passed validation.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from docx import Document


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_GENERAL = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Processus-generaux-controle-qualite-FR-REVISE.docx"
)
DEFAULT_SYSTEM_01 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Systeme 01-Travaux-de-site-et-terrassement-FR-REVISE.docx"
)
DEFAULT_SYSTEM_02 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Systeme 02-Sous-structure-FR-REVISE.docx"
)
DEFAULT_SYSTEM_03 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Systeme 03-Superstructure-FR-REVISE.docx"
)
DEFAULT_SYSTEM_04 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 04 Enveloppe du bâtiment - français révisé.docx"
)
DEFAULT_SYSTEM_05 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 05 Toiture - français révisé.docx"
)
DEFAULT_SYSTEM_06 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 06 Construction architecturale intérieure - français révisé.docx"
)
DEFAULT_SYSTEM_07 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 07 Finitions - français révisé.docx"
)
DEFAULT_SYSTEM_08 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 08 Services mécaniques - français révisé.docx"
)
DEFAULT_SYSTEM_09 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 09 Services électriques du bâtiment - français révisé.docx"
)
DEFAULT_SYSTEM_10 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 10 Construction résistante au feu et sécurité des occupants - français révisé.docx"
)
DEFAULT_SYSTEM_11 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 11 Interfaces multidisciplinaires - français révisé.docx"
)
DEFAULT_SYSTEM_12 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 12 Travaux extérieurs - français révisé.docx"
)
DEFAULT_SYSTEM_13 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 13 Essais, mise en service et acceptation des systèmes - français révisé.docx"
)
DEFAULT_SYSTEM_14 = Path(
    r"C:/Users/emmad/Music/french finalized/"
    r"Système 14 Déficiences, achèvement et clôture - français révisé.docx"
)

SYSTEM_ACTIVITY_IDS = {
    "01": [f"1.{index}" for index in range(1, 8)],
    "02": [f"2.{index}" for index in range(1, 13)],
    "03": [f"3.{index}" for index in range(1, 9)],
    "04": [f"4.{index}" for index in range(1, 11)],
    "05": [f"5.{index}" for index in range(1, 10)],
    "06": [f"6.{index}" for index in range(1, 10)],
    "07": [f"7.{index}" for index in range(1, 8)],
    "08": [f"8.{index}" for index in range(1, 12)],
    "09": [f"9.{index}" for index in range(1, 12)],
    "10": [f"10.{index}" for index in range(1, 9)],
    "11": [f"11.{index}" for index in range(1, 12)],
    "12": [f"12.{index}" for index in range(1, 11)],
    "13": [f"13.{index}" for index in range(1, 12)],
    "14": [f"14.{index}" for index in range(1, 16)],
}

SYSTEM_SOURCE_DEFAULTS = {
    "01": DEFAULT_SYSTEM_01,
    "02": DEFAULT_SYSTEM_02,
    "03": DEFAULT_SYSTEM_03,
    "04": DEFAULT_SYSTEM_04,
    "05": DEFAULT_SYSTEM_05,
    "06": DEFAULT_SYSTEM_06,
    "07": DEFAULT_SYSTEM_07,
    "08": DEFAULT_SYSTEM_08,
    "09": DEFAULT_SYSTEM_09,
    "10": DEFAULT_SYSTEM_10,
    "11": DEFAULT_SYSTEM_11,
    "12": DEFAULT_SYSTEM_12,
    "13": DEFAULT_SYSTEM_13,
    "14": DEFAULT_SYSTEM_14,
}

INTERFACE_ORDER = ["Quick", "Full", "Learn", "Contextual / Right Rail"]


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def norm(value: str) -> str:
    without_accents = "".join(
        char
        for char in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(char)
    )
    return re.sub(r"[^a-z0-9]+", " ", without_accents.lower()).strip()


def localized_set(value: Any, french: str, context: str) -> None:
    if not isinstance(value, dict) or not isinstance(value.get("en"), str):
        raise ValueError(f"{context} does not contain a localized value")
    value["fr"] = french
    status = value.get("status")
    if not isinstance(status, dict):
        status = {}
        value["status"] = status
    status["fr"] = "validated"


def localized_text(value: Any, context: str) -> str:
    if not isinstance(value, dict) or not isinstance(value.get("en"), str):
        raise ValueError(f"{context} does not contain a localized value")
    return value["en"]


def source_entries(document_path: Path) -> list[tuple[str, str]]:
    if not document_path.exists():
        raise FileNotFoundError(document_path)
    entries: list[tuple[str, str]] = []
    for paragraph in Document(str(document_path)).paragraphs:
        text = clean_text(paragraph.text)
        if not text:
            continue
        entries.append((paragraph.style.name, text))
    return entries


def strip_system_title(title: str, system_number: str) -> str:
    pattern = rf"^\s*syst[eè]me\s+{re.escape(system_number)}\s*[–—-]?\s*"
    return re.sub(pattern, "", title, flags=re.IGNORECASE).strip()


@dataclass
class ParseResult:
    kind: str
    system_number: str | None = None
    title: str = ""
    landing: dict[str, list[str]] = field(default_factory=dict)
    processes: list[tuple[str, dict[str, list[str]]]] = field(default_factory=list)
    universal: dict[str, list[str]] = field(default_factory=dict)
    activities: dict[str, dict[str, dict[str, list[str]]]] = field(default_factory=dict)
    activity_titles: dict[str, str] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)


def add_value(target: dict[str, list[str]], key: str, text: str) -> None:
    target.setdefault(key, []).append(text)


def parse_general(document_path: Path) -> ParseResult:
    result = ParseResult(kind="general")
    current_h1: str | None = None
    current_process: dict[str, list[str]] | None = None
    current_field: str | None = None
    process_titles: list[str] = []
    h1_map = {
        norm("Interface d'accueil des processus généraux de contrôle qualité"): "landing",
        norm("Interfaces détaillées des processus généraux de contrôle qualité"): "details",
        norm("Référence terrain universelle"): "universal",
    }
    field_map = {
        norm("Titre"): "Title",
        norm("Sous-titres"): "Subtitle",
        norm("Tous les processus qualité"): "All Processes",
        norm("Processus couramment utilisés"): "Commonly Used",
        norm("Conseils sur le terrain"): "Field Tips",
        norm("Résumé"): "Summary",
        norm("Quand utiliser"): "When to Use",
        norm("Flux de travail sur le terrain"): "Field Workflow",
        norm("Éléments à consigner"): "What to Capture",
        norm("Erreurs courantes"): "Common Mistakes",
        norm("Rappels clés"): "Key Reminders",
        norm("Livrables typiques"): "Typical Outputs",
        norm("Processus connexes"): "Related Processes",
        norm("Principe de champ"): "Field Principle",
        norm("Avant toute inspection"): "Before Any Inspection",
        norm("Lorsqu'un problème est constaté"): "When You Find a Problem",
        norm("Contenu minimal d'un dossier qualité utile"): "Minimum Useful Quality Record",
        norm("Limites importantes"): "Important Limitations",
    }

    for style, text in source_entries(document_path):
        if style == "Navigation" or style == "Title":
            if style == "Title":
                result.title = text
            continue
        if style == "Heading 1":
            current_h1 = h1_map.get(norm(text))
            current_process = None
            current_field = None
            if current_h1 is None:
                result.errors.append(f"{document_path.name}: unrecognized Heading 1 '{text}'")
            continue
        if style == "Heading 2":
            if current_h1 != "details":
                result.errors.append(f"{document_path.name}: unexpected Heading 2 '{text}'")
                continue
            current_process = {}
            result.processes.append((text, current_process))
            process_titles.append(text)
            current_field = None
            continue
        if style == "Heading 3":
            canonical_field = field_map.get(norm(text))
            if canonical_field is None:
                result.errors.append(f"{document_path.name}: unrecognized Heading 3 '{text}'")
                current_field = None
                continue
            current_field = canonical_field
            if current_h1 == "landing":
                result.landing.setdefault(canonical_field, [])
            elif current_h1 == "details" and current_process is not None:
                current_process.setdefault(canonical_field, [])
            elif current_h1 == "universal":
                result.universal.setdefault(canonical_field, [])
            else:
                result.errors.append(f"{document_path.name}: Heading 3 '{text}' is outside a valid block")
            continue
        if style not in {"Normal", "List Bullet"}:
            result.errors.append(f"{document_path.name}: unsupported paragraph style '{style}'")
            continue
        if not current_h1 or not current_field:
            result.errors.append(f"{document_path.name}: unowned content '{text}'")
            continue
        if current_h1 == "landing":
            add_value(result.landing, current_field, text)
        elif current_h1 == "details" and current_process is not None:
            add_value(current_process, current_field, text)
        elif current_h1 == "universal":
            add_value(result.universal, current_field, text)

    if len(result.processes) != 16:
        result.errors.append(f"{document_path.name}: expected 16 processes; found {len(result.processes)}")
    if len(set(process_titles)) != len(process_titles):
        result.errors.append(f"{document_path.name}: duplicate process headings detected")
    return result


def parse_system(document_path: Path, system_number: str) -> ParseResult:
    result = ParseResult(kind="system", system_number=system_number)
    current_h1: str | None = None
    current_activity: str | None = None
    current_interface: str | None = None
    current_field: str | None = None
    h1_map = {
        norm("Interface d'accueil du système"): "landing",
        norm("Interfaces détaillées des activités"): "details",
    }
    interface_map = {
        norm("Rapide"): "Quick",
        norm("Complet"): "Full",
        norm("Aperçu"): "Quick",
        norm("Détails"): "Full",
        norm("Apprendre"): "Learn",
        norm("Contextuel / Volet droit"): "Contextual / Right Rail",
        norm("Contexte / Volet droit"): "Contextual / Right Rail",
    }
    field_map = {
        norm("Description"): "Description",
        norm("Deprocédure d’essaiion"): "Description",
        norm("Activités dans ce système"): "Activities in this System",
        norm("Avant"): "Before",
        norm("Inspecter"): "Inspect",
        norm("Preuves"): "Evidence",
        norm("Points de vigilance"): "Watch For",
        norm("Surveillez"): "Watch For",
        norm("Points à ne pas manquer"): "Do Not Miss",
        norm("Ne manquez pas"): "Do Not Miss",
        norm("Conseil terrain"): "Field Tip",
        norm("Ce que cette activité couvre"): "What This Activity Covers",
        norm("Étape"): "Stage",
        norm("Phase"): "Stage",
        norm("Criticité"): "Criticality",
        norm("Impact sur la qualité"): "Quality Impact",
        norm("Objectif de qualité"): "Quality Objective",
        norm("Applicabilité"): "Applicability",
        norm("Autorité et références"): "Authority & References",
        norm("Note d'autorité"): "Authority Note",
        norm("Contrôle des documents"): "Document Control",
        norm("Communications"): "Communications",
        norm("Exigences"): "Requirements",
        norm("Planification et préparation"): "Planning & Preparation",
        norm("Planification"): "Planning",
        norm("Contrôle des matériaux"): "Material Control",
        norm("Avant l'inspection"): "Before Inspection",
        norm("Avant inspection"): "Before Inspection",
        norm("Exécution"): "Execution",
        norm("Pendant l'inspection"): "During Inspection",
        norm("Pendant la communication"): "During Communications",
        norm("Pendant les communications"): "During Communications",
        norm("Points d'arrêt et points témoins"): "Inspection & Hold/Witness Points",
        norm("Inspection et points d'arrêt/de surveillance"): "Inspection & Hold/Witness Points",
        norm("Essais"): "Testing",
        norm("Preuves et documentation"): "Evidence & Documentation",
        norm("Dossiers"): "Records",
        norm("Registres"): "Records",
        norm("Preuves d'acceptation"): "Acceptance Evidence",
        norm("Analyse des tendances"): "Reporting Analysis",
        norm("Rapports et analyse"): "Reporting Analysis",
        norm("Déficiences courantes"): "Common Deficiencies",
        norm("Critères de remontée"): "Escalation Triggers",
        norm("Déclencheurs d'escalade"): "Escalation Triggers",
        norm("Communication et remontée des problèmes"): "Issue Escalation Communications",
        norm("Communications d'escalade des problèmes"): "Issue Escalation Communications",
        norm("Action corrective"): "Corrective Action",
        norm("Mesures correctives"): "Corrective Action",
        norm("Vérification"): "Verification",
        norm("Acceptation et clôture"): "Acceptance & Closure",
        norm("Après l'inspection"): "After Inspection",
        norm("Après inspection"): "After Inspection",
        norm("Critères de clôture"): "Closure Criteria",
        norm("Suivi"): "Follow-up",
        norm("Après communication"): "After Communications",
        norm("Limites de responsabilité des spécialistes"): "Specialist Boundary",
        norm("Limite de responsabilité spécialisée"): "Specialist Boundary",
        norm("Pourquoi c'est important"): "Why It Matters",
        norm("Principes clés"): "Key Principles",
        norm("Comment ça fonctionne (en un coup d'œil)"): "How it works (at a glance)",
        norm("Interfaces communes"): "Common Interfaces",
        norm("Matériaux typiques"): "Typical Materials",
        norm("Termes à connaître"): "Terms to Know",
        norm("Défaillances courantes"): "Common Failures",
        norm("Exemples pratiques"): "Practical Examples",
        norm("Interfaces et séquence"): "Interfaces & Sequence",
        norm("Limites de responsabilité — spécialiste et autorité"): "Specialist / Authority Boundary",
        norm("Limite de responsabilité / Autorité compétente"): "Specialist / Authority Boundary",
        norm("Travaux suivants ou connexes — avant"): "Next / Related Work - Before",
        norm("Travaux suivants ou connexes — après"): "Next / Related Work - After",
        norm("Travaux connexes — Avant"): "Next / Related Work - Before",
        norm("Travaux connexes — Après"): "Next / Related Work - After",
        norm("Systèmes connexes"): "Related Systems",
        norm("Inspections connexes"): "Related Inspections",
        norm("Action"): "Action",
    }

    activity_pattern = re.compile(r"^(\d+\.\d+)\s+(.+)$")
    for style, text in source_entries(document_path):
        if style == "Navigation":
            continue
        if style == "Title":
            result.title = text
            continue
        if style == "Heading 1":
            mapped_h1 = h1_map.get(norm(text))
            match = activity_pattern.match(text)
            if mapped_h1:
                current_h1 = mapped_h1
                current_activity = None
                current_interface = None
                current_field = None
            elif match:
                current_h1 = "activity"
                current_activity = match.group(1)
                result.activity_titles[current_activity] = match.group(2).strip()
                result.activities.setdefault(current_activity, {})
                current_interface = None
                current_field = None
            else:
                result.errors.append(f"{document_path.name}: unrecognized Heading 1 '{text}'")
            continue
        if style == "Heading 2":
            if current_h1 != "activity" or not current_activity:
                result.errors.append(f"{document_path.name}: unexpected Heading 2 '{text}'")
                continue
            current_interface = interface_map.get(norm(text))
            if current_interface is None:
                result.errors.append(f"{document_path.name}: unrecognized interface '{text}'")
                continue
            result.activities[current_activity].setdefault(current_interface, {})
            current_field = None
            continue
        if style == "Heading 3":
            if current_h1 == "activity" and current_interface == "Learn" and (
                norm(text).startswith("qu est ce que")
                or norm(text).startswith("qu est ce qu")
                or norm(text).startswith("que couvre l activite")
            ):
                current_field = "What is"
            else:
                current_field = field_map.get(norm(text))
            if current_field is None:
                result.errors.append(f"{document_path.name}: unrecognized Heading 3 '{text}'")
                continue
            if current_h1 == "landing":
                result.landing.setdefault(current_field, [])
            elif current_h1 == "activity" and current_activity and current_interface:
                result.activities[current_activity][current_interface].setdefault(current_field, [])
            else:
                result.errors.append(f"{document_path.name}: Heading 3 '{text}' is outside a valid block")
            continue
        if style not in {"Normal", "List Bullet"}:
            result.errors.append(f"{document_path.name}: unsupported paragraph style '{style}'")
            continue
        if current_h1 == "landing" and current_field:
            add_value(result.landing, current_field, text)
        elif current_h1 == "activity" and current_activity and current_interface and current_field:
            add_value(result.activities[current_activity][current_interface], current_field, text)
        else:
            result.errors.append(f"{document_path.name}: unowned content '{text}'")

    expected = SYSTEM_ACTIVITY_IDS[system_number]
    if list(result.activities) != expected:
        result.errors.append(
            f"{document_path.name}: activity order/identity mismatch; expected {expected}, found {list(result.activities)}"
        )
    for activity_id in expected:
        interfaces = result.activities.get(activity_id, {})
        if list(interfaces) != INTERFACE_ORDER:
            result.errors.append(
                f"{document_path.name}: activity {activity_id} interface order mismatch; found {list(interfaces)}"
            )
    return result


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def get_nested(value: dict[str, Any], path: str) -> Any:
    current: Any = value
    for segment in path.split("."):
        if not isinstance(current, dict) or segment not in current:
            raise ValueError(f"Missing target field '{path}'")
        current = current[segment]
    return current


def content_items(blocks: Any, context: str) -> list[dict[str, Any]]:
    if not isinstance(blocks, list):
        raise ValueError(f"{context} is not a content-block array")
    items: list[dict[str, Any]] = []
    for block in blocks:
        if not isinstance(block, dict):
            raise ValueError(f"{context} contains a malformed content block")
        if isinstance(block.get("item"), dict):
            items.append(block["item"])
        elif isinstance(block.get("items"), list):
            for item in block["items"]:
                if not isinstance(item, dict):
                    raise ValueError(f"{context} contains a malformed content item")
                items.append(item)
    if not items:
        raise ValueError(f"{context} contains no content items")
    return items


def apply_content_blocks(blocks: Any, french_values: list[str], context: str) -> None:
    items = content_items(blocks, context)
    if len(items) != len(french_values):
        raise ValueError(
            f"{context} item count mismatch: target has {len(items)}, source has {len(french_values)}"
        )
    for index, (item, french) in enumerate(zip(items, french_values, strict=True), start=1):
        localized_set(item.get("text"), french, f"{context} item {index}")


def apply_simple_array(values: Any, french_values: list[str], context: str) -> None:
    if not isinstance(values, list):
        raise ValueError(f"{context} is not an array")
    if len(values) != len(french_values):
        raise ValueError(
            f"{context} item count mismatch: target has {len(values)}, source has {len(french_values)}"
        )
    for index, (value, french) in enumerate(zip(values, french_values, strict=True), start=1):
        localized_set(value, french, f"{context} item {index}")


def apply_scalar(value: Any, french_values: list[str], context: str) -> None:
    if len(french_values) != 1:
        raise ValueError(f"{context} expected one source value; found {len(french_values)}")
    localized_set(value, french_values[0], context)


def split_workflow_line(value: str, context: str) -> tuple[str, str]:
    parts = re.split(r"\s+[—–]\s+", value, maxsplit=1)
    if len(parts) != 2:
        raise ValueError(f"{context} workflow item is missing the action/detail separator")
    return parts[0].strip(), parts[1].strip()


def apply_general_content(target: dict[str, Any], source: ParseResult) -> None:
    for index, (_source_title, fields) in enumerate(source.processes):
        process = target["processes"][index]
        process_context = f"General QC process {process['id']}"
        apply_scalar(process["title"], [_source_title], f"{process_context} title")
        for source_name, target_name in [
            ("Summary", "summary"),
            ("When to Use", "whenToUse"),
        ]:
            apply_scalar(get_nested(process, target_name), fields.get(source_name, []), f"{process_context}.{target_name}")
        source_workflow = fields.get("Field Workflow", [])
        if len(process["fieldWorkflow"]) != len(source_workflow):
            raise ValueError(
                f"{process_context}.fieldWorkflow item count mismatch: target has {len(process['fieldWorkflow'])}, source has {len(source_workflow)}"
            )
        for step_index, (step, source_line) in enumerate(
            zip(process["fieldWorkflow"], source_workflow, strict=True), start=1
        ):
            action, detail = split_workflow_line(source_line, f"{process_context}.fieldWorkflow item {step_index}")
            localized_set(step["action"], action, f"{process_context}.fieldWorkflow action {step_index}")
            localized_set(step["detail"], detail, f"{process_context}.fieldWorkflow detail {step_index}")
        for source_name, target_name in [
            ("What to Capture", "whatToCapture"),
            ("Common Mistakes", "commonMistakes"),
            ("Key Reminders", "keyReminders"),
            ("Typical Outputs", "typicalOutputs"),
        ]:
            apply_simple_array(
                process[target_name],
                fields.get(source_name, []),
                f"{process_context}.{target_name}",
            )

    universal = target["universal"]
    source_fields = source.universal
    localized_arrays = [
        ("Field Principle", "fieldPrinciple"),
        ("Before Any Inspection", "beforeAnyInspection"),
        ("When You Find a Problem", "whenYouFindAProblem"),
        ("Important Limitations", "importantLimitations"),
    ]
    for source_name, target_name in localized_arrays:
        apply_simple_array(
            universal[target_name],
            source_fields.get(source_name, []),
            f"Universal Field Reference.{target_name}",
        )
    record_values = source_fields.get("Minimum Useful Quality Record", [])
    if len(record_values) != len(universal["minimumUsefulQualityRecord"]) * 2:
        raise ValueError(
            "Universal Field Reference.minimumUsefulQualityRecord must contain two source values per target record"
        )
    for index, record in enumerate(universal["minimumUsefulQualityRecord"]):
        localized_set(record["key"], record_values[index * 2], f"Universal Field Reference key {index + 1}")
        localized_set(record["question"], record_values[index * 2 + 1], f"Universal Field Reference question {index + 1}")

    # The current landing screen owns its visible copy in UI strings, while
    # process cards and detail records remain canonical data here.
    target["skipped"] = [
        "General QC landing fields are parsed but have no current canonical destination.",
        "Related Processes remain canonical IDs and are not replaced by translated display text.",
    ]


def apply_system_content(
    sections: list[dict[str, Any]],
    activities: list[dict[str, Any]],
    quick_views: list[dict[str, Any]],
    learn_records: list[dict[str, Any]],
    source: ParseResult,
) -> list[str]:
    section_id = source.system_number.lstrip("0") if source.system_number else ""
    section = next((item for item in sections if item.get("id") == section_id), None)
    if section is None:
        raise ValueError(f"System {source.system_number} section '{section_id}' was not found")
    section_title = strip_system_title(source.title, source.system_number or "")
    if section_title:
        apply_scalar(section["title"], [section_title], f"Section {section_id} title")
    description = source.landing.get("Description", [])
    if description:
        apply_scalar(section["description"], [description[0]], f"Section {section_id} description")

    activity_by_id = {item["id"]: item for item in activities}
    quick_by_id = {item["activityId"]: item for item in quick_views}
    learn_by_id = {item["activityId"]: item for item in learn_records}
    skipped_fields: set[str] = set()

    quick_map = {
        "Before": ("quick", "before", "blocks"),
        "Inspect": ("quick", "inspect", "blocks"),
        "Evidence": ("quick", "evidence", "blocks"),
        "Watch For": ("quick", "watchFor", "blocks"),
        "Do Not Miss": ("quick", "dontMiss", "blocks"),
        "Field Tip": ("quick", "fieldTip", "scalar"),
    }
    full_map = {
        "Quality Objective": ("activity", "qualityObjective", "scalar"),
        "Applicability": ("activity", "applicability", "scalar"),
        "Authority Note": ("activity", "authorityNote", "scalar"),
        "Document Control": ("activity", "documentControl", "blocks"),
        "Communications": ("activity", "communications.before", "blocks"),
        "Requirements": ("activity", "requirements", "blocks"),
        "Planning": ("activity", "planning", "blocks"),
        "Material Control": ("activity", "materialControl", "blocks"),
        "Before Inspection": ("activity", "inspection.before", "blocks"),
        "During Inspection": ("activity", "inspection.during", "blocks"),
        "During Communications": ("activity", "communications.during", "blocks"),
        "Inspection & Hold/Witness Points": ("activity", "qualityCheckpoint", "blocks"),
        "Testing": ("activity", "inspection.testing", "blocks"),
        "Evidence": ("activity", "evidence", "blocks"),
        "Records": ("activity", "outputs.records", "blocks"),
        "Acceptance Evidence": ("activity", "outputs.acceptanceEvidence", "blocks"),
        "Reporting Analysis": ("activity", "reportingAnalysis", "blocks"),
        "Common Deficiencies": ("activity", "issues.commonDeficiencies", "blocks"),
        "Escalation Triggers": ("activity", "issues.escalationTriggers", "blocks"),
        "Issue Escalation Communications": ("activity", "communications.issueEscalation", "blocks"),
        "Corrective Action": ("activity", "correctiveAction", "blocks"),
        "Verification": ("activity", "verification", "blocks"),
        "After Inspection": ("activity", "inspection.after", "blocks"),
        "Closure Criteria": ("activity", "closureCriteria", "blocks"),
        "Follow-up": ("activity", "outputs.followUp", "blocks"),
        "After Communications": ("activity", "communications.after", "blocks"),
        "Specialist Boundary": ("activity", "specialistBoundary", "scalar"),
    }
    learn_map = {
        "What is": ("whatIsThis", "blocks"),
        "Why It Matters": ("whyItMatters", "blocks"),
        "Key Principles": ("howGoodWorkLooks", "blocks"),
        "Common Failures": ("commonFailures", "blocks"),
        "Practical Examples": ("practicalExamples", "examples"),
        "Interfaces & Sequence": ("interfacesAndSequence", "blocks"),
        "Specialist / Authority Boundary": ("specialistAuthorityBoundary", "scalar"),
    }

    for activity_id in SYSTEM_ACTIVITY_IDS[source.system_number or ""]:
        activity = activity_by_id.get(activity_id)
        quick = quick_by_id.get(activity_id)
        learn = learn_by_id.get(activity_id)
        if activity is None or quick is None or learn is None:
            raise ValueError(f"Activity '{activity_id}' is missing an existing canonical record/view")
        source_activity = source.activities[activity_id]
        title = source.activity_titles.get(activity_id)
        if title:
            apply_scalar(activity["title"], [title], f"Activity {activity_id} title")

        for source_name, (owner, target_path, mode) in quick_map.items():
            values = source_activity["Quick"].get(source_name, [])
            if not values:
                continue
            target = get_nested(quick if owner == "quick" else activity, target_path)
            if mode == "scalar":
                apply_scalar(target, values, f"Activity {activity_id} Quick {source_name}")
            else:
                apply_content_blocks(target, values, f"Activity {activity_id} Quick {source_name}")

        for source_name, (owner, target_path, mode) in full_map.items():
            values = source_activity["Full"].get(source_name, [])
            if not values:
                continue
            target = get_nested(activity if owner == "activity" else quick, target_path)
            if mode == "scalar":
                if target_path == "specialistBoundary":
                    target = target["text"]
                apply_scalar(target, values, f"Activity {activity_id} Full {source_name}")
            else:
                apply_content_blocks(target, values, f"Activity {activity_id} Full {source_name}")

        for source_name, (target_path, mode) in learn_map.items():
            values = source_activity["Learn"].get(source_name, [])
            if not values:
                continue
            target = get_nested(learn, target_path)
            if mode == "scalar":
                apply_scalar(target, values, f"Activity {activity_id} Learn {source_name}")
            elif mode == "examples":
                if len(target) != len(values):
                    raise ValueError(
                        f"Activity {activity_id} Learn Practical Examples item count mismatch: target has {len(target)}, source has {len(values)}"
                    )
                for index, (example, french) in enumerate(zip(target, values, strict=True), start=1):
                    localized_set(example["situation"], french, f"Activity {activity_id} Learn Practical Example {index}")
            else:
                apply_content_blocks(target, values, f"Activity {activity_id} Learn {source_name}")

        skipped_fields.update(
            f"{interface}: {field_name}"
            for interface, fields in source_activity.items()
            for field_name, values in fields.items()
            if values
            and (
                (interface == "Quick" and field_name not in quick_map)
                or (interface == "Full" and field_name not in full_map)
                or (interface == "Learn" and field_name not in learn_map)
                or interface == "Contextual / Right Rail"
            )
        )

    return sorted(skipped_fields)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--general", type=Path, default=DEFAULT_GENERAL)
    for system_number, default_path in SYSTEM_SOURCE_DEFAULTS.items():
        parser.add_argument(f"--system{system_number}", type=Path, default=default_path)
    parser.add_argument(
        "--systems",
        nargs="+",
        default=["01", "02"],
        choices=sorted(SYSTEM_ACTIVITY_IDS),
        help="Two-digit system numbers to import.",
    )
    parser.add_argument("--skip-general", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    try:
        general_source = None if args.skip_general else parse_general(args.general)
        system_sources = {
            system_number: parse_system(getattr(args, f"system{system_number}"), system_number)
            for system_number in args.systems
        }
        parse_errors = ([] if general_source is None else general_source.errors)
        for system_source in system_sources.values():
            parse_errors.extend(system_source.errors)
        if parse_errors:
            raise ValueError("\n".join(parse_errors))

        sections_path = ROOT / "src/data/sections/sections.json"
        general_path = ROOT / "src/data/generalQc/general-qc-processes.json"
        universal_path = ROOT / "src/data/generalQc/universal-field-reference.json"
        target_paths: dict[str, Path] = {
            "sections": sections_path,
        }
        if general_source is not None:
            target_paths["general"] = general_path
            target_paths["universal"] = universal_path
        for system_number in args.systems:
            target_paths[f"activities{system_number}"] = ROOT / f"src/data/activities/section-{system_number}.json"
            target_paths[f"quick{system_number}"] = ROOT / f"src/data/quick/section-{system_number}.quick.json"
            target_paths[f"learn{system_number}"] = ROOT / f"src/data/learn/section-{system_number}.learn.json"

        original = {key: read_json(path) for key, path in target_paths.items()}
        staged = copy.deepcopy(original)
        if general_source is not None:
            general_target = {
                "processes": staged["general"],
                "universal": staged["universal"],
            }
            apply_general_content(general_target, general_source)
        skipped = {}
        for system_number, system_source in system_sources.items():
            skipped[f"system{system_number}"] = apply_system_content(
                staged["sections"],
                staged[f"activities{system_number}"],
                staged[f"quick{system_number}"],
                staged[f"learn{system_number}"],
                system_source,
            )
        changed = [
            str(path.relative_to(ROOT))
            for key, path in target_paths.items()
            if original[key] != staged[key]
        ]
        if not args.dry_run:
            for key, path in target_paths.items():
                write_json(path, staged[key])
        report = {
            "mode": "dry-run" if args.dry_run else "write",
            "sources": {
                **({} if general_source is None else {"general": str(args.general)}),
                **{
                    f"system{system_number}": str(getattr(args, f"system{system_number}"))
                    for system_number in args.systems
                },
            },
            "counts": {
                **({} if general_source is None else {"generalProcesses": 16}),
                **{
                    f"system{system_number}Activities": len(SYSTEM_ACTIVITY_IDS[system_number])
                    for system_number in args.systems
                },
            },
            "changedFiles": [] if args.dry_run else changed,
            "skippedFields": skipped,
            "warnings": [
                "Contextual / Right Rail headings remain relationship-derived by the existing architecture.",
                "Quick metadata headings without canonical destinations remain parsed but are not written.",
                "Learn headings without current authored destinations remain parsed but are not written.",
                "General landing copy remains in the existing UI-string boundary.",
            ],
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
    except (FileNotFoundError, ValueError, KeyError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
