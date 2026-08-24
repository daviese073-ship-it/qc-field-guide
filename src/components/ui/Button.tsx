import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { classNames } from "@/utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-blue-700 bg-blue-700 text-white hover:bg-blue-800",
  secondary: "border-slate-300 bg-white text-slate-900 hover:border-blue-500",
  ghost: "border-transparent bg-transparent text-slate-700 hover:bg-slate-100"
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
        "inline-flex min-h-10 items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
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
