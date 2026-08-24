import {
  AlertTriangle,
  FlaskConical,
  Layers,
  RefreshCw,
  ShieldAlert,
  UserRoundCheck
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";

type CriticalFlagRowProps = {
  flags: readonly string[];
  labels: Readonly<Record<string, ReactNode>>;
};

const flagIcons: Record<string, ComponentType<{ className?: string }>> = {
  preConcealment: Layers,
  highControl: ShieldAlert,
  specialist: UserRoundCheck,
  testing: FlaskConical,
  interfaceCritical: AlertTriangle,
  recheckIfModified: RefreshCw
};

export function CriticalFlagRow({ flags, labels }: CriticalFlagRowProps) {
  const visibleFlags = flags.filter((flag) => labels[flag]);

  if (visibleFlags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="list">
      {visibleFlags.map((flag) => {
        const Icon = flagIcons[flag];

        return (
          <Badge key={flag} role="listitem" tone="info">
            {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
            {labels[flag]}
          </Badge>
        );
      })}
    </div>
  );
}
