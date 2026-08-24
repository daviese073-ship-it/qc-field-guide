import type { BreadcrumbItem } from "@/services/screenContracts";

import { NavigationLink } from "./NavigationLink";

interface BreadcrumbProps {
  nodes: readonly BreadcrumbItem[];
  currentLabel?: string;
}

export function Breadcrumb({ currentLabel, nodes }: BreadcrumbProps) {
  if (nodes.length === 0 && !currentLabel) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-2">
        {nodes.map((node) => (
          <li className="flex items-center gap-2" key={node.route}>
            <NavigationLink target={node.target}>{node.label}</NavigationLink>
            <span aria-hidden className="text-slate-400">
              /
            </span>
          </li>
        ))}
        {currentLabel ? (
          <li aria-current="page" className="font-medium text-slate-900">
            {currentLabel}
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
