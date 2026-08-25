import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { classNames } from "@/utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--qcfg-status-info)] bg-[var(--qcfg-status-info)] text-white hover:bg-blue-700",
  secondary:
    "border-[var(--qcfg-border-normal)] bg-[var(--qcfg-surface-card)] text-slate-900 hover:border-[var(--qcfg-border-emphasis)] hover:bg-[var(--qcfg-surface-card-hover)]",
  ghost:
    "border-transparent bg-transparent text-slate-700 hover:bg-[var(--qcfg-surface-muted)]"
};

export function Button({
  children,
  className,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "qcfg-touch-target inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
