export class CanonicalDataValidationError extends Error {
  readonly errors: readonly string[];

  constructor(summary: string, errors: readonly string[]) {
    super(errors.length > 0 ? `${summary}\n${errors.join("\n")}` : summary);
    this.name = "CanonicalDataValidationError";
    this.errors = [...errors];
  }
}

export interface ReadonlyRegistry<T> {
  getById(id: string): T | undefined;
  has(id: string): boolean;
  getAll(): readonly T[];
}

type CreateRegistryOptions<T> = {
  family: string;
  items: readonly T[];
  getId: (item: T) => string;
  sort?: (left: T, right: T) => number;
};

const tokenizeId = (id: string) =>
  id.match(/\d+|\D+/g)?.map((part) => {
    const numericValue = Number(part);

    return Number.isInteger(numericValue) && /^\d+$/.test(part)
      ? numericValue
      : part;
  }) ?? [id];

export const compareCanonicalIds = (left: string, right: string) => {
  const leftTokens = tokenizeId(left);
  const rightTokens = tokenizeId(right);
  const length = Math.max(leftTokens.length, rightTokens.length);

  for (let index = 0; index < length; index += 1) {
    const leftToken = leftTokens[index];
    const rightToken = rightTokens[index];

    if (leftToken === undefined) return -1;
    if (rightToken === undefined) return 1;
    if (leftToken === rightToken) continue;

    if (typeof leftToken === "number" && typeof rightToken === "number") {
      return leftToken - rightToken;
    }

    return String(leftToken).localeCompare(String(rightToken));
  }

  return 0;
};

export const createIdRegistry = <T>({
  family,
  items,
  getId,
  sort
}: CreateRegistryOptions<T>): ReadonlyRegistry<T> => {
  const byId = new Map<string, T>();
  const errors: string[] = [];

  for (const item of items) {
    const id = getId(item);

    if (byId.has(id)) {
      errors.push(`Duplicate ${family} ID "${id}"`);
      continue;
    }

    byId.set(id, item);
  }

  if (errors.length > 0) {
    throw new CanonicalDataValidationError(
      "Canonical registry construction failed.",
      errors
    );
  }

  const all = [...items].sort(sort);

  return Object.freeze({
    getById: (id: string) => byId.get(id),
    has: (id: string) => byId.has(id),
    getAll: () => [...all]
  });
};
