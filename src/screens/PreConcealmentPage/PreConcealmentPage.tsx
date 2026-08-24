import { useParams } from "react-router-dom";

import { RouteScaffold } from "@/components/content/RouteScaffold";

export function PreConcealmentPage() {
  const { preConcealmentId } = useParams<{ preConcealmentId: string }>();

  return (
    <RouteScaffold
      title="Pre-Concealment Route"
      routePattern="/preconcealment/:preConcealmentId"
    >
      <dt className="font-medium text-slate-600">preConcealmentId</dt>
      <dd className="font-mono text-slate-900">{preConcealmentId}</dd>
    </RouteScaffold>
  );
}
