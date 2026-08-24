import type { ReactNode } from "react";

import { WarningCard } from "@/components/content/WarningCard";

interface RecheckCardProps {
  title: ReactNode;
  children?: ReactNode;
}

export function RecheckCard({ children, title }: RecheckCardProps) {
  if (!children) return null;

  return <WarningCard title={title}>{children}</WarningCard>;
}
