import { useParams } from "react-router-dom";

import { RouteScaffold } from "@/components/content/RouteScaffold";

export function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();

  return (
    <RouteScaffold title="Section Route" routePattern="/section/:sectionId">
      <dt className="font-medium text-slate-600">sectionId</dt>
      <dd className="font-mono text-slate-900">{sectionId}</dd>
    </RouteScaffold>
  );
}
