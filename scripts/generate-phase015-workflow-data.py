import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


STAGE_LABELS = {
    "prepare": {
        "en": "Prepare",
        "fr": "Préparer",
        "status": {"fr": "provisional"}
    },
    "verify": {
        "en": "Verify",
        "fr": "Vérifier",
        "status": {"fr": "provisional"}
    },
    "executeObserve": {
        "en": "Execute / Observe",
        "fr": "Exécuter / observer",
        "status": {"fr": "provisional"}
    },
    "test": {
        "en": "Test",
        "fr": "Tester",
        "status": {"fr": "provisional"}
    },
    "releaseClose": {
        "en": "Release / Close",
        "fr": "Autoriser / clore",
        "status": {"fr": "provisional"}
    },
}


WORKFLOW_CONFIGS = [
    {
        "id": "WF-CON-01",
        "title": ("Concrete Pour", "Coulée de béton"),
        "source": "Build 5 Activity Mode examples - Concrete Pour",
        "prepare": ["2.1", "2.2", "2.3", "9.1", "9.6", "11.8"],
        "verify": ["2.1", "2.2", "2.3", "11.8"],
        "execute": ["2.5", "3.1", "2.8"],
        "test": ["13.1", "13.2"],
        "close": ["14.7"],
        "gates": ["G-STR-01"],
    },
    {
        "id": "WF-WALL-01",
        "title": ("Wall Closure", "Fermeture des murs"),
        "source": "Build 5 Activity Mode examples - Wall Closure",
        "prepare": ["6.1", "6.2", "6.3", "8.9", "9.9", "10.3"],
        "verify": ["6.5", "10.1", "10.3", "10.4", "11.6"],
        "execute": ["6.4"],
        "test": ["13.8"],
        "close": ["14.7"],
        "gates": ["G-INT-01", "G-MEP-01", "G-LS-01"],
    },
    {
        "id": "WF-CEILING-01",
        "title": ("Ceiling Closure", "Fermeture des plafonds"),
        "source": "Build 5 Activity Mode examples - Ceiling Closure",
        "prepare": ["6.8", "6.9", "8.5", "8.9", "9.1", "9.2", "9.3", "9.9"],
        "verify": ["10.2", "10.3", "10.4", "11.6", "11.10"],
        "execute": ["6.8"],
        "test": ["13.8"],
        "close": ["14.7"],
        "gates": ["G-INT-01", "G-MEP-01", "G-LS-01"],
    },
    {
        "id": "WF-ROOF-01",
        "title": ("Roof Inspection", "Inspection de toiture"),
        "source": "Build 5 Activity Mode examples - Roof Inspection",
        "prepare": ["5.1", "5.2", "5.3"],
        "verify": ["5.4", "5.5", "5.8"],
        "execute": ["5.4", "5.5", "5.8", "5.9"],
        "test": ["13.5"],
        "close": ["14.7", "14.15"],
        "gates": ["G-ROOF-01A", "G-ROOF-01B", "G-ROOF-01C", "G-ROOF-01D", "G-ROOF-01E"],
    },
    {
        "id": "WF-ROOF-02",
        "title": ("Roof Penetration", "Penetration de toiture"),
        "source": "Build 5 Activity Mode examples - Roof Penetration",
        "prepare": ["5.4", "5.6", "5.7"],
        "verify": ["5.6", "5.7", "8.6", "9.4", "11.7"],
        "execute": ["5.6", "5.7"],
        "test": ["13.5"],
        "close": ["5.9", "14.7"],
        "gates": ["G-ROOF-01D"],
    },
    {
        "id": "WF-UG-01",
        "title": ("Underground Service Before Backfill", "Service souterrain avant remblai"),
        "source": "Build 5 Activity Mode examples - Underground Service Before Backfill",
        "prepare": ["1.2", "12.1", "12.2"],
        "verify": ["12.1", "12.2", "12.3"],
        "execute": ["12.1", "12.2", "12.3"],
        "test": ["13.1", "13.2"],
        "close": ["1.6", "2.12", "12.9"],
        "gates": ["G-EXT-01"],
    },
    {
        "id": "WF-EQP-01",
        "title": ("Equipment Installation", "Installation des equipements"),
        "source": "Build 5 Activity Mode examples - Equipment Installation",
        "prepare": ["8.6", "9.4", "11.9", "11.10"],
        "verify": ["8.6", "8.8", "9.4", "9.5", "9.10"],
        "execute": ["8.6", "9.4"],
        "test": ["13.3", "13.4"],
        "close": ["13.7", "13.11"],
        "gates": ["G-MEP-02"],
    },
    {
        "id": "WF-EQP-02",
        "title": ("Equipment Start-Up", "Démarrage des équipements"),
        "source": "Build 5 Activity Mode examples - Equipment Start-Up",
        "prepare": ["13.1", "13.2", "8.6", "9.4"],
        "verify": ["8.8", "9.5", "11.10"],
        "execute": ["13.7"],
        "test": ["13.3", "13.4", "13.6", "13.7"],
        "close": ["13.11", "14.15"],
        "gates": ["G-MEP-02", "G-TST-01"],
    },
    {
        "id": "WF-TST-01",
        "title": ("Pressure Test", "Essai de pression"),
        "source": "Build 5 Activity Mode examples - Pressure Test",
        "prepare": ["13.1", "13.2", "8.1", "8.2", "8.3", "8.4"],
        "verify": ["8.10", "13.1", "13.2"],
        "execute": ["13.3"],
        "test": ["8.10", "13.3"],
        "close": ["14.3", "14.9", "13.11"],
        "gates": ["G-TST-01"],
    },
    {
        "id": "WF-FIRE-01",
        "title": ("Firestop Inspection", "Inspection du calfeutrement coupe-feu"),
        "source": "Build 5H Activity Mode Integration - WF-FIRE-01",
        "prepare": ["10.1", "10.2", "10.3", "8.9", "9.9", "11.7"],
        "verify": ["10.3", "8.9", "9.9", "11.7"],
        "execute": ["10.3"],
        "test": ["13.8"],
        "close": ["6.4", "6.8", "14.7"],
        "gates": ["G-INT-01", "G-LS-01"],
    },
    {
        "id": "WF-DEF-01",
        "title": ("Deficiency Walk", "Relevé des déficiences"),
        "source": "Build 5 Activity Mode examples - Deficiency Walk",
        "prepare": ["14.1", "14.2"],
        "verify": ["14.2", "14.3"],
        "execute": ["14.3", "14.7", "14.8"],
        "test": ["14.9"],
        "close": ["14.10", "14.14"],
        "gates": ["G-FINAL-01"],
    },
    {
        "id": "WF-FINAL-01",
        "title": ("Final Acceptance Review", "Revue finale d'acceptation"),
        "source": "Build 5 Activity Mode examples - Final Acceptance Review",
        "prepare": ["14.7", "14.8", "14.9"],
        "verify": ["14.10", "14.11", "14.12", "14.13", "14.14"],
        "execute": ["13.11", "14.14"],
        "test": ["13.11"],
        "close": ["14.15"],
        "gates": ["G-FINAL-01"],
    },
]


