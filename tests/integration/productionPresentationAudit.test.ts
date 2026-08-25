import { describe, expect, it } from "vitest";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { ContentBlock, ContentItem } from "@/domain/types";
import { createActivityService } from "@/services/activity";
import {
  auditProductionPresentationDataset,
  formatProductionPresentationAuditReport
} from "@/services/validation/productionPresentationAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const validatedProduction = () =>
  validateCanonicalDataset(structuredClone(productionCanonicalDataset));

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

const firstQuickItem = (dataset: CanonicalDataset) =>
  collectBlockItems(dataset.quickViews[0].before)[0] ??
  collectBlockItems(dataset.quickViews[0].inspect)[0];

describe("Phase 014 production presentation data", () => {
  it("passes the production presentation audit with coverage metrics", () => {
    const { dataset, registries } = validatedProduction();
    const report = auditProductionPresentationDataset(dataset, registries);

    expect(report.ok).toBe(true);
    expect(report.sectionCount).toBe(14);
    expect(report.activityCount).toBe(139);
    expect(report.quickViewCount).toBe(139);
    expect(report.learnContentCount).toBe(139);
    expect(report.activitiesWithQuickView).toBe(139);
    expect(report.activitiesWithLearnContent).toBe(139);
    expect(report.presentationItemCount).toBe(7604);
    expect(report.quickViewItemCount).toBe(3304);
    expect(report.learnContentItemCount).toBe(4300);
    expect(report.sourceLinkedPresentationItemCount).toBe(7604);
    expect(report.unresolvedSourceReferenceCount).toBe(0);
    expect(report.duplicatePresentationItemIdCount).toBe(0);
    expect(report.emptyPresentationRecordCount).toBe(0);
    expect(report.localizedPresentationFrCount).toBe(7604);
    expect(report.localizedPresentationReviewedFrCount).toBe(0);
    expect(report.localizedPresentationProvisionalFrCount).toBe(7604);
    expect(report.localizedPresentationFallbackOnlyCount).toBe(0);
    expect(report.workflowCount).toBe(0);
    expect(report.preConcealmentWorkflowCount).toBe(0);
    expect(formatProductionPresentationAuditReport(report)).toContain(
      "Phase 014 production presentation audit passed."
    );
  });

  it("makes Quick and Learn modes available through the existing activity service", () => {
    const { registries } = validatedProduction();
    const activityService = createActivityService(registries);

    expect(activityService.getAvailableModes("10.3")).toEqual([
      "quick",
      "full",
      "learn"
    ]);
    expect(activityService.getQuickView("10.3")?.activityId).toBe("10.3");
    expect(activityService.getLearnContent("10.3")?.activityId).toBe("10.3");
  });

  it("keeps presentation items traceable to canonical content IDs", () => {
    const { registries } = validatedProduction();
    const quickView = registries.quickViews.getById("10.3");
    const activity = registries.activities.getById("10.3");
    const sourceIds = new Set(
      [
        ...collectBlockItems(activity?.requirements),
        ...collectBlockItems(activity?.inspection?.during),
        ...collectBlockItems(activity?.evidence),
        ...collectBlockItems(activity?.issues?.commonDeficiencies),
        ...collectBlockItems(activity?.qualityCheckpoint)
      ].map((item) => item.id)
    );
    const quickItems = [
      ...collectBlockItems(quickView?.before),
      ...collectBlockItems(quickView?.inspect),
      ...collectBlockItems(quickView?.evidence),
      ...collectBlockItems(quickView?.watchFor),
      ...collectBlockItems(quickView?.dontMiss)
    ];

    expect(quickItems.length).toBeGreaterThan(0);
    expect(
      quickItems.every((item) => sourceIds.has(item.sourceRef?.page ?? ""))
    ).toBe(true);
  });

  it("fails when a presentation item ID is duplicated", () => {
    const { dataset, registries } = validatedProduction();
    const original = firstQuickItem(dataset);
    const duplicateTarget = collectBlockItems(dataset.quickViews[1].before)[0];

    expect(original).toBeDefined();
    expect(duplicateTarget).toBeDefined();
    if (!original || !duplicateTarget) {
      throw new Error("Expected production QuickView fixture items.");
    }

    duplicateTarget.id = original.id;

    const report = auditProductionPresentationDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.duplicatePresentationItemIdCount).toBe(1);
  });

  it("fails when a presentation source reference does not resolve", () => {
    const { dataset, registries } = validatedProduction();
    const item = firstQuickItem(dataset);

    expect(item).toBeDefined();
    if (!item) {
      throw new Error("Expected a production QuickView fixture item.");
    }

    item.sourceRef = {
      build: "Phase 014",
      document: "Authored field-presentation data",
      section: dataset.quickViews[0].activityId,
      page: "CNT-MISSING"
    };

    const report = auditProductionPresentationDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.unresolvedSourceReferenceCount).toBe(1);
  });

  it("fails when translated presentation text lacks French status", () => {
    const { dataset, registries } = validatedProduction();
    const item = firstQuickItem(dataset);

    expect(item).toBeDefined();
    if (!item) {
      throw new Error("Expected a production QuickView fixture item.");
    }

    delete item.text.status?.fr;

    const report = auditProductionPresentationDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.missingFrenchStatusCount).toBe(1);
  });
});
