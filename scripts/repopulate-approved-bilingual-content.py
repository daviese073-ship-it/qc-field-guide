from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

from docx import Document


ROOT = Path(__file__).resolve().parents[1]

DEFAULT_EN = Path(
    r"C:/Users/emmad/OneDrive/Desktop/QC interface images/"
    r"QC-Field-Guide-Final-English-Content-Master-APPROVED.docx"
)
DEFAULT_FR = Path(
    r"C:/Users/emmad/OneDrive/Desktop/QC interface images/"
    r"QC-Field-Guide-Final-French-Content-Master-APPROVED.docx"
)

EXPECTED_COUNTS = {
    "section": 14,
    "activity": 139,
    "quick": 139,
    "full": 139,
    "learn": 139,
    "generalQcProcess": 16,
    "universalFieldReference": 1,
    "workflow": 12,
    "preConcealment": 7,
    "gate": 15,
    "terminology": 146,
    "acronym": 20,
    "home": 1,
    "generalQcLanding": 1,
    "searchUi": 1,
    "globalUi": 1,
}

FULL_FIELD_MAP = {
    "Quality Objective": {
        "Quality Objective": "qualityObjective",
        "Applicability": "applicability",
    },
    "Authority & References": {
        "Authority Note": "authorityNote",
        "Document Control": "documentControl",
        "Communications": "communications.before",
    },
    "Requirements": {"Requirements": "requirements"},
    "Planning & Preparation": {
        "Planning": "planning",
        "Material Control": "materialControl",
        "Before Inspection": "inspection.before",
    },
    "Execution": {
        "During Inspection": "inspection.during",
        "During Communications": "communications.during",
    },
    "Inspection & Hold/Witness Points": {
        "Testing": "inspection.testing",
        "Quality Checkpoint": "qualityCheckpoint",
    },
    "Evidence & Documentation": {
        "Evidence": "evidence",
        "Records": "outputs.records",
        "Acceptance Evidence": "outputs.acceptanceEvidence",
        "Reporting Analysis": "reportingAnalysis",
    },
    "Common Deficiencies": {
        "Common Deficiencies": "issues.commonDeficiencies",
        "Escalation Triggers": "issues.escalationTriggers",
        "Issue Escalation Communications": "communications.issueEscalation",
    },
    "Corrective Action": {
        "Corrective Action": "correctiveAction",
        "Verification": "verification",
    },
    "Acceptance & Closure": {
        "After Inspection": "inspection.after",
        "Closure Criteria": "closureCriteria",
        "Follow-up": "outputs.followUp",
        "Specialist Boundary": "specialistBoundary",
        "After Communications": "communications.after",
    },
}

FULL_GROUP_ALIASES = {
    "Quality Objective": ["Quality Objective", "Objectif de qualité", "Objectif qualité"],
    "Authority & References": ["Authority & References", "Autorité et références"],
    "Requirements": ["Requirements", "Exigences"],
    "Planning & Preparation": ["Planning & Preparation", "Planification et préparation"],
    "Execution": ["Execution", "Exécution"],
    "Inspection & Hold/Witness Points": [
        "Inspection & Hold/Witness Points",
        "Inspection & Points de retenue/Témoins",
        "Inspection & Points de retenue/Témoin",
        "Inspection & Points d'attente/témoin",
        "Inspection & Points d'Attente/Témoins",
        "Inspection et points de retenue/témoins",
    ],
    "Evidence & Documentation": [
        "Evidence & Documentation",
        "Preuves et documentation",
        "Preuves de fermeture et documentation",
        "de fermeture et documentation",
    ],
    "Common Deficiencies": ["Common Deficiencies", "Déficiences courantes", "Lacunes courantes"],
    "Corrective Action": ["Corrective Action", "Action corrective", "Mesures correctives"],
    "Acceptance & Closure": ["Acceptance & Closure", "Acceptation et clôture", "Acceptation et fermeture"],
}

