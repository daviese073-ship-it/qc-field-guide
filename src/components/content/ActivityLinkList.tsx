import type { ReactNode } from "react";

import type { CanonicalRouteTarget } from "@/services/navigation";

import { NavigationLink } from "@/components/navigation/NavigationLink";

interface ActivityLinkListItem {
  id: string;
  label: ReactNode;
  target: CanonicalRouteTarget;
}

interface ActivityLinkListProps {
  title?: ReactNode;
  items: readonly ActivityLinkListItem[];
}

export function ActivityLinkList({ items, title }: ActivityLinkListProps) {
  if (items.length === 0) return null;

  return (
    <section>
      {title ? <h2 className="text-sm font-semibold text-slate-900">{title}</h2> : null}
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <NavigationLink target={item.target}>{item.label}</NavigationLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
