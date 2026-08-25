import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Not found
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          This production route is not available
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
          The requested URL does not resolve to a canonical production section,
          activity, workflow, pre-concealment workflow, gate, search page, or
          terminology record.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            className="inline-flex min-h-10 items-center rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            to="/"
          >
            Return home
          </Link>
          <Link
            className="inline-flex min-h-10 items-center rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700"
            to="/search"
          >
            Search
          </Link>
        </div>
      </section>
    </main>
  );
}
