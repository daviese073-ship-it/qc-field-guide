import type { ReactNode } from "react";

import { NavigationLink } from "@/components/navigation/NavigationLink";

interface TerminologyLinkProps {
  conceptId: string;
  children: ReactNode;
}

export function TerminologyLink({ children, conceptId }: TerminologyLinkProps) {
  return (
    <NavigationLink
      className="font-medium text-blue-700 underline-offset-4 hover:underline"
      target={{ objectType: "term", id: conceptId }}
    >
      {children}
    </NavigationLink>
  );
}
