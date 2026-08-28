import { z } from "zod";

import {
  localStorageService,
  type TypedStorage
} from "@/services/storage/browserStorage";

export const deviceViewModeSchema = z.enum(["computer", "tablet", "mobile"]);
export type DeviceViewMode = z.infer<typeof deviceViewModeSchema>;

export const defaultDeviceViewMode: DeviceViewMode = "computer";

const deviceViewStorageKey = "qc-field-guide:device-view-mode";

export function getDeviceViewMode(
  storage: TypedStorage = localStorageService
): DeviceViewMode {
  return storage.get(deviceViewStorageKey, deviceViewModeSchema) ?? "computer";
}

export function setDeviceViewMode(
  mode: DeviceViewMode,
  storage: TypedStorage = localStorageService
) {
  return storage.set(deviceViewStorageKey, deviceViewModeSchema.parse(mode));
}
