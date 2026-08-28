import { z } from "zod";

import { localStorageService } from "@/services/storage/browserStorage";
import {
  clearVisitHistory,
  getTopVisited,
  recordVisit
} from "@/services/storage/visitHistory";

describe("localStorageService", () => {
  const key = "qc-field-guide:test";

  afterEach(() => {
    localStorageService.remove(key);
  });

  it("safely writes, reads, and removes a typed value", () => {
    const schema = z.object({
      id: z.string()
    });

    expect(localStorageService.set(key, { id: "10.3" })).toBe(true);
    expect(localStorageService.get(key, schema)).toEqual({ id: "10.3" });
    expect(localStorageService.remove(key)).toBe(true);
    expect(localStorageService.get(key, schema)).toBeNull();
  });
});

describe("visit history storage", () => {
  afterEach(() => {
    clearVisitHistory();
  });

  it("records visits and returns top records by frequency then recency", () => {
    recordVisit("section", "1", { now: 1000 });
    recordVisit("section", "2", { now: 2000 });
    recordVisit("section", "1", { now: 3000 });
    recordVisit("section", "3", { now: 4000 });
    recordVisit("section", "3", { now: 5000 });

    expect(getTopVisited("section", 3).map((record) => record.id)).toEqual([
      "3",
      "1",
      "2"
    ]);
    expect(getTopVisited("section", 1)[0]).toMatchObject({
      count: 2,
      id: "3",
      kind: "section"
    });
  });
});