PRECONCEALMENT_CONFIGS = [
    {
        "id": "PC-CON-01",
        "title": ("Before Concrete Pour", "Avant coulée de béton"),
        "source": "Build 5 Pre-Concealment Mode choices - Concrete Pour",
        "gates": ["G-STR-01"],
    },
    {
        "id": "PC-WALL-01",
        "title": ("Before Wall Closure", "Avant fermeture des murs"),
        "source": "Build 5 Pre-Concealment Mode choices - Wall",
        "gates": ["G-INT-01"],
    },
    {
        "id": "PC-CEILING-01",
        "title": ("Before Ceiling Closure", "Avant fermeture des plafonds"),
        "source": "Build 5 Pre-Concealment Mode choices - Ceiling",
        "gates": ["G-INT-01", "G-MEP-01"],
    },
    {
        "id": "PC-ROOF-01",
        "title": ("Before Roof Layer", "Avant couche de toiture"),
        "source": "Build 5 Pre-Concealment Mode choices - Roof Layer",
        "gates": ["G-ROOF-01A", "G-ROOF-01B", "G-ROOF-01C", "G-ROOF-01D"],
    },
    {
        "id": "PC-UG-01",
        "title": ("Before Underground Backfill", "Avant remblai souterrain"),
        "source": "Build 5 Pre-Concealment Mode choices - Underground / Backfill",
        "gates": ["G-EXT-01"],
    },
    {
        "id": "PC-FIRE-01",
        "title": ("Before Closing Fire-Rated Assembly", "Avant fermeture d’un assemblage coupe-feu"),
        "source": "Build 5H Pre-Concealment Integration - PC-FIRE-01",
        "gates": ["G-INT-01"],
        "activityFilter": ["10.1", "10.2", "10.3", "10.4", "8.9", "9.9", "11.6"],
    },
    {
        "id": "PC-MEP-01",
        "title": ("MEP Concealment", "Dissimulation MEP"),
        "source": "Build 5 Pre-Concealment Mode choices - MEP Concealment",
        "gates": ["G-MEP-01"],
    },
]


