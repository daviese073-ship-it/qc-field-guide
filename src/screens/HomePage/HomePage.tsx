import { RouteScaffold } from "@/components/content/RouteScaffold";

export function HomePage() {
  return (
    <RouteScaffold title="Foundation Home" routePattern="/">
      <dt className="font-medium text-slate-600">Boundary</dt>
      <dd className="text-slate-900">
        Project requirements govern. This application is a universal QC field
        guide and does not replace the project's official QMS or authorized
        technical acceptance.
      </dd>
    </RouteScaffold>
  );
}
