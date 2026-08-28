import { type PropsWithChildren, useMemo, useState } from "react";

import {
  defaultDeviceViewMode,
  getDeviceViewMode,
  setDeviceViewMode,
  type DeviceViewMode
} from "@/services/deviceView/deviceViewPreference";
import {
  defaultLanguagePreference,
  getLanguagePreference,
  setLanguagePreference,
  type LanguagePreference
} from "@/services/localization/languagePreference";

import {
  DeviceViewContext,
  type DeviceViewContextValue
} from "./deviceViewContext";
import {
  LanguagePreferenceContext,
  type LanguagePreferenceContextValue
} from "./languagePreferenceContext";

export function AppProviders({ children }: PropsWithChildren) {
  const [preference, updatePreference] = useState<LanguagePreference>(() =>
    typeof window === "undefined"
      ? defaultLanguagePreference
      : getLanguagePreference()
  );
  const [deviceMode, updateDeviceMode] = useState<DeviceViewMode>(() =>
    typeof window === "undefined" ? defaultDeviceViewMode : getDeviceViewMode()
  );

  const languageValue = useMemo<LanguagePreferenceContextValue>(
    () => ({
      preference,
      setPreference: (nextPreference) => {
        setLanguagePreference(nextPreference);
        updatePreference(nextPreference);
      }
    }),
    [preference]
  );

  const deviceValue = useMemo<DeviceViewContextValue>(
    () => ({
      mode: deviceMode,
      setMode: (nextMode) => {
        setDeviceViewMode(nextMode);
        updateDeviceMode(nextMode);
      }
    }),
    [deviceMode]
  );

  return (
    <DeviceViewContext.Provider value={deviceValue}>
      <LanguagePreferenceContext.Provider value={languageValue}>
        {children}
      </LanguagePreferenceContext.Provider>
    </DeviceViewContext.Provider>
  );
}
