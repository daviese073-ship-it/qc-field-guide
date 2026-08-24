import type { PropsWithChildren, ReactNode } from "react";

import { Card } from "@/components/ui/Card";

interface NoticeCardProps {
  title?: ReactNode;
}

export function NoticeCard({
  children,
  title
}: PropsWithChildren<NoticeCardProps>) {
  if (!children) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      {title ? <h2 className="text-sm font-semibold text-blue-950">{title}</h2> : null}
      <div className="text-sm text-blue-950">{children}</div>
    </Card>
  );
}
