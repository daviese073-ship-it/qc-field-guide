import { Search } from "lucide-react";

import { NavigationLink } from "@/components/navigation/NavigationLink";

interface SearchTriggerProps {
  label: string;
}

export function SearchTrigger({ label }: SearchTriggerProps) {
  return (
    <NavigationLink
      className="inline-flex min-h-10 items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700 hover:no-underline"
      target={{ objectType: "search" }}
    >
      <Search className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </NavigationLink>
  );
}
