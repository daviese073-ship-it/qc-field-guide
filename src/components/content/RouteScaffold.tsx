import type { ReactNode } from "react";

type RouteScaffoldProps = {
  title: string;
  routePattern: string;
  children?: ReactNode;
};

export function RouteScaffold({
  title,
  routePattern,
  children
}: RouteScaffoldProps) {
  return (
    <section
      className="rounded border border-dashed border-slate-300 bg-white p-6 shadow-sm"
      data-testid="route-scaffold"
    >
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        Temporary development scaffold
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        This screen only proves the route is wired. It does not contain QC
        content, project status, approvals, records, relationships, gates,
        workflows, search, terminology, or bilingual behavior.
      </p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-[max-content_1fr]">
        <dt className="font-medium text-slate-600">Route contract</dt>
        <dd className="font-mono text-slate-900">{routePattern}</dd>
        {children}
      </dl>
    </section>
  );
}
