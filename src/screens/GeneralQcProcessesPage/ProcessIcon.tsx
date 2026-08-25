import type { LucideIcon } from "lucide-react";

import { classNames } from "@/utils/classNames";

import type { GeneralQcAccent } from "./generalQcVisualFixtures";
import { accentClasses } from "./generalQcPresentation";

export function ProcessIcon({
  accent,
  Icon,
  size
}: {
  accent: GeneralQcAccent;
  Icon: LucideIcon;
  size: "large" | "small";
}) {
  const classes = accentClasses[accent];
  const dimensions =
    size === "large"
      ? {
          circle: "h-16 w-16",
          icon: "h-10 w-10"
        }
      : {
          circle: "h-11 w-11",
          icon: "h-7 w-7"
        };

  return (
    <span
      className={classNames(
        "flex shrink-0 items-center justify-center rounded-full",
        dimensions.circle,
        classes.circle
      )}
    >
      <Icon className={classNames(dimensions.icon, classes.text)} />
    </span>
  );
}
