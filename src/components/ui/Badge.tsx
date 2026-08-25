import type { HTMLAttributes, PropsWithChildren } from "react";

import { classNames } from "@/utils/classNames";

type BadgeTone = "neutral" | "info" | "caution" | "warning";

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: BadgeTone;
  }
>;

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    "border-[var(--qcfg-border-normal)] bg-[var(--qcfg-surface-secondary)] text-[var(--qcfg-status-reference)]",
  info: "border-blue-200 bg-blue-50 text-[var(--qcfg-status-info)]",
  caution: "border-amber-200 bg-amber-50 text-[var(--qcfg-status-warning)]",
  warning: "border-red-200 bg-red-50 text-[var(--qcfg-status-critical)]"
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex min-h-6 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