def load_json(path):
    with open(ROOT / path, encoding="utf-8") as handle:
        return json.load(handle)


def load_many(folder, pattern):
    values = []
    for path in sorted((ROOT / folder).glob(pattern)):
        values.extend(load_json(path.relative_to(ROOT)))
    return values


def localized(en, fr):
    return {"en": en, "fr": fr, "status": {"fr": "provisional"}}


def collect_items(blocks):
    items = []
    for block in blocks or []:
        if block["type"] in ("paragraph", "notice"):
            items.append(block["item"])
        elif block["type"] in ("bulletList", "checkList"):
            items.extend(block["items"])
    return items


def clone_item(source_item, new_id):
    item = {
        "id": new_id,
        "text": source_item["text"],
    }
    for key in ("conditionId", "terminologyRefs", "authority", "highControl"):
        if key in source_item:
            item[key] = source_item[key]
    if "sourceRef" in source_item:
        item["sourceRef"] = source_item["sourceRef"]
    return item


def block_from_items(items):
    if not items:
        return []
    return [{"type": "checkList", "items": items}]


def unique_ordered(values):
    result = []
    seen = set()
    for value in values:
        if value not in seen:
            result.append(value)
            seen.add(value)
    return result


def stage(stage_id, activity_ids=None, gate_ids=None, relationship_ids=None):
    record = {
        "id": stage_id,
        "title": STAGE_LABELS[stage_id],
    }
    if activity_ids:
        record["activityIds"] = activity_ids
    if gate_ids:
        record["gateIds"] = gate_ids
    if relationship_ids:
        record["relationshipIds"] = relationship_ids
    return record


def related_relationship_ids(relationships, ids, limit=24):
    id_set = set(ids)
    result = [
        relationship["id"]
        for relationship in relationships
        if relationship["sourceId"] in id_set or relationship["targetId"] in id_set
    ]
    return unique_ordered(result)[:limit]


def select_quick_items(quick_by_activity, activity_ids, fields, prefix, limit):
    selected = []
    for activity_id in activity_ids:
        quick = quick_by_activity.get(activity_id)
        if not quick:
            continue
        for field in fields:
            for item in collect_items(quick.get(field)):
                selected.append(
                    clone_item(item, f"{prefix}-{len(selected) + 1:03d}")
                )
                if len(selected) >= limit:
                    return selected
    return selected


