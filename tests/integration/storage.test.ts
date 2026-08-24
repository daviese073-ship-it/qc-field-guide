import { z } from "zod";

import { localStorageService } from "@/services/storage/browserStorage";

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
