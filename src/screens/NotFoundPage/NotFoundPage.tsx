import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="rounded border border-slate-300 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Temporary development scaffold
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Not Found
        </h1>
        <p className="mt-3 text-slate-700">
          This route does not match the foundation route contract.
        </p>
        <Link
          className="mt-6 inline-flex rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-blue-500 hover:text-blue-700"
          to="/"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
