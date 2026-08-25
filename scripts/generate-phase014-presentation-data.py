from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
ACTIVITY_DIR = ROOT / "src" / "data" / "activities"
RELATIONSHIP_DIR = ROOT / "src" / "data" / "relationships"
QUICK_DIR = ROOT / "src" / "data" / "quick"
LEARN_DIR = ROOT / "src" / "data" / "learn"

CONTENT_BLOCK_FIELDS = [
    "requirements",
    "planning",
    "documentControl",
    "materialControl",
    "evidence",
    "correctiveAction",
    "verification",
    "closureCriteria",
    "reportingAnalysis",
    "qualityCheckpoint",
]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def collect_items(blocks: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []

    for block in blocks or []:
        if block.get("type") in {"paragraph", "notice"}:
            items.append(block["item"])
        elif block.get("type") in {"bulletList", "checkList"}:
            items.extend(block.get("items", []))

    return items


def content_blocks_from_items(
    items: list[dict[str, Any]],
    *,
    block_type: str,
    prefix: str,
    activity_id: str,
    source_path: str,
) -> list[dict[str, Any]]:
    if not items:
        return []

    mapped_items: list[dict[str, Any]] = []
    for index, item in enumerate(items, start=1):
        mapped = {
            "id": f"{prefix}-{item['id']}-{index:03d}",
            "text": item["text"],
            "sourceRef": {
                "build": "Phase 014",
                "document": "Authored field-presentation data",
                "section": activity_id,
                "page": item["id"],
                "note": {
                    "en": f"Mapped from canonical Activity {activity_id} {source_path} item {item['id']}."
                },
            },
        }
        for key in ["conditionId", "terminologyRefs", "authority", "highControl"]:
            if key in item:
                mapped[key] = item[key]
        mapped_items.append(mapped)

    return [{"type": block_type, "items": mapped_items}]


def content_block_from_localized_value(
    value: dict[str, Any] | None,
    *,
    prefix: str,
    activity_id: str,
    source_path: str,
) -> list[dict[str, Any]]:
    if not value:
        return []

    return [
        {
            "type": "paragraph",
            "item": {
                "id": f"{prefix}-{activity_id}-{source_path.upper().replace('.', '-')}",
                "text": value,
                "sourceRef": {
                    "build": "Phase 014",
                    "document": "Authored field-presentation data",
                    "section": activity_id,
                    "page": source_path,
                    "note": {
                        "en": f"Mapped from canonical Activity {activity_id} field {source_path}."
                    },
                },
            },
        }
    ]


def pick(*groups: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
    picked: list[dict[str, Any]] = []
    seen: set[str] = set()

    for group in groups:
        for item in group:
            if item["id"] in seen:
                continue
            picked.append(item)
            seen.add(item["id"])
            if len(picked) >= limit:
                return picked

    return picked


def relationships_by_activity() -> dict[str, list[str]]:
    by_activity: dict[str, list[str]] = {}
    relationships: list[dict[str, Any]] = []
    for path in sorted(RELATIONSHIP_DIR.glob("*.json")):
        relationships.extend(load_json(path))

    priority = {"hard": 0, "conditional": 1, "coordination": 2}
    relationships.sort(
        key=lambda rel: (
            priority.get(rel.get("strength", "coordination"), 3),
            rel["id"],
        )
    )

    for relationship in relationships:
        for endpoint in [relationship["sourceId"], relationship["targetId"]]:
            if "." not in endpoint:
                continue
            by_activity.setdefault(endpoint, [])
            if relationship["id"] not in by_activity[endpoint]:
                by_activity[endpoint].append(relationship["id"])

    return by_activity


def build_quick_view(
    activity: dict[str, Any],
    relationship_ids: list[str],
) -> dict[str, Any]:
    activity_id = activity["id"]
    requirements = collect_items(activity.get("requirements"))
    planning = collect_items(activity.get("planning"))
    document_control = collect_items(activity.get("documentControl"))
    material_control = collect_items(activity.get("materialControl"))
    before_inspection = collect_items((activity.get("inspection") or {}).get("before"))
    during_inspection = collect_items((activity.get("inspection") or {}).get("during"))
    evidence = collect_items(activity.get("evidence"))
    deficiencies = collect_items((activity.get("issues") or {}).get("commonDeficiencies"))
    corrective_action = collect_items(activity.get("correctiveAction"))
    verification = collect_items(activity.get("verification"))
    closure = collect_items(activity.get("closureCriteria"))
    checkpoints = collect_items(activity.get("qualityCheckpoint"))

    before = content_blocks_from_items(
        pick(before_inspection, requirements, planning, document_control, limit=5),
        block_type="checkList",
        prefix="QV-BEFORE",
        activity_id=activity_id,
        source_path="before/requirements/planning/documentControl",
    )
    inspect = content_blocks_from_items(
        pick(during_inspection, material_control, checkpoints, limit=7),
        block_type="checkList",
        prefix="QV-INSPECT",
        activity_id=activity_id,
        source_path="inspection.during/materialControl/qualityCheckpoint",
    )
    evidence_blocks = content_blocks_from_items(
        pick(evidence, verification, closure, limit=5),
        block_type="checkList",
        prefix="QV-EVIDENCE",
        activity_id=activity_id,
        source_path="evidence/verification/closureCriteria",
    )
    watch_for = content_blocks_from_items(
        pick(deficiencies, corrective_action, limit=5),
        block_type="bulletList",
        prefix="QV-WATCH",
        activity_id=activity_id,
        source_path="issues.commonDeficiencies/correctiveAction",
    )
    dont_miss = content_blocks_from_items(
        pick(checkpoints, closure, verification, limit=3),
        block_type="bulletList",
        prefix="QV-DONTMISS",
        activity_id=activity_id,
        source_path="qualityCheckpoint/closureCriteria/verification",
    )

    if not any([before, inspect, evidence_blocks, watch_for, dont_miss]):
        inspect = content_block_from_localized_value(
            activity.get("qualityObjective"),
            prefix="QV-INSPECT",
            activity_id=activity_id,
            source_path="qualityObjective",
        )
        dont_miss = content_block_from_localized_value(
            activity.get("authorityNote"),
            prefix="QV-DONTMISS",
            activity_id=activity_id,
            source_path="authorityNote",
        )

    quick: dict[str, Any] = {
        "activityId": activity_id,
        "before": before,
        "inspect": inspect,
        "evidence": evidence_blocks,
        "watchFor": watch_for,
        "dontMiss": dont_miss,
        "priorityRelationshipIds": relationship_ids[:4],
    }

    gate_ids = (activity.get("logic") or {}).get("gateIds") or []
    if gate_ids:
        quick["gateNext"] = {"gateIds": gate_ids}

    if (activity.get("logic") or {}).get("invalidationRuleIds"):
        quick["qcThinkEnabled"] = True

    return {key: value for key, value in quick.items() if value not in ([], {}, None)}


def build_learn_content(activity: dict[str, Any]) -> dict[str, Any]:
    activity_id = activity["id"]
    requirements = collect_items(activity.get("requirements"))
    planning = collect_items(activity.get("planning"))
    document_control = collect_items(activity.get("documentControl"))
    material_control = collect_items(activity.get("materialControl"))
    before_inspection = collect_items((activity.get("inspection") or {}).get("before"))
    during_inspection = collect_items((activity.get("inspection") or {}).get("during"))
    evidence = collect_items(activity.get("evidence"))
    deficiencies = collect_items((activity.get("issues") or {}).get("commonDeficiencies"))
    corrective_action = collect_items(activity.get("correctiveAction"))
    verification = collect_items(activity.get("verification"))
    closure = collect_items(activity.get("closureCriteria"))
    reporting = collect_items(activity.get("reportingAnalysis"))
    checkpoints = collect_items(activity.get("qualityCheckpoint"))

    learn: dict[str, Any] = {
        "activityId": activity_id,
        "whatIsThis": [
            *content_block_from_localized_value(
                activity.get("qualityObjective"),
                prefix="LRN-WHAT",
                activity_id=activity_id,
                source_path="qualityObjective",
            ),
            *content_block_from_localized_value(
                activity.get("applicability"),
                prefix="LRN-WHAT",
                activity_id=activity_id,
                source_path="applicability",
            ),
        ],
        "whyItMatters": [
            *content_block_from_localized_value(
                activity.get("authorityNote"),
                prefix="LRN-WHY",
                activity_id=activity_id,
                source_path="authorityNote",
            ),
            *content_blocks_from_items(
                pick(checkpoints, reporting, limit=4),
                block_type="bulletList",
                prefix="LRN-WHY",
                activity_id=activity_id,
                source_path="qualityCheckpoint/reportingAnalysis",
            ),
        ],
        "terminologyRefs": sorted(set(activity.get("terminologyRefs") or [])),
        "howGoodWorkLooks": content_blocks_from_items(
            pick(verification, closure, evidence, limit=6),
            block_type="bulletList",
            prefix="LRN-GOOD",
            activity_id=activity_id,
            source_path="verification/closureCriteria/evidence",
        ),
        "criticalChecksExplained": content_blocks_from_items(
            pick(before_inspection, during_inspection, material_control, requirements, limit=8),
            block_type="bulletList",
            prefix="LRN-CHECK",
            activity_id=activity_id,
            source_path="inspection/materialControl/requirements",
        ),
        "commonFailures": content_blocks_from_items(
            pick(deficiencies, corrective_action, limit=7),
            block_type="bulletList",
            prefix="LRN-FAIL",
            activity_id=activity_id,
            source_path="issues.commonDeficiencies/correctiveAction",
        ),
        "interfacesAndSequence": content_blocks_from_items(
            pick(planning, document_control, requirements, limit=6),
            block_type="bulletList",
            prefix="LRN-SEQ",
            activity_id=activity_id,
            source_path="planning/documentControl/requirements",
        ),
    }

    if activity.get("specialistBoundary"):
        learn["specialistAuthorityBoundary"] = activity["specialistBoundary"]["text"]

    return {key: value for key, value in learn.items() if value not in ([], {}, None)}


def main() -> None:
    relationships = relationships_by_activity()

    for activity_path in sorted(ACTIVITY_DIR.glob("section-*.json")):
        section_key = activity_path.stem.replace("section-", "section-")
        activities = load_json(activity_path)
        quick_views = [
            build_quick_view(activity, relationships.get(activity["id"], []))
            for activity in activities
        ]
        learn_content = [build_learn_content(activity) for activity in activities]

        write_json(QUICK_DIR / f"{section_key}.quick.json", quick_views)
        write_json(LEARN_DIR / f"{section_key}.learn.json", learn_content)

    print("Generated Phase 014 QuickView and LearnContent production data.")


if __name__ == "__main__":
    main()
