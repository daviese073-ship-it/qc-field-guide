import type { CanonicalDataset } from "@/data/canonicalDataset";
import type { CanonicalRegistries } from "@/domain/registries";
import type { GeneralQcProcess } from "@/domain/types";

export interface GeneralQcService {
  getAllProcesses(): readonly GeneralQcProcess[];
  getProcessById(id: string): GeneralQcProcess | undefined;
  getRelatedProcesses(process: GeneralQcProcess): readonly GeneralQcProcess[];
  getUniversalReference(): CanonicalDataset["generalQcUniversalReference"];
}

export const createGeneralQcService = (
  dataset: CanonicalDataset,
  registries: CanonicalRegistries
): GeneralQcService =>
  Object.freeze({
    getAllProcesses: () => registries.generalQcProcesses.getAll(),
    getProcessById: (id: string) =>
      registries.generalQcProcesses.getById(id),
    getRelatedProcesses: (process: GeneralQcProcess) =>
      process.relatedProcessIds
        .map((id) => registries.generalQcProcesses.getById(id))
        .filter((item): item is GeneralQcProcess => Boolean(item)),
    getUniversalReference: () => dataset.generalQcUniversalReference
  });
