import type { PropsWithChildren, ReactNode } from "react";

import { Card } from "@/components/ui/Card";

interface WarningCardProps {
  title?: ReactNode;
}

export function WarningCard({
  children,
  title
}: PropsWithChildren<WarningCardProps>) {
  if (!children) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      {title ? <h2 className="text-sm font-semibold text-amber-950">{title}</h2> : null}
      <div className="text-sm text-amber-950">{children}</div>
    </Card>
  );
}
