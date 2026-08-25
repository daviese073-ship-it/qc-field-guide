import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { App } from "@/app/App";
import { ActivityPage } from "@/screens/ActivityPage/ActivityPage";
import { GatePage } from "@/screens/GatePage/GatePage";
import { GeneralQcProcessDetailPage } from "@/screens/GeneralQcProcessesPage/GeneralQcProcessDetailPage";
import { GeneralQcProcessesPage } from "@/screens/GeneralQcProcessesPage/GeneralQcProcessesPage";
import { HomePage } from "@/screens/HomePage/HomePage";
import { NotFoundPage } from "@/screens/NotFoundPage/NotFoundPage";
import { PreConcealmentPage } from "@/screens/PreConcealmentPage/PreConcealmentPage";
import { SearchPage } from "@/screens/SearchPage/SearchPage";
import { SectionPage } from "@/screens/SectionPage/SectionPage";
import { TerminologyPage } from "@/screens/TerminologyPage/TerminologyPage";
import { WorkflowPage } from "@/screens/WorkflowPage/WorkflowPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "section/:sectionId", element: <SectionPage /> },
      { path: "activity/:activityId", element: <ActivityPage /> },
      { path: "workflow/:workflowId", element: <WorkflowPage /> },
      { path: "general-qc", element: <GeneralQcProcessesPage /> },
      {
        path: "general-qc/:processId",
        element: <GeneralQcProcessDetailPage />
      },
      {
        path: "preconcealment/:preConcealmentId",
        element: <PreConcealmentPage />
      },
      { path: "gate/:gateId", element: <GatePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "term/:conceptId", element: <TerminologyPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

export const router = createBrowserRouter(routes);
