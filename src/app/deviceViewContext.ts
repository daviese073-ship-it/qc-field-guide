import { createContext, useContext } from "react";

import type { DeviceViewMode } from "@/services/deviceView/deviceViewPreference";

export interface DeviceViewContextValue {
  mode: DeviceViewMode;
  setMode: (mode: DeviceViewMode) => void;
}

export const DeviceViewContext = createContext<DeviceViewContextValue | null>(
  null
);

export function useDeviceView() {
  const context = useContext(DeviceViewContext);

  if (!context) {
    throw new Error("useDeviceView must be used within AppProviders.");
  }

  return context;
}
