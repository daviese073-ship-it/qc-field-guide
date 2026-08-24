import { describe, expect, it } from "vitest";

import {
  getCanonicalRoute,
  resolveActivityModeForNavigation
} from "@/services/navigation";

describe("navigation service helpers", () => {
  it("builds canonical routes without changing language-neutral IDs", () => {
    expect(getCanonicalRoute({ objectType: "home" })).toBe("/");
    expect(
      getCanonicalRoute({
        objectType: "activity",
        id: "10.3",
        mode: "full"
      })
    ).toBe("/activity/10.3?mode=full");
    expect(getCanonicalRoute({ objectType: "gate", id: "G-STR-01" })).toBe(
      "/gate/G-STR-01"
    );
    expect(
      getCanonicalRoute({ objectType: "preConcealment", id: "PC-FIRE-01" })
    ).toBe("/preconcealment/PC-FIRE-01");
  });

  it("does not create language-specific routes", () => {
    expect(getCanonicalRoute({ objectType: "term", id: "TERM-FIXTURE" })).toBe(
      "/term/TERM-FIXTURE"
    );
  });

  it("preserves activity mode for activity-to-activity navigation", () => {
    expect(
      resolveActivityModeForNavigation({
        sourceObjectType: "activity",
        currentMode: "learn"
      })
    ).toBe("learn");
  });

  it("defaults activity mode to Quick when no activity mode context exists", () => {
    expect(
      resolveActivityModeForNavigation({
        sourceObjectType: "search"
      })
    ).toBe("quick");
  });

  it("uses an explicitly requested activity mode over inherited context", () => {
    expect(
      resolveActivityModeForNavigation({
        sourceObjectType: "activity",
        currentMode: "full",
        requestedMode: "quick"
      })
    ).toBe("quick");
  });
});
