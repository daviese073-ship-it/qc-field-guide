export interface NormalizedSearchText {
  normalized: string;
  compact: string;
  tokens: readonly string[];
  tokenVariants: readonly string[];
}

const stripDiacritics = (value: string) =>
  value.normalize("NFKD").replace(/\p{Diacritic}/gu, "");

const normalizeToken = (token: string) =>
  stripDiacritics(token)
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[^\p{L}\p{N}.]+/gu, "");

const addPluralVariant = (token: string, variants: Set<string>) => {
  if (/^\d+(?:\.\d+)?$/.test(token) || token.length <= 3) return;

  if (token.endsWith("ies") && token.length > 4) {
    variants.add(`${token.slice(0, -3)}y`);
    return;
  }

  if (token.endsWith("s") && !token.endsWith("ss")) {
    variants.add(token.slice(0, -1));
  }
};

export const normalizeSearchText = (value: string): NormalizedSearchText => {
  const normalized = stripDiacritics(value)
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/&/g, " and ")
    .replace(/[-_/]/g, " ")
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
  const compact = normalized.replace(/\s+/g, "");
  const tokens = normalized
    .split(" ")
    .map(normalizeToken)
    .filter(Boolean);
  const tokenVariants = new Set(tokens);

  for (const token of tokens) {
    addPluralVariant(token, tokenVariants);
  }

  const codeLikeTokens = value.match(/[A-Za-z]+(?:[-_/ ]+[A-Za-z0-9]+)+/g) ?? [];
  for (const token of codeLikeTokens) {
    const compactToken = normalizeToken(token.replace(/[-_/ ]+/g, ""));
    if (compactToken) tokenVariants.add(compactToken);
  }

  return {
    normalized,
    compact,
    tokens,
    tokenVariants: [...tokenVariants].sort()
  };
};
