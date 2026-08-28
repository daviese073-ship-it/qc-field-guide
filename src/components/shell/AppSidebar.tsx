import { BookOpenCheck, ChevronRight, ClipboardList, Home } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { useLanguagePreference } from "@/app/languagePreferenceContext";
import {
  productionRegistries,
  productionUiStrings
} from "@/app/productionAppData";
import { LocalizedText } from "@/components/content/LocalizedText";
import { classNames } from "@/utils/classNames";

import { getSectionVisual } from "@/screens/screenVisuals";

const formatUi = (
  id: string,
  preference: ReturnType<typeof useLanguagePreference>["preference"],
  fallback: string
) => productionUiStrings.formatUiString(id, preference) ?? fallback;

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { preference } = useLanguagePreference();
  const sections = productionRegistries.sections.getAll();
  const homeLabel = formatUi("UI-NAV-HOME", preference, "Home");

  return (
    <>
      <button
        aria-label="Close navigation"
        className={classNames(
          "qcfg-sidebar-backdrop fixed inset-0 z-40 bg-slate-950/45",
          isOpen ? "block" : "hidden"
        )}
        onClick={onClose}
        type="button"
      />
      <aside
        className="qcfg-sidebar fixed inset-y-0 left-0 z-50 w-[255px] overflow-y-auto"
        data-open={isOpen ? "true" : "false"}
        data-testid="app-sidebar"
      >
        <div className="flex h-[66px] items-center gap-3 px-5">
          <Link
            aria-label="QC Field Guide home"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-offset-4"
            to="/"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#f7c931]/40 bg-[#07142e]/80 text-[#f7c931] shadow-sm">
              <BookOpenCheck className="h-7 w-7" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[22px] font-extrabold tracking-tight text-white">
                QC/QA
              </span>
              <span className="block text-[11px] font-bold uppercase tracking-wide text-blue-100">
                Field Execution
              </span>
            </span>
          </Link>
        </div>

        <nav className="px-2 pb-6" aria-label="Primary">
          <div className="space-y-2">
            <SidebarLink
              active={location.pathname === "/"}
              href="/"
              icon={<Home className="h-6 w-6" aria-hidden />}
              label={homeLabel}
              variant="home"
            />
            <SidebarLink
              active={location.pathname.startsWith("/general-qc")}
              href="/general-qc"
              icon={<ClipboardList className="h-6 w-6" aria-hidden />}
              label="General QC Processes"
              truncateLabel={false}
              variant="home"
              showChevron
            />
          </div>

          <div className="mx-4 mt-5 border-t border-white/12 pt-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9aa3b8]">
              Systems
            </p>
          </div>

          <div className="space-y-1">
            {sections.map((section) => {
              const visual = getSectionVisual(section.id);
              const Icon = visual.Icon;

              return (
                <SidebarLink
                  active={location.pathname === `/section/${section.id}`}
                  href={`/section/${encodeURIComponent(section.id)}`}
                  icon={
                    <Icon
                      className={classNames("h-6 w-6", visual.accent)}
                      aria-hidden
                    />
                  }
                  key={section.id}
                  label={
                    <LocalizedText
                      preference={preference}
                      value={section.title}
                    />
                  }
                />
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({
  active,
  href,
  icon,
  label,
  showChevron = false,
  truncateLabel = true,
  variant = "default"
}: {
  active: boolean;
  href: string;
  icon: ReactNode;
  label: ReactNode;
  showChevron?: boolean;
  truncateLabel?: boolean;
  variant?: "default" | "home";
}) {
  const homeActive = active && variant === "home";

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={classNames(
        "relative flex min-h-[54px] items-center gap-2 rounded-[10px] px-2 text-[15px] font-semibold transition focus-visible:outline-offset-2",
        homeActive
          ? "bg-white/10 text-[#f7c931] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
          : active
            ? "bg-white/10 text-white"
            : "text-blue-50/90 hover:bg-white/8 hover:text-white"
      )}
      to={href}
    >
      {homeActive ? (
        <span
          className="absolute left-0 top-2 h-[38px] w-[3px] rounded-r-full bg-[#f7c931]"
          aria-hidden
        />
      ) : null}
      <span
        className={classNames(
          "flex h-6 w-6 shrink-0 items-center justify-center",
          homeActive ? "text-[#f7c931]" : "text-current"
        )}
      >
        {icon}
      </span>
      <span
        className={classNames(
          "min-w-0 flex-1",
          truncateLabel ? "truncate" : "whitespace-nowrap"
        )}
      >
        {label}
      </span>
      {showChevron ? (
        <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : null}
    </Link>
  );
}