FULL_SUBFIELD_ALIASES = {
    "Quality Objective": ["Quality Objective", "Objectif de qualité", "Objectif qualité"],
    "Applicability": ["Applicability", "Applicabilité"],
    "Authority Note": ["Authority Note", "Note d'autorité", "Note d’autorité"],
    "Document Control": ["Document Control", "Contrôle des documents", "Contrôle du document"],
    "Communications": ["Communications"],
    "Requirements": ["Requirements", "Exigences"],
    "Planning": ["Planning", "Planification"],
    "Material Control": [
        "Material Control",
        "Contrôle des matériaux",
        "Contrôle du matériau",
        "Contrôle du matériel",
        "Contrôle matériel",
    ],
    "Before Inspection": ["Before Inspection", "Avant inspection", "Avant l'inspection"],
    "During Inspection": ["During Inspection", "Lors de l'inspection", "Lors de l’inspection", "Pendant l'inspection"],
    "During Communications": ["During Communications", "Pendant les communications"],
    "Testing": ["Testing", "Tests", "Test", "Essais", "Essai"],
    "Quality Checkpoint": [
        "Quality Checkpoint",
        "Point de contrôle qualité",
        "Point de contrôle de qualité",
        "Contrôle qualité",
        "Vérification de la qualité",
    ],
    "Evidence": ["Evidence", "Preuves", "Preuve"],
    "Records": ["Records", "Enregistrements", "Dossiers", "Documents"],
    "Acceptance Evidence": ["Acceptance Evidence", "Preuve d'acceptation", "Preuves d'acceptation"],
    "Reporting Analysis": [
        "Reporting Analysis",
        "Analyse de rapport",
        "Analyse de rapports",
        "Analyse des rapports",
        "Rapport / analyse",
        "Rapport / analyses",
        "Rapports / analyse",
        "Rapports / analyses",
    ],
    "Common Deficiencies": [
        "Common Deficiencies",
        "Défauts courants",
        "Déficiences communes",
        "Déficiences courantes",
        "Lacunes courantes",
    ],
    "Escalation Triggers": ["Escalation Triggers", "Déclencheurs d'escalade", "déclencheurs d'escalade"],
    "Issue Escalation Communications": [
        "Issue Escalation Communications",
        "Communications d'escalade",
        "Communications d’escalade",
        "Communication d'escalade des problèmes",
        "Communications d'escalade de problèmes",
        "Communications d’escalade de problèmes",
    ],
    "Corrective Action": ["Corrective Action", "Action corrective", "Mesures correctives", "Mesure corrective"],
    "Verification": ["Verification", "Vérification"],
    "After Inspection": ["After Inspection", "Après inspection"],
    "Closure Criteria": ["Closure Criteria", "Critères de clôture", "Critères de fermeture"],
    "Follow-up": ["Follow-up", "Suivi"],
    "Specialist Boundary": ["Specialist Boundary", "Frontière spécialisée", "Limite spécialisée"],
    "After Communications": ["After Communications", "Après les communications", "Après communications"],
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value: str) -> str:
    without_accents = "".join(
        char
        for char in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(char)
    )
    return re.sub(r"[^a-z0-9]+", " ", without_accents.lower()).strip()


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def is_absent(value: str | None) -> bool:
    return bool(
        value
        and (
            clean(value).upper().startswith("INTENTIONALLY ABSENT")
            or clean(value).upper().startswith("INTENTIONNELLEMENT ABSENT")
        )
    )


def group_type(raw_type: str) -> str:
    lowered = raw_type.lower()
    if "quick" in lowered or "rapide" in lowered:
        return "quick"
    if "full" in lowered or "complet" in lowered:
        return "full"
    if "learn" in lowered or "apprendre" in lowered:
        return "learn"
    if lowered in {"activity", "activité"}:
        return "activity"
    if "system" in lowered or "système" in lowered or "section" in lowered:
        return "section"
    if "general qc process" in lowered or "processus général" in lowered:
        return "generalQcProcess"
    if "universal field" in lowered or "référence universelle" in lowered:
        return "universalFieldReference"
    if "workflow" in lowered and "conceal" not in lowered and "dissimulation" not in lowered:
        return "workflow"
    if "conceal" in lowered or "dissimulation" in lowered:
        return "preConcealment"
    if "gate" in lowered:
        return "gate"
    if "terminology" in lowered:
        return "terminology"
    if "acronym" in lowered:
        return "acronym"
    if lowered in {"home", "accueil"}:
        return "home"
    if "landing" in lowered or "page d" in lowered:
        return "generalQcLanding"
    if "search ui" in lowered:
        return "searchUi"
    if "global ui" in lowered:
        return "globalUi"
    return raw_type


def parse_master(path: Path) -> dict[tuple[str, str], dict[str, str]]:
    metadata_re = re.compile(
        r"(?:Object|Objet)\s*:\s*(.*?)\s*\|\s*(?:Canonical ID|ID canonique)\s*:\s*(.*?)\s*\|\s*(?:Title|Titre)\s*:\s*(.*)",
        re.IGNORECASE | re.DOTALL,
    )
    objects: list[dict[str, str]] = []
    current: dict[str, str] | None = None

    for paragraph in Document(str(path)).paragraphs:
        text = paragraph.text.strip()
        if not text:
            continue
        if paragraph.style.name.startswith("Heading 1"):
            if current:
                objects.append(current)
            current = {"heading": text, "meta": "", "content": ""}
        elif current and not current["meta"] and metadata_re.search(text):
            current["meta"] = text
        elif current:
            current["content"] = f"{current['content']}\n\n{text}".strip()

    if current:
        objects.append(current)

    parsed: dict[tuple[str, str], dict[str, str]] = {}
    for item in objects:
        match = metadata_re.search(item["meta"])
        if not match:
            if "QA" in item["heading"] or "assurance qualité" in item["heading"]:
                continue
            raise ValueError(f"Missing object metadata after heading {item['heading']!r}")

        raw_type, canonical_id, title = (clean(part) for part in match.groups())
        key = (group_type(raw_type), canonical_id)
        if key in parsed:
            raise ValueError(f"Duplicate source object {key}")
        parsed[key] = {
            "heading": item["heading"],
            "rawType": raw_type,
            "id": canonical_id,
            "title": title,
            "content": item["content"],
        }

    return parsed


def validate_sources(en: dict[tuple[str, str], dict[str, str]], fr: dict[tuple[str, str], dict[str, str]]) -> None:
    if set(en) != set(fr):
        raise ValueError(
            f"Approved master mismatch: {len(set(en) - set(fr))} EN-only, "
            f"{len(set(fr) - set(en))} FR-only."
        )

    counts = Counter(group for group, _id in en)
    for group, expected in EXPECTED_COUNTS.items():
        actual = counts[group]
        if actual != expected:
            raise ValueError(f"Expected {expected} {group} objects; found {actual}.")


