import type { z } from "zod";

type StorageProvider = () => Storage | undefined;

export type TypedStorage = {
  get<T>(key: string, schema: z.ZodType<T>): T | null;
  set<T>(key: string, value: T): boolean;
  remove(key: string): boolean;
};

function createTypedStorage(getStorage: StorageProvider): TypedStorage {
  return {
    get<T>(key: string, schema: z.ZodType<T>): T | null {
      try {
        const storage = getStorage();
        const rawValue = storage?.getItem(key);

        if (rawValue === undefined || rawValue === null) {
          return null;
        }

        return schema.parse(JSON.parse(rawValue));
      } catch {
        return null;
      }
    },

    set<T>(key: string, value: T): boolean {
      try {
        const storage = getStorage();
        storage?.setItem(key, JSON.stringify(value));
        return Boolean(storage);
      } catch {
        return false;
      }
    },

    remove(key: string): boolean {
      try {
        const storage = getStorage();
        storage?.removeItem(key);
        return Boolean(storage);
      } catch {
        return false;
      }
    }
  };
}

export const localStorageService = createTypedStorage(
  () => window.localStorage
);
export const sessionStorageService = createTypedStorage(
  () => window.sessionStorage
);
