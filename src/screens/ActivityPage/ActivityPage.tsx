import { useParams } from "react-router-dom";

import { RouteScaffold } from "@/components/content/RouteScaffold";

export function ActivityPage() {
  const { activityId } = useParams<{ activityId: string }>();

  return (
    <RouteScaffold title="Activity Route" routePattern="/activity/:activityId">
      <dt className="font-medium text-slate-600">activityId</dt>
      <dd className="font-mono text-slate-900" data-testid="activity-id">
        {activityId}
      </dd>
    </RouteScaffold>
  );
}
