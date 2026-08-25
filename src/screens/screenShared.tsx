import type { ReactNode } from "react";

import { LocalizedText } from "@/components/content/LocalizedText";
import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { NavigationLink } from "@/components/navigation/NavigationLink";
import { Badge } from "@/components/ui/Badge";
import type {
  Activity,
  ContentBlock,
  LocalizedContent,
  LocalizedString
} from "@/domain/types";
import type { LanguagePreference } from "@/services/localization/languagePreference";
import type { CanonicalRouteTarget } from "@/services/navigation";
import { classNames } from "@/utils/classNames";

import { practicalExampleLabels } from "./screenLabels";
import { getTagClass } from "./screenVisuals";

export function FieldLayout({
  children,
  rail
}: {
  children: ReactNode;
  rail?: ReactNode;
}) {
  return (
    <div className="grid gap-[var(--qcfg-section-gap)] xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] 2xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">{children}</div>
      {rail ? (
        <aside className="space-y-4 xl:sticky xl:top-[92px] xl:self-start">
          {rail}
        </aside>
      ) : null}
    </div>
  );
}

export function RailPanel({
  children,
  title,
  tone = "default"
}: {
  children: ReactNode;
  title: ReactNode;
  tone?: "default" | "tip" | "critical";
}) {
  return (
    <section
      className={classNames(
        "qcfg-rail-panel p-[var(--qcfg-card-padding)]",
        tone === "tip"
          ? "border-emerald-200 bg-emerald-50/80"
          : tone === "critical"
            ? "border-red-200 bg-red-50/80"
            : undefined
      )}
    >
      <h2 className="qcfg-section-heading mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function CompactTag({
  children,
  tag
}: {
  children: ReactNode;
  tag: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        getTagClass(tag)
      )}
    >
      {children}
    </span>
  );
}

export function ChecklistItem({
  children,
  checked = false,
  warning = false
}: {
  children: ReactNode;
  checked?: boolean;
  warning?: boolean;
}) {
  return (
    <li className="flex gap-2 text-sm leading-5 text-slate-800">
      <span
        aria-hidden
        className={classNames(
          "mt-0.5 h-3.5 w-3.5 shrink-0 rounded border",
          warning
            ? "border-red-400 bg-red-50"
            : checked
              ? "border-emerald-500 bg-emerald-500"
              : "border-slate-300 bg-white"
        )}
      />
      <span>{children}</span>
    </li>
  );
}

export function ChecklistPanel({
  accentClass,
  children,
  icon,
  title
}: {
  accentClass: string;
  children: ReactNode;
  icon: ReactNode;
  title: ReactNode;
}) {
  return (
    <section className="border-r border-[var(--qcfg-divider)] bg-[var(--qcfg-surface-card)] p-[var(--qcfg-card-padding)] last:border-r-0">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={classNames(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            accentClass
          )}
        >
          {icon}
        </span>
        <h2 className="qcfg-section-heading">{title}</h2>
      </div>
      <div className={classNames("mb-3 h-0.5 rounded-full", accentClass)} />
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--qcfg-divider)] pb-4">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="qcfg-page-title text-balance">{title}</h1>
          {description ? (
            <p className="qcfg-body-text mt-2 max-w-3xl">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </header>
  );
}

export function Panel({
  children,
  className,
  title
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
}) {
  return (
    <section
      className={classNames(
        "qcfg-card p-[var(--qcfg-card-padding)]",
        className
      )}
    >
      {title ? <h2 className="qcfg-section-heading mb-3">{title}</h2> : null}
      {children}
    </section>
  );
}

export function MissingObject({
  objectLabel,
  objectId
}: {
  objectLabel: string;
  objectId?: string;
}) {
  return (
    <Panel>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Not found
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">
        {objectLabel} not found
      </h1>
      {objectId ? (
        <p className="mt-2 font-mono text-sm text-slate-700">{objectId}</p>
      ) : null}
      <p className="mt-3 text-sm text-slate-700">
        This route does not resolve to a production canonical object.
      </p>
      <NavigationLink
        className="mt-5 inline-flex min-h-10 items-center rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:no-underline"
        target={{ objectType: "home" }}
      >
        Return home
      </NavigationLink>
    </Panel>
  );
}

export function LocalizedBlock({
  value,
  preference,
  density = "long"
}: {
  value?: LocalizedString | LocalizedContent;
  preference: LanguagePreference;
  density?: "short" | "long";
}) {
  if (!value) return null;

  return (
    <LocalizedText density={density} preference={preference} value={value} />
  );
}

export function ContentPanel({
  blocks,
  preference,
  title,
  tone
}: {
  blocks?: readonly ContentBlock[];
  preference: LanguagePreference;
  title: ReactNode;
  tone?: "default" | "critical";
}) {
  if (!blocks?.length) return null;

  return (
    <Panel
      className={
        tone === "critical" ? "border-amber-300 bg-amber-50/70" : undefined
      }
      title={title}
    >
      <ContentBlockRenderer
        blocks={blocks}
        practicalExampleLabels={practicalExampleLabels}
        preference={preference}
      />
    </Panel>
  );
}

export function ActivityList({
  activities,
  preference,
  compact = false
}: {
  activities: readonly Activity[];
  preference: LanguagePreference;
  compact?: boolean;
}) {
  if (activities.length === 0) return null;

  return (
    <ul className={classNames("grid gap-2", compact ? "" : "md:grid-cols-2")}>
      {activities.map((activity) => (
        <li key={activity.id}>
          <NavigationLink
            className="qcfg-card-hover qcfg-touch-target block rounded-lg border border-[var(--qcfg-border-normal)] bg-[var(--qcfg-surface-card)] px-3 py-2 text-sm hover:no-underline"
            target={{ objectType: "activity", id: activity.id }}
          >
            <span className="font-mono text-xs text-slate-500">
              {activity.id}
            </span>
            <span className="ml-2 font-medium text-slate-950">
              <LocalizedText preference={preference} value={activity.title} />
            </span>
          </NavigationLink>
        </li>
      ))}
    </ul>
  );
}

export function LinkPill({
  target,
  children
}: {
  target: CanonicalRouteTarget;
  children: ReactNode;
}) {
  return (
    <NavigationLink
      className="qcfg-touch-target inline-flex items-center rounded-lg border border-[var(--qcfg-border-normal)] bg-[var(--qcfg-surface-card)] px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--qcfg-border-emphasis)] hover:bg-[var(--qcfg-surface-card-hover)] hover:text-blue-700 hover:no-underline"
      target={target}
    >
      {children}
    </NavigationLink>
  );
}

export function FlagBadges({ flags }: { flags: readonly string[] }) {
  if (flags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag) => (
        <Badge key={flag} tone={flag === "preConcealment" ? "caution" : "info"}>
          {flag}
        </Badge>
      ))}
    </div>
  );
}
