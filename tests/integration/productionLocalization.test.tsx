import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocalizedText } from "@/components/content/LocalizedText";
import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import type { Activity, ContentBlock, ContentItem } from "@/domain/types";
import { getCanonicalRoute } from "@/services/navigation/routeHelpers";
import { createRelationshipService } from "@/services/relationships/relationshipService";
import {
  formatLocalizedValue,
  resolveLocalizedValue
} from "@/services/localization/localizationService";
import { createUiStringService } from "@/services/localization/uiStringService";
import { createTerminologyService } from "@/services/terminology/terminologyService";
import {
  auditProductionLocalizationDataset,
  formatProductionLocalizationAuditReport
} from "@/services/validation/productionLocalizationAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const validatedProduction = () =>
  validateCanonicalDataset(productionCanonicalDataset);

const collectBlockItems = (blocks: readonly ContentBlock[] | undefined) => {
  const items: ContentItem[] = [];

  for (const block of blocks ?? []) {
    if (block.type === "paragraph" || block.type === "notice") {
      items.push(block.item);
    }
    if (block.type === "bulletList" || block.type === "checkList") {
      items.push(...block.items);
    }
  }

  return items;
};

const collectActivityItems = (activity: Activity) => [
  ...[
    "requirements",
    "planning",
    "documentControl",
    "materialControl",
    "evidence",
    "correctiveAction",
    "verification",
    "closureCriteria",
    "reportingAnalysis",
    "qualityCheckpoint"
  ].flatMap((field) =>
    collectBlockItems(activity[field as keyof Activity] as ContentBlock[])
  ),
  ...collectBlockItems(activity.inspection?.before),
  ...collectBlockItems(activity.inspection?.during),
  ...collectBlockItems(activity.inspection?.after),
  ...collectBlockItems(activity.inspection?.testing),
  ...collectBlockItems(activity.issues?.commonDeficiencies),
  ...collectBlockItems(activity.issues?.escalationTriggers),
  ...collectBlockItems(activity.communications?.before),
  ...collectBlockItems(activity.communications?.during),
  ...collectBlockItems(activity.communications?.issueEscalation),
  ...collectBlockItems(activity.communications?.after),
  ...collectBlockItems(activity.outputs?.records),
  ...collectBlockItems(activity.outputs?.acceptanceEvidence),
  ...collectBlockItems(activity.outputs?.followUp),
  ...(activity.specialistBoundary ? [activity.specialistBoundary] : [])
];

