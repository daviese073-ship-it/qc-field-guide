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
        "qcfg-card p-[var(--qcfg-card-padding)]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
