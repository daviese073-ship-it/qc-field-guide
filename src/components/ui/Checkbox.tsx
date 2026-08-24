import type { InputHTMLAttributes, ReactNode } from "react";

import { classNames } from "@/utils/classNames";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
};

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  return (
    <label className="flex min-h-8 items-start gap-2 text-sm text-slate-800">
      <input
        className={classNames(
          "mt-1 h-4 w-4 rounded border-slate-300 text-blue-700",
          className
        )}
        type="checkbox"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
