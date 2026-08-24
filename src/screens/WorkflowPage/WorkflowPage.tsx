import { useParams } from "react-router-dom";

import { RouteScaffold } from "@/components/content/RouteScaffold";

export function WorkflowPage() {
  const { workflowId } = useParams<{ workflowId: string }>();

  return (
    <RouteScaffold title="Workflow Route" routePattern="/workflow/:workflowId">
      <dt className="font-medium text-slate-600">workflowId</dt>
      <dd className="font-mono text-slate-900">{workflowId}</dd>
    </RouteScaffold>
  );
}
