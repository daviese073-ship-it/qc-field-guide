import { describe, expect, it } from "vitest";

import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import type { DerivedSearchIndex } from "@/services/search";
import {
  buildDerivedSearchIndex,
  createSearchService,
  normalizeSearchText
} from "@/services/search";
import {
  auditProductionSearchDataset,
  type ProductionSearchAuditReport
} from "@/services/validation/productionSearchAudit";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

const productionValidation = validateCanonicalDataset(productionCanonicalDataset);
const productionSearchIndex = buildDerivedSearchIndex(
  productionValidation.registries
);
const productionSearch = createSearchService(productionSearchIndex);
const productionSearchAudit: ProductionSearchAuditReport =
  auditProductionSearchDataset(
    productionValidation.dataset,
    productionValidation.registries
  );

const resultKeys = (query: string) =>
  productionSearch
    .search(query, { limit: 20 })
    .map((result) => `${result.objectType}:${result.objectId}`);

describe("Phase 016 derived search infrastructure", () => {
  it("builds a deterministic derived production search index", () => {
    const rebuilt = buildDerivedSearchIndex(productionValidation.registries);

    expect(productionSearchIndex.generatedBy).toBe("derived-search-index");
    expect(productionSearchIndex.entryCount).toBe(
      productionSearchIndex.entries.length
    );
    expect(JSON.stringify(productionSearchIndex)).toBe(
      JSON.stringify(rebuilt)
    );
  });

  it("passes the production search audit and coverage invariants", () => {
    expect(productionSearchAudit.ok).toBe(true);
    expect(productionSearchAudit.errors).toEqual([]);
    expect(productionSearchAudit.entryCount).toBeGreaterThan(50_000);
    expect(productionSearchAudit.englishEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.frenchEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.quickViewEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.learnContentEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.workflowEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.preConcealmentEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.terminologyEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.acronymEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.relationshipEntryCount).toBeGreaterThan(0);
    expect(productionSearchAudit.duplicateEntryIdCount).toBe(0);
    expect(productionSearchAudit.fallbackOnlyEntryCount).toBe(0);
  });

  it("normalizes case, punctuation, accents, apostrophes, hyphens, and code-like tokens", () => {
    expect(normalizeSearchText("Contrôle-de-la qualité").tokenVariants).toEqual(
      expect.arrayContaining(["controle", "qualite"])
    );
    expect(normalizeSearchText("Plan d’inspection").tokenVariants).toEqual(
      expect.arrayContaining(["d", "inspection"])
    );
    expect(normalizeSearchText("G-STR-01").tokenVariants).toEqual(
      expect.arrayContaining(["g", "str", "01", "gstr01"])
    );
    expect(normalizeSearchText("Firestops").tokenVariants).toContain("firestop");
  });

  it("returns an exact activity-title match before lower-weight content matches", () => {
    const results = productionSearch.search("Firestopping");

    expect(results[0]).toMatchObject({
      objectType: "activity",
      objectId: "10.3",
      route: "/activity/10.3",
      matchType: "exactTitle"
    });
  });

  it("keeps canonical activity IDs as string-searchable destinations", () => {
    const results = productionSearch.search("10.3");

    expect(results[0]).toMatchObject({
      objectType: "activity",
      objectId: "10.3"
    });
  });

  it("finds French terminology and activity destinations without language-specific routes", () => {
    const results = productionSearch.search("calfeutrement coupe-feu", {
      language: "fr"
    });
    const keys = results.map((result) => `${result.objectType}:${result.objectId}`);

    expect(keys).toContain("activity:10.3");
    expect(keys).toContain("term:TERM-FIRE-FIRESTOPPING");
    expect(results.every((result) => !result.route.startsWith("/fr/"))).toBe(
      true
    );
  });

  it("finds validated terminology aliases", () => {
    const results = productionSearch.search("firestop");

    expect(results[0]).toMatchObject({
      objectType: "term",
      objectId: "TERM-FIRE-FIRESTOPPING"
    });
    expect(results[0].matches[0].matchType).toBe("exactAlias");
  });

  it("recognizes acronym punctuation variants", () => {
    const results = productionSearch.search("N.C.R.");

    expect(results[0]).toMatchObject({
      objectType: "acronym",
      objectId: "ACR-QC-NCR",
      matchType: "exactAcronym"
    });
  });

  it("matches French text without accents", () => {
    expect(resultKeys("controle qualite")).toContain(
      "term:TERM-QC-QUALITY-CONTROL"
    );
  });

  it("matches multi-word and punctuated acronym aliases", () => {
    expect(resultKeys("QA-QC")).toContain("acronym:ACR-QA-QC");
  });

  it("deduplicates repeated hits to one result per canonical destination", () => {
    const results = productionSearch.search("NCR", { limit: 50 });
    const keys = results.map((result) => `${result.objectType}:${result.objectId}`);

    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("acronym:ACR-QC-NCR");
  });

  it("returns an empty result for empty or unmatched queries", () => {
    expect(productionSearch.search("")).toEqual([]);
    expect(productionSearch.search("zzzzxyxyxy016")).toEqual([]);
  });

  it("uses deterministic tie-breaking for otherwise equal results", () => {
    const syntheticIndex: DerivedSearchIndex = {
      generatedBy: "derived-search-index",
      entryCount: 2,
      entries: [
        {
          id: "SI-000002",
          objectId: "1.2",
          objectType: "activity",
          route: "/activity/1.2",
          sourceFamily: "activityTitle",
          sourceId: "1.2",
          language: "en",
          text: "Same Title",
          normalizedText: "same title",
          compactText: "sametitle",
          tokens: ["same", "title"],
          tokenVariants: ["same", "title"],
          title: { en: "Same Title" },
          baseWeight: 120
        },
        {
          id: "SI-000001",
          objectId: "1.1",
          objectType: "activity",
          route: "/activity/1.1",
          sourceFamily: "activityTitle",
          sourceId: "1.1",
          language: "en",
          text: "Same Title",
          normalizedText: "same title",
          compactText: "sametitle",
          tokens: ["same", "title"],
          tokenVariants: ["same", "title"],
          title: { en: "Same Title" },
          baseWeight: 120
        }
      ]
    };

    expect(createSearchService(syntheticIndex).search("Same Title")).toEqual([
      expect.objectContaining({ objectId: "1.1" }),
      expect.objectContaining({ objectId: "1.2" })
    ]);
  });

  it("keeps source and match metadata on ranked results", () => {
    const [result] = productionSearch.search("Firestopping");

    expect(result.matches[0]).toMatchObject({
      sourceFamily: "activityTitle",
      sourceId: "10.3",
      language: "en",
      matchType: "exactTitle"
    });
    expect(result.score).toBeGreaterThan(0);
  });
});
