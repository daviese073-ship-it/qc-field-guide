import { Search } from "lucide-react";

import { NavigationLink } from "@/components/navigation/NavigationLink";

interface SearchTriggerProps {
  label: string;
}

export function SearchTrigger({ label }: SearchTriggerProps) {
  return (
    <NavigationLink
      className="inline-flex min-h-10 items-center gap-2 rounded border border-slate-600 px-3 py-2 text-sm font-medium text-slate-100 hover:border-sky-300 hover:text-sky-200 hover:no-underline"
      target={{ objectType: "search" }}
    >
      <Search className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </NavigationLink>
  );
}
