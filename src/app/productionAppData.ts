import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import {
  buildDerivedSearchIndex,
  createSearchService
} from "@/services/search";
import { createUiStringService } from "@/services/localization/uiStringService";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

export const productionValidation = validateCanonicalDataset(
  productionCanonicalDataset
);

export const productionDataset = productionValidation.dataset;
export const productionRegistries = productionValidation.registries;
export const productionUiStrings = createUiStringService(productionRegistries);
export const productionSearchIndex =
  buildDerivedSearchIndex(productionRegistries);
export const productionSearchService = createSearchService(
  productionSearchIndex
);
