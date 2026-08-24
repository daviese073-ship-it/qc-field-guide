import {
  acronymEntrySchema,
  activitySchema,
  gateSchema,
  invalidationSeveritySchema,
  nodeTagSchema,
  preConcealmentWorkflowSchema,
  quickViewSchema,
  relationshipSchema,
  relationshipTypeSchema,
  searchIndexEntrySchema,
  sectionSchema,
  terminologyConceptSchema,
  workflowSchema
} from "@/domain/schemas";
import {
  acronymEntryFixture,
  activityFixture,
  directedRelationshipFixture,
  gateFixture,
  preConcealmentWorkflowFixture,
  quickViewFixture,
  reciprocalRelationshipFixture,
  searchIndexEntryFixture,
  sectionFixture,
  terminologyConceptFixture,
  workflowFixture
} from "../fixtures/domainFixtures";

describe("canonical domain schemas", () => {
  it("parses a valid Section", () => {
    expect(sectionSchema.parse(sectionFixture)).toEqual(sectionFixture);
  });

  it("parses a valid Activity", () => {
    expect(activitySchema.parse(activityFixture)).toEqual(activityFixture);
  });

  it('keeps activity ID "10.3" as a string', () => {
    const parsed = activitySchema.parse(activityFixture);

    expect(parsed.id).toBe("10.3");
    expect(typeof parsed.id).toBe("string");
  });

  it("fails when required activity identity fields are missing", () => {
    const invalidActivity = {
      title: { en: "Missing identity" },
      nodeTags: ["activity"]
    };

    expect(activitySchema.safeParse(invalidActivity).success).toBe(false);
  });

  it("parses a valid directed Relationship", () => {
    expect(relationshipSchema.parse(directedRelationshipFixture)).toEqual(
      directedRelationshipFixture
    );
  });

  it("parses a valid reciprocal Relationship", () => {
    expect(relationshipSchema.parse(reciprocalRelationshipFixture)).toEqual(
      reciprocalRelationshipFixture
    );
  });

  it("fails a malformed Relationship", () => {
    expect(
      relationshipSchema.safeParse({
        id: "REL-BAD",
        sourceId: "10.3",
        targetId: "G-STR-01",
        direction: "sideways"
      }).success
    ).toBe(false);
  });

  it("parses a valid Gate", () => {
    expect(gateSchema.parse(gateFixture)).toEqual(gateFixture);
  });

  it("rejects official-project approval fields on Gate", () => {
    expect(
      gateSchema.safeParse({
        ...gateFixture,
        approvedBy: "Not canonical"
      }).success
    ).toBe(false);
  });

  it("parses a valid QuickView", () => {
    expect(quickViewSchema.parse(quickViewFixture)).toEqual(quickViewFixture);
  });

  it("parses a valid Workflow", () => {
    expect(workflowSchema.parse(workflowFixture)).toEqual(workflowFixture);
  });

  it("parses a valid PreConcealmentWorkflow", () => {
    expect(
      preConcealmentWorkflowSchema.parse(preConcealmentWorkflowFixture)
    ).toEqual(preConcealmentWorkflowFixture);
  });

  it("parses a valid TerminologyConcept with missing provisional French preferred term", () => {
    const parsed = terminologyConceptSchema.parse(terminologyConceptFixture);

    expect(parsed.preferred.fr).toBeUndefined();
    expect(parsed.status?.fr).toBe("provisional");
  });

  it("parses a valid AcronymEntry", () => {
    expect(acronymEntrySchema.parse(acronymEntryFixture)).toEqual(
      acronymEntryFixture
    );
  });

  it("parses a valid SearchIndexEntry", () => {
    expect(searchIndexEntrySchema.parse(searchIndexEntryFixture)).toEqual(
      searchIndexEntryFixture
    );
  });

  it("fails an invalid node tag", () => {
    expect(nodeTagSchema.safeParse("inventedTag").success).toBe(false);
  });

  it("fails an invalid relationship type", () => {
    expect(relationshipTypeSchema.safeParse("NEXT").success).toBe(false);
  });

  it("fails an invalid invalidation severity", () => {
    expect(invalidationSeveritySchema.safeParse("critical").success).toBe(
      false
    );
  });
});
