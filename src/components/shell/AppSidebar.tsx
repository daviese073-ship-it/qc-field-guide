import {
  AlertTriangle,
  Brain,
  ClipboardCheck,
  Clock,
  Home,
  Layers,
  Search,
  ShieldCheck,
  Star,
  Wrench
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  productionDataset,
  productionRegistries
} from "@/app/productionAppData";
import { classNames } from "@/utils/classNames";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    match: (path: string) => path === "/"
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
    match: (path: string) => path.startsWith("/search")
  },
  {
    label: "What Are You Doing?",
    href: "/search?q=workflow",
    icon: Wrench,
    match: () => false
  },
  {
    label: "Before Closing / Covering",
    href: "/preconcealment/PC-FIRE-01",
    icon: AlertTriangle,
    match: (path: string) => path.startsWith("/preconcealment")
  },
  {
    label: "Activity Mode / Workflows",
    href: "/workflow/WF-FIRE-01",
    icon: ClipboardCheck,
    match: (path: string) =>
      path.startsWith("/workflow") || path.startsWith("/activity")
  },
  {
    label: "Pre-Concealment",
    href: "/preconcealment/PC-FIRE-01",
    icon: ShieldCheck,
    match: (path: string) => path.startsWith("/preconcealment")
  },
  {
    label: "Browse Systems",
    href: "/",
    icon: Layers,
    match: (path: string) => path.startsWith("/section")
  }
];

const unavailableItems = [
  { label: "QC Think", icon: Brain, note: "Context rail" },
  { label: "Favorites", icon: Star, note: "Not saved yet" },
  { label: "Recent", icon: Clock, note: "Not tracked yet" }
];

export function AppSidebar() {
  const location = useLocation();
  const sections = productionRegistries.sections.getAll();

  return (
    <aside className="hidden w-[232px] shrink-0 border-r border-slate-200 bg-white/95 lg:sticky lg:top-[68px] lg:block lg:h-[calc(100vh-68px)] lg:overflow-y-auto">
      <nav className="space-y-1 p-4" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.match(location.pathname);

          return (
            <Link
              className={classNames(
                "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
              )}
              key={item.label}
              to={item.href}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Systems
        </p>
        <div className="space-y-1">
          {sections.map((section) => (
            <Link
              className={classNames(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold",
                location.pathname === `/section/${section.id}`
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              )}
              key={section.id}
              to={`/section/${encodeURIComponent(section.id)}`}
            >
              <span className="w-6 rounded bg-slate-100 py-0.5 text-center font-mono text-[11px]">
                {section.id}
              </span>
              <span className="truncate">{section.title.en}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Later Field State
        </p>
        <div className="space-y-1">
          {unavailableItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                aria-disabled="true"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-400"
                key={item.label}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="flex-1">{item.label}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  {item.note}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4 text-xs text-slate-600">
        <p className="font-bold uppercase tracking-wide text-slate-500">
          System Status
        </p>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between gap-2">
            <dt>Content</dt>
            <dd className="font-mono text-blue-700">
              {productionDataset.version.contentVersion}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Search</dt>
            <dd className="text-emerald-700">Ready</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
