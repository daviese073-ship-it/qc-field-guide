import type { HTMLAttributes, PropsWithChildren } from "react";

import { classNames } from "@/utils/classNames";

type BadgeTone = "neutral" | "info" | "caution" | "warning";

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: BadgeTone;
  }
>;

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  caution: "border-amber-200 bg-amber-50 text-amber-800",
  warning: "border-red-200 bg-red-50 text-red-800"
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
        "inline-flex min-h-6 items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