def build_workflows(activities, gates, relationships, quick_views):
    quick_by_activity = {quick["activityId"]: quick for quick in quick_views}
    activity_ids = {activity["id"] for activity in activities}
    gate_by_id = {gate["id"]: gate for gate in gates}
    workflows = []

    for config in WORKFLOW_CONFIGS:
        all_activity_ids = unique_ordered(
            [
                *config["prepare"],
                *config["verify"],
                *config["execute"],
                *config["test"],
                *config["close"],
            ]
        )
        all_activity_ids = [value for value in all_activity_ids if value in activity_ids]
        gate_ids = [value for value in config["gates"] if value in gate_by_id]
        rel_ids = related_relationship_ids(relationships, [*all_activity_ids, *gate_ids])
        stages = [
            stage("prepare", [value for value in config["prepare"] if value in activity_ids]),
            stage(
                "verify",
                [value for value in config["verify"] if value in activity_ids],
                gate_ids,
            ),
            stage("executeObserve", [value for value in config["execute"] if value in activity_ids]),
        ]
        if config["test"]:
            stages.append(stage("test", [value for value in config["test"] if value in activity_ids]))
        stages.append(stage("releaseClose", [value for value in config["close"] if value in activity_ids], gate_ids))
        stages = [item for item in stages if item.get("activityIds") or item.get("gateIds")]

        workflows.append(
            {
                "id": config["id"],
                "title": localized(*config["title"]),
                "stages": stages,
                "activityIds": all_activity_ids,
                "gateIds": gate_ids,
                "relatedRelationshipIds": rel_ids,
                "evidenceFocus": block_from_items(
                    select_quick_items(
                        quick_by_activity,
                        all_activity_ids,
                        ["evidence", "dontMiss"],
                        f"WFI-{config['id']}-EVD",
                        8,
                    )
                ),
                "issuePath": block_from_items(
                    select_quick_items(
                        quick_by_activity,
                        all_activity_ids,
                        ["watchFor"],
                        f"WFI-{config['id']}-ISS",
                        6,
                    )
                ),
                "sourceRef": {
                    "build": "Build 5",
                    "document": "docs/source/04-build-5-field-presentation.docx",
                    "section": config["source"],
                },
            }
        )

    return workflows


def build_preconcealment(gates, quick_views):
    quick_by_activity = {quick["activityId"]: quick for quick in quick_views}
    gate_by_id = {gate["id"]: gate for gate in gates}
    workflows = []

    for config in PRECONCEALMENT_CONFIGS:
        linked_gates = [gate_by_id[gate_id] for gate_id in config["gates"]]
        gate_activity_ids = unique_ordered(
            [
                activity_id
                for gate in linked_gates
                for activity_id in gate.get("prerequisiteActivityIds", [])
            ]
        )
        activity_filter = config.get("activityFilter")
        if activity_filter:
            activity_ids = [value for value in activity_filter if value in gate_activity_ids]
        else:
            activity_ids = gate_activity_ids
        next_activity_ids = unique_ordered(
            [
                activity_id
                for gate in linked_gates
                for activity_id in gate.get("downstreamActivityIds", [])
            ]
        )

        workflows.append(
            {
                "id": config["id"],
                "title": localized(*config["title"]),
                "gateIds": config["gates"],
                "activityIds": activity_ids,
                "criticalChecks": block_from_items(
                    select_quick_items(
                        quick_by_activity,
                        activity_ids,
                        ["dontMiss", "before", "inspect"],
                        f"PCI-{config['id']}-CHK",
                        10,
                    )
                ),
                "evidence": block_from_items(
                    select_quick_items(
                        quick_by_activity,
                        activity_ids,
                        ["evidence"],
                        f"PCI-{config['id']}-EVD",
                        8,
                    )
                ),
                "blockIf": block_from_items(
                    select_quick_items(
                        quick_by_activity,
                        activity_ids,
                        ["watchFor"],
                        f"PCI-{config['id']}-BLK",
                        6,
                    )
                ),
                "nextActivityIds": next_activity_ids,
                "sourceRef": {
                    "build": "Build 5",
                    "document": "docs/source/04-build-5-field-presentation.docx",
                    "section": config["source"],
                },
            }
        )

    return workflows


def main():
    activities = load_many("src/data/activities", "section-*.json")
    gates = load_json("src/data/gates/gates.json")
    relationships = load_many("src/data/relationships", "*.json")
    quick_views = load_many("src/data/quick", "section-*.quick.json")

    workflows = build_workflows(activities, gates, relationships, quick_views)
    pre_concealment = build_preconcealment(gates, quick_views)

    workflow_dir = ROOT / "src/data/workflows"
    pre_dir = ROOT / "src/data/preConcealment"
    workflow_dir.mkdir(exist_ok=True)
    pre_dir.mkdir(exist_ok=True)

    with open(workflow_dir / "workflows.json", "w", encoding="utf-8") as handle:
        json.dump(workflows, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    with open(pre_dir / "pre-concealment-workflows.json", "w", encoding="utf-8") as handle:
        json.dump(pre_concealment, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    print(f"Generated {len(workflows)} workflows.")
    print(f"Generated {len(pre_concealment)} pre-concealment workflows.")


if __name__ == "__main__":
    main()
