import { useParams } from "react-router-dom";

import { RouteScaffold } from "@/components/content/RouteScaffold";

export function TerminologyPage() {
  const { conceptId } = useParams<{ conceptId: string }>();

  return (
    <RouteScaffold title="Terminology Route" routePattern="/term/:conceptId">
      <dt className="font-medium text-slate-600">conceptId</dt>
      <dd className="font-mono text-slate-900">{conceptId}</dd>
    </RouteScaffold>
  );
}