def parse_line_fields(content: str) -> dict[str, list[str]]:
    fields: dict[str, list[str]] = {}
    current: str | None = None
    normalized_content = re.sub(r"(?<!\n)\n(?!\n)", " ", content)
    for raw_line in normalized_content.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        parts = [clean(part) for part in line.split("•")]
        if line.startswith("•"):
            values = [part for part in parts[1:] if part]
        else:
            label = parts[0]
            if label:
                current = label
                fields.setdefault(current, [])
            values = [part for part in parts[1:] if part]
        if current and values:
            fields.setdefault(current, []).extend(values)
    return fields


def get_field(fields: dict[str, list[str]], aliases: list[str]) -> list[str]:
    alias_norms = {norm(alias) for alias in aliases}
    for label, values in fields.items():
        if norm(label) in alias_norms:
            return values
    for label, values in fields.items():
        label_norm = norm(label)
        if any(label_norm.startswith(alias_norm) for alias_norm in alias_norms):
            return values
    return []


def get_full_group_items(fields: dict[str, list[str]], group_label: str) -> list[str]:
    group_aliases = {norm(alias) for alias in FULL_GROUP_ALIASES[group_label]}

    for label, values in fields.items():
        if norm(label) in group_aliases:
            return values

    for label, values in fields.items():
        label_norm = norm(label)
        if any(label_norm.startswith(alias) for alias in group_aliases) and len(values) > 2:
            return values

    for label, values in fields.items():
        label_norm = norm(label)
        if any(alias in label_norm for alias in group_aliases) and len(values) > 2:
            return values

    return []


def localized(en: str, fr: str | None = None) -> dict[str, Any]:
    value: dict[str, Any] = {"en": clean(en)}
    if fr is not None and clean(fr):
        value["fr"] = clean(fr)
    value["status"] = {"en": "validated"}
    if "fr" in value:
        value["status"]["fr"] = "validated"
    return value


def paired_single(en_items: list[str], fr_items: list[str]) -> dict[str, Any] | None:
    en_value = next((item for item in en_items if item and not is_absent(item)), None)
    if not en_value:
        return None
    fr_value = next((item for item in fr_items if item and not is_absent(item)), None)
    return localized(en_value, fr_value)


def pair_lists(en_items: list[str], fr_items: list[str]) -> list[tuple[str, str | None]]:
    clean_en = [item for item in en_items if item and not is_absent(item)]
    clean_fr = [item for item in fr_items if item and not is_absent(item)]
    pairs: list[tuple[str, str | None]] = []
    for index, en_item in enumerate(clean_en):
        fr_item = clean_fr[index] if index < len(clean_fr) else None
        pairs.append((en_item, fr_item))
    return pairs


def content_blocks(
    en_items: list[str],
    fr_items: list[str],
    item_prefix: str,
    block_type: str = "bulletList",
    source_build: str = "Build 2",
) -> list[dict[str, Any]] | None:
    pairs = pair_lists(en_items, fr_items)
    if not pairs:
        return None
    if len(pairs) == 1:
        en_text, fr_text = pairs[0]
        return [
            {
                "type": "paragraph",
                "item": {
                    "id": f"{item_prefix}-001",
                    "text": localized(en_text, fr_text),
                    "sourceRef": approved_source_ref(source_build),
                },
            }
        ]
    return [
        {
            "type": block_type,
            "items": [
                {
                    "id": f"{item_prefix}-{index:03d}",
                    "text": localized(en_text, fr_text),
                    "sourceRef": approved_source_ref(source_build),
                }
                for index, (en_text, fr_text) in enumerate(pairs, start=1)
            ],
        }
    ]


def approved_source_ref(build: str = "Build 2") -> dict[str, str]:
    return {
        "build": build,
        "document": "Approved bilingual content masters",
        "section": "Phase 017 final bilingual content repopulation",
    }


def strip_numbered_title(title: str, canonical_id: str) -> str:
    return re.sub(rf"^\s*{re.escape(canonical_id.zfill(2))}\s+", "", title).strip()


def canonical_field_maps(
    en_obj: dict[str, str], fr_obj: dict[str, str]
) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    return parse_line_fields(en_obj["content"]), parse_line_fields(fr_obj["content"])


def extract_ids(items: list[str]) -> list[str]:
    ids: list[str] = []
    for item in items:
        match = re.match(r"\s*(\d+\.\d+|G-[A-Z0-9-]+|WF-[A-Z0-9-]+|PC-[A-Z0-9-]+)\b", item)
        if match and match.group(1) not in ids:
            ids.append(match.group(1))
    return ids


def extract_stage_activity_ids(stage_text: str) -> list[str]:
    return [match.group(1) for match in re.finditer(r"'(\d+\.\d+)\s+[^']+'", stage_text)]


