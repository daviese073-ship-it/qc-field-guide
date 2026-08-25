import { describe, expect, it } from "vitest";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { ContentBlock, ContentItem } from "@/domain/types";
import { CanonicalDataValidationError } from "@/domain/registries";
import {
  auditProductionWorkflowDataset,
  expectedProductionPreConcealmentWorkflowIds,
  expectedProductionWorkflowIds,
  formatProductionWorkflowAuditReport
} from "@/services/validation/productionWorkflowAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const validatedProduction = () =>
  validateCanonicalDataset(structuredClone(productionCanonicalDataset));

const validatedProductionDataset = (): CanonicalDataset =>
  validatedProduction().dataset;

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

const firstWorkflowItem = (dataset: CanonicalDataset) =>
  collectBlockItems(dataset.workflows[0].evidenceFocus)[0] ??
  collectBlockItems(dataset.workflows[0].issuePath)[0];

describe("Phase 015 production workflow and pre-concealment data", () => {
  it("passes the production workflow audit with source and coverage metrics", () => {
    const { dataset, registries } = validatedProduction();
    const report = auditProductionWorkflowDataset(dataset, registries);

    expect(report.ok).toBe(true);
    expect(report.sectionCount).toBe(14);
    expect(report.activityCount).toBe(139);
    expect(report.workflowCount).toBe(12);
    expect(report.preConcealmentWorkflowCount).toBe(7);
    expect(report.activitiesWithWorkflowData).toBeGreaterThan(40);
    expect(report.activitiesWithoutWorkflowData).toBeGreaterThan(0);
    expect(report.activitiesWithPreConcealmentData).toBeGreaterThan(20);
    expect(report.activitiesWithoutPreConcealmentData).toBeGreaterThan(0);
    expect(report.sourceLinkedWorkflowItemCount).toBe(
      report.workflowContentItemCount + report.preConcealmentContentItemCount
    );
    expect(report.unresolvedSourceReferenceCount).toBe(0);
    expect(report.duplicateWorkflowIdCount).toBe(0);
    expect(report.duplicatePreConcealmentIdCount).toBe(0);
    expect(report.emptyWorkflowRecordCount).toBe(0);
    expect(report.emptyPreConcealmentRecordCount).toBe(0);
    expect(report.invalidReferenceCount).toBe(0);
    expect(report.incorrectPreConcealmentApplicabilityCount).toBe(0);
    expect(report.localizedWorkflowFallbackOnlyCount).toBe(0);
    expect(report.localizedWorkflowValidatedFrCount).toBe(0);
    expect(report.localizedWorkflowProvisionalFrCount).toBe(
      report.localizedWorkflowValueCount
    );
    expect(formatProductionWorkflowAuditReport(report)).toContain(
      "Phase 015 production workflow audit passed."
    );
  });

  it("loads the exact Build 5 workflow and pre-concealment identities through registries", () => {
    const { registries } = validatedProduction();

    expect(registries.workflows.getAll().map((workflow) => workflow.id)).toEqual(
      [...expectedProductionWorkflowIds].sort()
    );
    expect(
      registries.preConcealmentWorkflows
        .getAll()
        .map((workflow) => workflow.id)
    ).toEqual([...expectedProductionPreConcealmentWorkflowIds].sort());
    expect(registries.workflows.getById("WF-FIRE-01")?.activityIds).toContain(
      "10.3"
    );
    expect(
      registries.preConcealmentWorkflows.getById("PC-FIRE-01")?.activityIds
    ).toContain("10.3");
  });

  it("keeps workflow content traceable to canonical activity content IDs", () => {
    const { registries } = validatedProduction();
    const workflow = registries.workflows.getById("WF-FIRE-01");
    const item = collectBlockItems(workflow?.evidenceFocus)[0];

    expect(item).toBeDefined();
    expect(registries.activities.has(item?.sourceRef?.section ?? "")).toBe(
      true
    );
    expect(item?.sourceRef?.page).toMatch(/^CNT-/);
  });

  it("fails canonical loading when a duplicate workflow ID appears", () => {
    const dataset = validatedProductionDataset();

    dataset.workflows.push(structuredClone(dataset.workflows[0]));

    expect(() => validateCanonicalDataset(dataset)).toThrow(
      CanonicalDataValidationError
    );
  });

  it("fails canonical loading when a duplicate pre-concealment ID appears", () => {
    const dataset = validatedProductionDataset();

    dataset.preConcealmentWorkflows.push(
      structuredClone(dataset.preConcealmentWorkflows[0])
    );

    expect(() => validateCanonicalDataset(dataset)).toThrow(
      CanonicalDataValidationError
    );
  });

  it("fails canonical loading when a workflow references a missing activity", () => {
    const dataset = validatedProductionDataset();

    dataset.workflows[0].activityIds = ["99.99"];

    expect(() => validateCanonicalDataset(dataset)).toThrow(
      CanonicalDataValidationError
    );
  });

  it("fails the audit when a workflow record is empty or meaningless", () => {
    const { dataset, registries } = validatedProduction();

    dataset.workflows[0].stages = [];
    dataset.workflows[0].activityIds = [];

    const report = auditProductionWorkflowDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.emptyWorkflowRecordCount).toBe(1);
  });

  it("fails the audit when a workflow item loses source traceability", () => {
    const { dataset, registries } = validatedProduction();
    const item = firstWorkflowItem(dataset);

    expect(item).toBeDefined();
    if (!item) {
      throw new Error("Expected workflow content item.");
    }

    delete item.sourceRef;

    const report = auditProductionWorkflowDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.unresolvedSourceReferenceCount).toBe(1);
  });

  it("fails the audit when workflow French text lacks translation status", () => {
    const { dataset, registries } = validatedProduction();
    const item = firstWorkflowItem(dataset);

    expect(item).toBeDefined();
    if (!item) {
      throw new Error("Expected workflow content item.");
    }

    delete item.text.status?.fr;

    const report = auditProductionWorkflowDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.missingFrenchStatusCount).toBe(1);
  });

  it("fails the audit when pre-concealment uses a non-pre-concealment gate", () => {
    const { dataset, registries } = validatedProduction();

    dataset.preConcealmentWorkflows[0].gateIds = ["G-FINAL-01"];
    dataset.preConcealmentWorkflows[0].activityIds = ["14.15"];

    const report = auditProductionWorkflowDataset(dataset, registries);

    expect(report.ok).toBe(false);
    expect(report.incorrectPreConcealmentApplicabilityCount).toBeGreaterThan(0);
  });

  it("fails schema validation if official project-QMS workflow state is added", () => {
    const dataset = validatedProductionDataset();

    Object.assign(dataset.workflows[0], { approvedBy: "Inspector" });

    expect(() => validateCanonicalDataset(dataset)).toThrow(
      CanonicalDataValidationError
    );
  });
});
