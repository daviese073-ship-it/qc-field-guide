import { useParams } from "react-router-dom";

import { RouteScaffold } from "@/components/content/RouteScaffold";

export function GatePage() {
  const { gateId } = useParams<{ gateId: string }>();

  return (
    <RouteScaffold title="Gate Route" routePattern="/gate/:gateId">
      <dt className="font-medium text-slate-600">gateId</dt>
      <dd className="font-mono text-slate-900">{gateId}</dd>
    </RouteScaffold>
  );
}
