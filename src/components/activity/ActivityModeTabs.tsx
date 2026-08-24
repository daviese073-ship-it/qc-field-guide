import { Tabs } from "@/components/ui/Tabs";
import type { AvailableActivityMode } from "@/services/activity";

interface ActivityModeTabsProps {
  availableModes: readonly AvailableActivityMode[];
  currentMode?: AvailableActivityMode;
  labels: Readonly<Record<AvailableActivityMode, string>>;
  ariaLabel: string;
  onModeChange: (mode: AvailableActivityMode) => void;
}

export function ActivityModeTabs({
  ariaLabel,
  availableModes,
  currentMode,
  labels,
  onModeChange
}: ActivityModeTabsProps) {
  const selectedMode = currentMode ?? availableModes[0];

  if (!selectedMode) return null;

  return (
    <Tabs
      ariaLabel={ariaLabel}
      items={availableModes.map((mode) => ({
        value: mode,
        label: labels[mode]
      }))}
      onChange={onModeChange}
      value={selectedMode}
    />
  );
}
