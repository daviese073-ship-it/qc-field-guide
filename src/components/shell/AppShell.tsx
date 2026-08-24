import { BookOpenCheck } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

const routeChecks = [
  { to: "/", label: "Home" },
  { to: "/section/10", label: "Section" },
  { to: "/activity/10.3", label: "Activity" },
  { to: "/workflow/WF-SAMPLE", label: "Workflow" },
  { to: "/preconcealment/PC-SAMPLE", label: "Pre-Concealment" },
  { to: "/gate/G-SAMPLE", label: "Gate" },
  { to: "/search", label: "Search" },
  { to: "/term/sample-concept", label: "Term" }
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 font-semibold"
            aria-label="QC Field Guide home"
          >
            <BookOpenCheck className="h-6 w-6 text-blue-700" aria-hidden />
            <span>QC Field Guide</span>
          </Link>
          <nav
            className="flex flex-wrap gap-2 text-sm"
            aria-label="Development route checks"
          >
            {routeChecks.map((route) => (
              <Link
                className="rounded border border-slate-300 px-3 py-2 text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
                key={route.to}
                to={route.to}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
