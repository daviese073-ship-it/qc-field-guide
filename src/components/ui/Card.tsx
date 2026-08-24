import type { HTMLAttributes, PropsWithChildren } from "react";

import { classNames } from "@/utils/classNames";

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <section
      className={classNames(
        "rounded border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