def update_sections(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    path = ROOT / "src/data/sections/sections.json"
    sections = load_json(path)
    for section in sections:
        key = ("section", section["id"])
        en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
        section["title"] = localized(
            strip_numbered_title(sources["en"][key]["title"], section["id"]),
            strip_numbered_title(sources["fr"][key]["title"], section["id"]),
        )
        description = paired_single(
            get_field(en_fields, ["System subtitle/supporting line"]),
            get_field(fr_fields, ["Sous-titres système/ligne de soutien", "System subtitle/supporting line"]),
        )
        if description:
            section["description"] = description
    write_json(path, sections)
    report["modified"].append(str(path.relative_to(ROOT)))


def update_general_qc(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    path = ROOT / "src/data/generalQc/general-qc-processes.json"
    processes = load_json(path)
    label_aliases = {
        "Summary": ["Summary", "Résumé"],
        "When to Use": ["When to Use", "Quand utiliser"],
        "Field Workflow": ["Field Workflow", "Flux de travail sur le terrain"],
        "What to Capture": ["What to Capture", "Que capturer", "Que saisir"],
        "Key Reminders": ["Key Reminders", "Rappels clés", "Rappels de clés"],
        "Common Mistakes": ["Common Mistakes", "Erreurs courantes", "Erreurs"],
        "Typical Outputs": ["Typical Outputs", "Sorties typiques", "Résultats typiques", "Résultats"],
    }
    for process in processes:
        key = ("generalQcProcess", process["id"])
        en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
        process["title"] = localized(sources["en"][key]["title"], sources["fr"][key]["title"])
        process["summary"] = paired_single(
            get_field(en_fields, label_aliases["Summary"]),
            get_field(fr_fields, label_aliases["Summary"]),
        ) or process["summary"]
        process["whenToUse"] = paired_single(
            get_field(en_fields, label_aliases["When to Use"]),
            get_field(fr_fields, label_aliases["When to Use"]),
        ) or process["whenToUse"]

        en_workflow = get_field(en_fields, label_aliases["Field Workflow"])
        fr_workflow = get_field(fr_fields, label_aliases["Field Workflow"])
        workflow_entries = []
        for index, (en_item, fr_item) in enumerate(pair_lists(en_workflow, fr_workflow), start=1):
            cleaned_en = re.sub(r"^\d+\.\s*", "", en_item)
            cleaned_fr = re.sub(r"^\d+\.\s*", "", fr_item or "")
            en_action, en_detail = split_action_detail(cleaned_en)
            fr_action, fr_detail = split_action_detail(cleaned_fr) if cleaned_fr else (None, None)
            workflow_entries.append(
                {
                    "sequence": index,
                    "action": localized(en_action, fr_action),
                    "detail": localized(en_detail, fr_detail),
                }
            )
        if workflow_entries:
            process["fieldWorkflow"] = workflow_entries

        for target, label in [
            ("whatToCapture", "What to Capture"),
            ("keyReminders", "Key Reminders"),
            ("commonMistakes", "Common Mistakes"),
            ("typicalOutputs", "Typical Outputs"),
        ]:
            pairs = pair_lists(
                get_field(en_fields, label_aliases[label]),
                get_field(fr_fields, label_aliases[label]),
            )
            if pairs:
                process[target] = [localized(en, fr) for en, fr in pairs]
    write_json(path, processes)
    report["modified"].append(str(path.relative_to(ROOT)))


def split_action_detail(value: str) -> tuple[str, str]:
    if ":" in value:
        action, detail = value.split(":", 1)
        return clean(action), clean(detail)
    return clean(value), clean(value)


def update_universal_reference(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    path = ROOT / "src/data/generalQc/universal-field-reference.json"
    reference = load_json(path)
    key = ("universalFieldReference", reference["id"])
    en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
    reference["title"] = localized(sources["en"][key]["title"], sources["fr"][key]["title"])
    reference["fieldPrinciple"] = [
        localized(en, fr)
        for en, fr in pair_lists(
            get_field(en_fields, ["Field Principle"]),
            get_field(fr_fields, ["Field Principle", "Principe de terrain"]),
        )
    ][:6] or reference["fieldPrinciple"]
    for target, aliases in [
        ("beforeAnyInspection", ["Before Any Inspection", "AVANT TOUTE INSPECTION"]),
        ("whenYouFindAProblem", ["When You Find a Problem", "Lorsque vous trouvez un problème"]),
        ("importantLimitations", ["Important Limitation", "Limite importante"]),
    ]:
        pairs = pair_lists(get_field(en_fields, aliases), get_field(fr_fields, aliases))
        if pairs:
            reference[target] = [localized(en, fr) for en, fr in pairs]
    write_json(path, reference)
    report["modified"].append(str(path.relative_to(ROOT)))


def split_subfields(items: list[str], field_names: list[str]) -> dict[str, list[str]]:
    marker_norms = {name: {norm(alias) for alias in FULL_SUBFIELD_ALIASES[name]} for name in field_names}
    result: dict[str, list[str]] = {name: [] for name in field_names}
    current: str | None = None
    for item in items:
        cleaned = clean(item)
        matched_name = None
        inline_remainder = ""
        for name, aliases in marker_norms.items():
            for alias in aliases:
                if norm(cleaned) == alias or norm(cleaned).startswith(alias + " "):
                    matched_name = name
                    inline_remainder = re.sub(r"^[^:：]*[:：]?\s*", "", cleaned).strip()
                    break
            if matched_name:
                break
        if matched_name:
            current = matched_name
            if inline_remainder and norm(inline_remainder) != norm(cleaned):
                result[current].append(inline_remainder)
            continue
        if current:
            result[current].append(cleaned)
    return result


def get_direct_subfield(
    fields: dict[str, list[str]], group_label: str, source_label: str
) -> list[str]:
    group_aliases = {norm(alias) for alias in FULL_GROUP_ALIASES[group_label]}
    source_aliases = {norm(alias) for alias in FULL_SUBFIELD_ALIASES[source_label]}
    for label, values in fields.items():
        label_norm = norm(label)
        if any(alias in label_norm for alias in group_aliases) and any(
            alias in label_norm for alias in source_aliases
        ):
            return values
    return []


def get_any_subfield(
    fields: dict[str, list[str]], source_label: str, field_names: list[str]
) -> list[str]:
    for values in fields.values():
        subfields = split_subfields(values, field_names)
        if subfields[source_label]:
            return subfields[source_label]
    return []


def has_direct_absence(
    fields: dict[str, list[str]], group_label: str, source_label: str
) -> bool:
    group_aliases = {norm(alias) for alias in FULL_GROUP_ALIASES[group_label]}
    source_aliases = {norm(alias) for alias in FULL_SUBFIELD_ALIASES[source_label]}
    absence_tokens = {
        "intentionally absent",
        "intentionally removed",
        "intentionally rejected",
        "intentionnellement absent",
        "intentionnellement supprime",
        "intentionnellement rejetee",
        "intentionnellement rejeté",
        "intentionnellement envoyee",
    }
    for label in fields:
        label_norm = norm(label)
        if any(alias in label_norm for alias in group_aliases) and any(
            alias in label_norm for alias in source_aliases
        ):
            if any(token in label_norm for token in absence_tokens):
                return True
    return False


def set_nested(activity: dict[str, Any], path: str, value: Any) -> None:
    if path == "specialistBoundary":
        if isinstance(value, list) and value:
            item = value[0]["item"] if value[0]["type"] == "paragraph" else value[0]["items"][0]
            item["id"] = f"APP-ACT-{activity['id']}-SPECIALIST-BOUNDARY-001"
            activity["specialistBoundary"] = item
        return
    target = activity
    parts = path.split(".")
    for part in parts[:-1]:
        target = target.setdefault(part, {})
    target[parts[-1]] = value


def delete_nested(activity: dict[str, Any], path: str) -> None:
    if path == "specialistBoundary":
        activity.pop("specialistBoundary", None)
        return
    target = activity
    parts = path.split(".")
    for part in parts[:-1]:
        next_target = target.get(part)
        if not isinstance(next_target, dict):
            return
        target = next_target
    target.pop(parts[-1], None)


def update_activities_and_views(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    activity_by_id: dict[str, dict[str, Any]] = {}
    activity_files = sorted((ROOT / "src/data/activities").glob("section-*.json"))
    for path in activity_files:
        activities = load_json(path)
        for activity in activities:
            activity_by_id[activity["id"]] = activity
            key = ("activity", activity["id"])
            en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
            activity["title"] = localized(sources["en"][key]["title"], sources["fr"][key]["title"])
            objective = paired_single(
                get_field(en_fields, ["Summary / Objective"]),
                get_field(fr_fields, ["Summary / Objective", "Résumé / objectif", "Résumé / Objectif"]),
            )
            if objective:
                activity["qualityObjective"] = objective

            full_key = ("full", activity["id"])
            en_full, fr_full = canonical_field_maps(sources["en"][full_key], sources["fr"][full_key])
            for group_label, field_map in FULL_FIELD_MAP.items():
                en_group_items = get_full_group_items(en_full, group_label)
                fr_group_items = get_full_group_items(fr_full, group_label)
                en_subfields = split_subfields(en_group_items, list(field_map))
                fr_subfields = split_subfields(fr_group_items, list(field_map))
                for source_label, target_path in field_map.items():
                    if has_direct_absence(
                        en_full, group_label, source_label
                    ) or has_direct_absence(fr_full, group_label, source_label):
                        delete_nested(activity, target_path)
                        continue
                    if not en_subfields[source_label]:
                        en_subfields[source_label] = get_direct_subfield(
                            en_full, group_label, source_label
                        )
                    if not en_subfields[source_label]:
                        en_subfields[source_label] = get_any_subfield(
                            en_full, source_label, list(field_map)
                        )
                    if not fr_subfields[source_label]:
                        fr_subfields[source_label] = get_direct_subfield(
                            fr_full, group_label, source_label
                        )
                    if not fr_subfields[source_label]:
                        fr_subfields[source_label] = get_any_subfield(
                            fr_full, source_label, list(field_map)
                        )
                    prefix = f"APP-ACT-{activity['id']}-{target_path.upper().replace('.', '-')}"
                    if target_path in {"qualityObjective", "applicability", "authorityNote"}:
                        single = paired_single(en_subfields[source_label], fr_subfields[source_label])
                        if single:
                            activity[target_path] = single
                    else:
                        block_type = "checkList" if any(
                            key in target_path
                            for key in [
                                "inspection",
                                "requirements",
                                "evidence",
                                "qualityCheckpoint",
                                "issues",
                                "verification",
                                "closureCriteria",
                                "outputs",
                            ]
                        ) else "bulletList"
                        blocks = content_blocks(en_subfields[source_label], fr_subfields[source_label], prefix, block_type)
                        if blocks:
                            set_nested(activity, target_path, blocks)

        write_json(path, activities)
        report["modified"].append(str(path.relative_to(ROOT)))

    for folder, group, filename_glob in [
        ("quick", "quick", "section-*.quick.json"),
        ("learn", "learn", "section-*.learn.json"),
    ]:
        for path in sorted((ROOT / f"src/data/{folder}").glob(filename_glob)):
            rows = load_json(path)
            for row in rows:
                activity_id = row["activityId"]
                en_fields, fr_fields = canonical_field_maps(
                    sources["en"][(group, activity_id)],
                    sources["fr"][(group, activity_id)],
                )
                if group == "quick":
                    update_quick_view(row, en_fields, fr_fields, activity_id)
                else:
                    update_learn_content(row, en_fields, fr_fields, activity_id)
            write_json(path, rows)
            report["modified"].append(str(path.relative_to(ROOT)))


def update_quick_view(
    quick: dict[str, Any],
    en_fields: dict[str, list[str]],
    fr_fields: dict[str, list[str]],
    activity_id: str,
) -> None:
    quick["fieldTip"] = paired_single(
        get_field(en_fields, ["Field Tip"]),
        get_field(fr_fields, ["Field Tip", "Astuce sur le terrain", "Conseil de terrain"]),
    )
    for target, aliases, block_type in [
        ("before", ["Before", "Avant", "avant"], "checkList"),
        ("inspect", ["Inspect", "Inspecter", "Inspection"], "checkList"),
        ("evidence", ["Evidence", "Preuves", "Preuve"], "checkList"),
        ("watchFor", ["Watch For", "À surveiller", "Surveiller", "Attention à"], "checkList"),
        ("dontMiss", ["Do Not Miss", "À ne pas manquer", "Ne pas manquer"], "checkList"),
    ]:
        blocks = content_blocks(
            get_field(en_fields, [aliases[0]]),
            get_field(fr_fields, aliases),
            f"APP-QV-{activity_id}-{target.upper()}",
            block_type,
        )
        if blocks:
            quick[target] = blocks
        elif target in quick:
            quick.pop(target)


def update_learn_content(
    learn: dict[str, Any],
    en_fields: dict[str, list[str]],
    fr_fields: dict[str, list[str]],
    activity_id: str,
) -> None:
    what_label = next((label for label in en_fields if label.startswith("What is ")), "What is")
    fr_what_label = next(
        (
            label
            for label in fr_fields
            if label.lower().startswith("qu'est-ce") or label.lower().startswith("quelles sont")
        ),
        what_label,
    )
    mappings = [
        ("whatIsThis", [what_label], [fr_what_label]),
        ("whyItMatters", ["Why It Matters"], ["Why It Matters", "Pourquoi c'est important", "Pourquoi cela importe"]),
        ("howGoodWorkLooks", ["Key Principles"], ["Key Principles", "Principes clés"]),
        (
            "interfacesAndSequence",
            ["How it works (at a glance)"],
            ["How it works (at a glance)", "Comment ça fonctionne (en un coup d'œil)", "Fonctionnement (en un coup d'œil)"],
        ),
        ("criticalChecksExplained", ["Typical Materials"], ["Typical Materials", "Matériaux typiques"]),
        ("commonFailures", ["Common Failures"], ["Common Failures", "Défaillances courantes"]),
    ]
    for target, en_aliases, fr_aliases in mappings:
        blocks = content_blocks(
            get_field(en_fields, en_aliases),
            get_field(fr_fields, fr_aliases),
            f"APP-LRN-{activity_id}-{target.upper()}",
            "bulletList",
        )
        if blocks:
            learn[target] = blocks
        elif target in learn:
            learn.pop(target)
    specialist = paired_single(
        get_field(en_fields, ["Specialist / Authority Boundary"]),
        get_field(fr_fields, ["Specialist / Authority Boundary", "spécialiste / Limite d'autorité"]),
    )
    if specialist:
        learn["specialistAuthorityBoundary"] = specialist
    examples = pair_lists(
        get_field(en_fields, ["Practical Examples"]),
        get_field(fr_fields, ["Practical Examples", "Exemples pratiques"]),
    )
    if examples:
        learn["practicalExamples"] = [
            {
                "id": f"APP-LRN-{activity_id}-EXAMPLE-{index:03d}",
                "situation": localized(en, fr),
                "sourceRef": approved_source_ref(),
            }
            for index, (en, fr) in enumerate(examples, start=1)
        ]


def update_workflows(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    path = ROOT / "src/data/workflows/workflows.json"
    workflows = load_json(path)
    gate_title_to_id = {
        gate["title"]["en"]: gate["id"]
        for gate in load_json(ROOT / "src/data/gates/gates.json")
    }
    for workflow in workflows:
        key = ("workflow", workflow["id"])
        en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
        workflow["title"] = localized(sources["en"][key]["title"], sources["fr"][key]["title"])
        summary = paired_single(
            get_field(en_fields, ["Workflow summary", "Summary"]),
            get_field(fr_fields, ["Workflow summary", "Summary", "Résumé du flux de travail", "Résumé"]),
        )
        if summary:
            workflow["description"] = summary
        stages = get_field(en_fields, ["Stages"])
        fr_stage_focus = {
            index: paired_single(
                get_field(en_fields, [f"Stage {index} QC Focus"]),
                get_field(fr_fields, [f"Stage {index} QC Focus", f"Étape {index} QC Focus"]),
            )
            for index in range(1, 6)
        }
        if stages:
            rebuilt = []
            all_activities: list[str] = []
            all_gates: list[str] = []
            for index, stage_text in enumerate(stages, start=1):
                title_match = re.search(r"Stage title:\s*([^;]+)", stage_text)
                stage_title = title_match.group(1).strip() if title_match else f"Stage {index}"
                activity_ids = extract_stage_activity_ids(stage_text)
                gates = [
                    gate_id
                    for gate_title, gate_id in gate_title_to_id.items()
                    if gate_title in stage_text and gate_id not in all_gates
                ]
                all_activities.extend([item for item in activity_ids if item not in all_activities])
                all_gates.extend(gates)
                stage: dict[str, Any] = {
                    "id": f"{workflow['id']}-STAGE-{index}",
                    "title": localized(stage_title, None),
                    "activityIds": activity_ids,
                }
                if fr_stage_focus[index]:
                    stage["description"] = fr_stage_focus[index]
                if gates:
                    stage["gateIds"] = gates
                rebuilt.append(stage)
            workflow["stages"] = rebuilt
            if all_activities:
                workflow["activityIds"] = all_activities
            if all_gates:
                workflow["gateIds"] = all_gates
        for target, aliases in [
            ("evidenceFocus", ["Evidence Focus"]),
            ("issuePath", ["Common Issue Path"]),
        ]:
            blocks = content_blocks(
                get_field(en_fields, aliases),
                get_field(fr_fields, aliases),
                f"APP-WF-{workflow['id']}-{target.upper()}",
                "checkList",
            )
            if blocks:
                workflow[target] = blocks
    write_json(path, workflows)
    report["modified"].append(str(path.relative_to(ROOT)))


def update_preconcealment(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    path = ROOT / "src/data/preConcealment/pre-concealment-workflows.json"
    workflows = load_json(path)
    gate_title_to_id = {
        gate["title"]["en"]: gate["id"]
        for gate in load_json(ROOT / "src/data/gates/gates.json")
    }
    for workflow in workflows:
        key = ("preConcealment", workflow["id"])
        en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
        workflow["title"] = localized(sources["en"][key]["title"], sources["fr"][key]["title"])
        for target, aliases in [
            ("criticalChecks", ["CHECK"]),
            ("evidence", ["EVIDENCE"]),
            ("blockIf", ["BLOCKING"]),
        ]:
            blocks = content_blocks(
                get_field(en_fields, aliases),
                get_field(fr_fields, aliases),
                f"APP-PC-{workflow['id']}-{target.upper()}",
                "checkList",
            )
            if blocks:
                workflow[target] = blocks
        activity_ids = extract_ids(get_field(en_fields, ["Activities in Scope"]))
        next_activity_ids = extract_ids(get_field(en_fields, ["Next Work"]))
        if activity_ids:
            workflow["activityIds"] = activity_ids
        if next_activity_ids:
            workflow["nextActivityIds"] = next_activity_ids
        related_gate_titles = get_field(en_fields, ["Related Gates"])
        gate_ids = [gate_title_to_id[title] for title in related_gate_titles if title in gate_title_to_id]
        if gate_ids:
            workflow["gateIds"] = gate_ids
    write_json(path, workflows)
    report["modified"].append(str(path.relative_to(ROOT)))


def update_gates(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    path = ROOT / "src/data/gates/gates.json"
    gates = load_json(path)
    for gate in gates:
        key = ("gate", gate["id"])
        en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
        gate["title"] = localized(sources["en"][key]["title"], sources["fr"][key]["title"])
        gate["purpose"] = paired_single(
            get_field(en_fields, ["Summary / Purpose"]),
            get_field(fr_fields, ["Summary / Purpose", "Résumé / objectif"]),
        ) or gate.get("purpose")
        check_items = content_blocks(
            get_field(en_fields, ["Prerequisites"]),
            get_field(fr_fields, ["Prerequisites", "Prérequis"]),
            f"APP-GATE-{gate['id']}-CHECK",
            "checkList",
            "Build 3",
        )
        if check_items:
            gate["checkItems"] = check_items
        blocking = content_blocks(
            get_field(en_fields, ["Blocking Conditions"]),
            get_field(fr_fields, ["Blocking Conditions", "Conditions de blocage"]),
            f"APP-GATE-{gate['id']}-BLOCK",
            "checkList",
            "Build 3",
        )
        if blocking:
            gate["blockingConditions"] = blocking
        gate["releaseCondition"] = paired_single(
            get_field(en_fields, ["Release Condition"]),
            get_field(fr_fields, ["Release Condition", "Condition de libération"]),
        ) or gate.get("releaseCondition")
        gate["authorityNote"] = paired_single(
            get_field(en_fields, ["Release Information"]),
            get_field(fr_fields, ["Release Information", "Informations de libération"]),
        ) or gate.get("authorityNote")
        prerequisites = extract_ids(get_field(en_fields, ["Prerequisite Activities"]))
        downstream = extract_ids(get_field(en_fields, ["Downstream Work"]))
        invalidation_ids = get_field(en_fields, ["Invalidation Events"])
        if prerequisites:
            gate["prerequisiteActivityIds"] = prerequisites
        if downstream:
            gate["downstreamActivityIds"] = downstream
        if invalidation_ids:
            gate["invalidationRuleIds"] = invalidation_ids
    write_json(path, gates)
    report["modified"].append(str(path.relative_to(ROOT)))


def update_terminology(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    for path in sorted((ROOT / "src/data/terminology").glob("*.json")):
        if path.name == "batir-audit.json":
            continue
        concepts = load_json(path)
        for concept in concepts:
            key = ("terminology", concept["id"])
            en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
            en_preferred = paired_single(get_field(en_fields, ["English preferred term"]), [])
            fr_preferred = paired_single(get_field(en_fields, ["French preferred term"]), get_field(fr_fields, ["French preferred term"]))
            if en_preferred:
                concept.setdefault("preferred", {})["en"] = en_preferred["en"]
            if fr_preferred and fr_preferred.get("fr"):
                concept.setdefault("preferred", {})["fr"] = fr_preferred["fr"]
            definition_en = get_field(en_fields, ["Definition (EN)", "Definition / explanation"])
            definition_fr = get_field(fr_fields, ["Definition (FR)", "Definition / explanation"])
            definition = paired_single(definition_en, definition_fr)
            if definition:
                concept["definition"] = definition
            context = paired_single(
                get_field(en_fields, ["Context Notes"]),
                get_field(fr_fields, ["Context Notes"]),
            )
            if context:
                concept["contextNotes"] = context
            aliases_en = get_field(en_fields, ["Aliases EN", "Aliases"])
            aliases_fr = get_field(fr_fields, ["Aliases FR", "Aliases"])
            aliases: dict[str, list[str]] = {}
            if aliases_en and not is_absent(aliases_en[0]):
                aliases["en"] = aliases_en
            if aliases_fr and not is_absent(aliases_fr[0]):
                aliases["fr"] = aliases_fr
            if aliases:
                concept["aliases"] = aliases
            concept["status"] = {"en": "validated", "fr": "validated" if concept.get("preferred", {}).get("fr") else "missing"}
            concept["confidence"] = {"en": "high", "fr": "high" if concept.get("preferred", {}).get("fr") else "low"}
        write_json(path, concepts)
        report["modified"].append(str(path.relative_to(ROOT)))


def update_acronyms(sources: dict[str, dict[tuple[str, str], dict[str, str]]], report: dict[str, Any]) -> None:
    path = ROOT / "src/data/acronyms/acronyms.json"
    acronyms = load_json(path)
    for acronym in acronyms:
        key = ("acronym", acronym["id"])
        en_fields, fr_fields = canonical_field_maps(sources["en"][key], sources["fr"][key])
        label = paired_single(get_field(en_fields, ["Preferred label"]), get_field(fr_fields, ["Preferred label"]))
        if label:
            acronym["preferredLabel"] = label
        full_en = get_field(en_fields, ["English meaning", "Definition (EN)"])
        full_fr = get_field(fr_fields, ["French meaning", "Definition (FR)"])
        if full_en or full_fr:
            acronym["fullForms"] = {}
            if full_en and not is_absent(full_en[0]):
                acronym["fullForms"]["en"] = full_en
            if full_fr and not is_absent(full_fr[0]):
                acronym["fullForms"]["fr"] = full_fr
        definition = paired_single(
            get_field(en_fields, ["Definition / explanation", "Definition (EN)"]),
            get_field(fr_fields, ["Definition / explanation", "Definition (FR)"]),
        )
        if definition:
            acronym["definition"] = definition
        abbrs = {
            "en": get_field(en_fields, ["Abbreviations EN"]),
            "fr": get_field(fr_fields, ["Abbreviations FR"]),
            "shared": get_field(en_fields, ["Abbreviations Shared", "Shared forms"]),
        }
        acronym["abbreviations"] = {
            key: values
            for key, values in abbrs.items()
            if values and not is_absent(values[0])
        }
        acronym["status"] = {
            "en": "validated",
            "fr": "validated" if acronym.get("fullForms", {}).get("fr") else "missing",
        }
    write_json(path, acronyms)
    report["modified"].append(str(path.relative_to(ROOT)))


def count_localized_slots(value: Any, lang: str) -> int:
    if isinstance(value, dict):
        count = 1 if isinstance(value.get(lang), str) and value.get(lang) else 0
        return count + sum(count_localized_slots(child, lang) for child in value.values())
    if isinstance(value, list):
        return sum(count_localized_slots(child, lang) for child in value)
    return 0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--english", type=Path, default=DEFAULT_EN)
    parser.add_argument("--french", type=Path, default=DEFAULT_FR)
    args = parser.parse_args()

    sources = {
        "en": parse_master(args.english),
        "fr": parse_master(args.french),
    }
    validate_sources(sources["en"], sources["fr"])

    report: dict[str, Any] = {
        "modified": [],
        "sourceObjects": len(sources["en"]),
    }
    update_sections(sources, report)
    update_general_qc(sources, report)
    update_universal_reference(sources, report)
    update_activities_and_views(sources, report)
    update_gates(sources, report)
    update_workflows(sources, report)
    update_preconcealment(sources, report)
    update_terminology(sources, report)
    update_acronyms(sources, report)

    dataset_paths = [
        ROOT / "src/data/sections/sections.json",
        ROOT / "src/data/generalQc/general-qc-processes.json",
        ROOT / "src/data/generalQc/universal-field-reference.json",
        ROOT / "src/data/gates/gates.json",
        ROOT / "src/data/workflows/workflows.json",
        ROOT / "src/data/preConcealment/pre-concealment-workflows.json",
        ROOT / "src/data/acronyms/acronyms.json",
        *sorted((ROOT / "src/data/activities").glob("section-*.json")),
        *sorted((ROOT / "src/data/quick").glob("section-*.quick.json")),
        *sorted((ROOT / "src/data/learn").glob("section-*.learn.json")),
        *[
            path
            for path in sorted((ROOT / "src/data/terminology").glob("*.json"))
            if path.name != "batir-audit.json"
        ],
    ]
    report["enSlots"] = 0
    report["frSlots"] = 0
    for path in dataset_paths:
        value = load_json(path)
        report["enSlots"] += count_localized_slots(value, "en")
        report["frSlots"] += count_localized_slots(value, "fr")

    report["modified"] = sorted(set(report["modified"]))
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