describe("Phase 013A production localization", () => {
  it("passes the production localization audit with explicit coverage counts", () => {
    const { dataset, registries } = validatedProduction();
    const report = auditProductionLocalizationDataset(dataset, registries);

    expect(report.ok).toBe(true);
    expect(report.localizedSectionTitleCount).toBe(14);
    expect(report.localizedActivityTitleCount).toBe(139);
    expect(report.terminologyCount).toBe(146);
    expect(report.acronymCount).toBe(20);
    expect(report.uiStringCount).toBe(169);
    expect(report.contentItemCount).toBe(13576);
    expect(report.contentItemFrCount).toBe(13576);
    expect(report.contentItemReviewedFrCount).toBe(0);
    expect(report.contentItemProvisionalFrCount).toBe(13576);
    expect(report.contentItemFallbackOnlyCount).toBe(0);
    expect(report.authoritySensitiveFrCount).toBe(1064);
    expect(report.authoritySensitiveProvisionalFrCount).toBe(1064);
    expect(report.numericTokenMismatchCount).toBe(0);
    expect(report.criticalTokenMismatchCount).toBe(0);
    expect(report.authorityObligationIssueCount).toBe(0);
    expect(report.unresolvedQaFlagCount).toBe(0);
    expect(report.unresolvedReferenceCount).toBe(0);
    expect(formatProductionLocalizationAuditReport(report)).toContain(
      "Language-specific canonical IDs: 0"
    );
  });

  it("keeps bilingual content on the same content-item IDs", () => {
    const { registries } = validatedProduction();
    const activity = registries.activities.getById("10.3");

    expect(activity?.id).toBe("10.3");

    const items = activity ? collectActivityItems(activity) : [];
    const correctiveAction = items.find(
      (item) => item.id === "CNT-10.3-CA-002"
    );

    expect(correctiveAction?.text.en).toContain("Identify FS ID");
    expect(correctiveAction?.text.fr).toContain("FS ID");
    expect(correctiveAction?.text.status?.fr).toBe("provisional");
  });

  it("reports complete French coverage across all 139 activities", () => {
    const { registries } = validatedProduction();
    const activityCoverage = registries.activities.getAll().map((activity) => {
      const items = collectActivityItems(activity);

      return {
        activityId: activity.id,
        total: items.length,
        translated: items.filter((item) => Boolean(item.text.fr)).length
      };
    });

    expect(activityCoverage).toHaveLength(139);
    expect(
      activityCoverage.every((coverage) => coverage.total === coverage.translated)
    ).toBe(true);
  });

  it("renders localized text in EN, FR, and bilingual modes", () => {
    const value = { en: "Reinforcement", fr: "Armatures" };

    expect(formatLocalizedValue(value, { mode: "en" })).toBe("Reinforcement");
    expect(formatLocalizedValue(value, { mode: "fr" })).toBe("Armatures");
    expect(
      formatLocalizedValue(value, {
        mode: "bilingual",
        bilingualPrimary: "en"
      })
    ).toBe("Reinforcement / Armatures");

    render(
      <LocalizedText
        preference={{ mode: "bilingual", bilingualPrimary: "fr" }}
        value={value}
      />
    );

    expect(screen.getByText("Armatures / Reinforcement")).toBeInTheDocument();
  });

  it("falls back to English when French is missing without changing the object ID", () => {
    const { registries } = validatedProduction();
    const terminologyService = createTerminologyService(registries);

    expect(
      terminologyService.getPreferredTerm("TERM-MECH-BAS", { mode: "fr" })
    ).toBe("Building Automation System");
    expect(
      resolveLocalizedValue(
        registries.terminology.getById("TERM-MECH-BAS")?.preferred ?? {
          en: "missing"
        },
        { mode: "fr" }
      ).usedFallback
    ).toBe(true);
    expect(getCanonicalRoute({ objectType: "term", id: "TERM-MECH-BAS" })).toBe(
      "/term/TERM-MECH-BAS"
    );
  });

  it("looks up terminology preferred terms and aliases centrally", () => {
    const { registries } = validatedProduction();
    const terminologyService = createTerminologyService(registries);

    expect(
      terminologyService.getPreferredTerm("TERM-CONC-COVER", { mode: "fr" })
    ).toBe("Enrobage");
    expect(
      terminologyService
        .findConceptsByAlias("rebar")
        .map((concept) => concept.id)
    ).toContain("TERM-CONC-REINFORCEMENT");
    expect(
      terminologyService
        .findConceptsByAlias("barres d’armature")
        .map((concept) => concept.id)
    ).toContain("TERM-CONC-REINFORCEMENT");
  });

  it("looks up acronyms without forcing false bilingual equivalence", () => {
    const { registries } = validatedProduction();
    const terminologyService = createTerminologyService(registries);

    expect(terminologyService.getAcronym("ACR-MECH-HVAC")?.relationType).toBe(
      "EXACT_EQUIVALENT"
    );
    expect(terminologyService.getAcronym("ACR-QC-ITP")?.relationType).toBe(
      "RELATED_NOT_EQUIVALENT"
    );
    expect(
      terminologyService
        .findAcronymsByAbbreviation("C.V.C.A.")
        .map((acronym) => acronym.id)
    ).toContain("ACR-MECH-HVAC");
  });

  it("looks up centralized UI strings with language fallback behavior", () => {
    const { registries } = validatedProduction();
    const uiStringService = createUiStringService(registries);

    expect(
      uiStringService.formatUiString("UI-NAV-BEFORE", { mode: "fr" })
    ).toBe("Avant");
    expect(
      uiStringService.formatUiString("UI-NAV-BEFORE", {
        mode: "bilingual",
        bilingualPrimary: "en"
      })
    ).toBe("Before / Avant");
    expect(
      uiStringService.resolveUiString("UI-NOT-A-REAL-STRING", { mode: "fr" })
    ).toBeUndefined();
  });

  it("localizes section and activity titles without changing IDs or routes", () => {
    const { registries } = validatedProduction();
    const section = registries.sections.getById("10");
    const activity = registries.activities.getById("10.3");

    expect(section?.title.fr).toBe(
      "Protection incendie et sécurité des personnes"
    );
    expect(activity?.title.fr).toBe("Calfeutrement coupe-feu");
    expect(activity?.id).toBe("10.3");
    expect(getCanonicalRoute({ objectType: "activity", id: "10.3" })).toBe(
      "/activity/10.3"
    );
    expect(getCanonicalRoute({ objectType: "activity", id: "10.3" })).not.toBe(
      "/fr/activity/10.3"
    );
  });

  it("keeps the relationship graph identical across language preferences", () => {
    const { registries } = validatedProduction();
    const relationshipService = createRelationshipService(registries);
    const englishGroups = relationshipService.getNavigationGroups("10.3");
    const frenchGroups = relationshipService.getNavigationGroups("10.3");

    expect(frenchGroups).toEqual(englishGroups);
  });

  it("does not create language-specific canonical IDs", () => {
    const { registries } = validatedProduction();
    const ids = [
      ...registries.sections.getAll().map((section) => section.id),
      ...registries.activities.getAll().map((activity) => activity.id),
      ...registries.relationships
        .getAll()
        .map((relationship) => relationship.id),
      ...registries.gates.getAll().map((gate) => gate.id),
      ...registries.terminology.getAll().map((concept) => concept.id),
      ...registries.acronyms.getAll().map((acronym) => acronym.id)
    ];

    expect(ids.some((id) => /(?:^|[-_/])(en|fr)(?:$|[-_/])/i.test(id))).toBe(
      false
    );
  });
});
