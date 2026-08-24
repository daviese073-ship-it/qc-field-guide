import type { ReactNode } from "react";

import { classNames } from "@/utils/classNames";

export interface TabItem<TValue extends string> {
  value: TValue;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<TValue extends string> {
  ariaLabel: string;
  items: readonly TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

export function Tabs<TValue extends string>({
  ariaLabel,
  items,
  onChange,
  value
}: TabsProps<TValue>) {
  if (items.length <= 1) return null;

  return (
    <div
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2 border-b border-slate-200"
      role="tablist"
    >
      {items.map((item) => (
        <button
          aria-selected={item.value === value}
          className={classNames(
            "min-h-10 border-b-2 px-3 py-2 text-sm font-semibold transition",
            item.value === value
              ? "border-blue-700 text-blue-800"
              : "border-transparent text-slate-600 hover:text-blue-700"
          )}
          disabled={item.disabled}
          key={item.value}
          onClick={() => onChange(item.value)}
          role="tab"
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
