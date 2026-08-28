import type { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

import { productionRegistries } from "@/app/productionAppData";
import { getSectionVisual } from "@/screens/screenVisuals";
import { classNames } from "@/utils/classNames";

import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const surfaceClassName = getRouteSurfaceClassName(location.pathname);

  return (
    <div className="qcfg-app-shell">
      <AppSidebar />
      <div className="min-h-screen md:pl-[255px]">
        <AppHeader
          appName="QC/QA"
          homeLabel="QC Field Guide home"
          languageLabel="Language preference"
          searchLabel="Search"
        />
        <main
          className={classNames(
            "qcfg-main-surface min-w-0 p-4 md:min-h-[calc(100vh-53px)] md:pb-6 md:pl-6 md:pr-[18px] md:pt-6",
            surfaceClassName
          )}
          data-testid="app-main-surface"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function getRouteSurfaceClassName(pathname: string) {
  if (pathname === "/") return "qcfg-page-home";
  if (pathname.startsWith("/general-qc")) return "qcfg-page-general-qc";
  if (pathname.startsWith("/search")) return "qcfg-page-search";
  if (pathname.startsWith("/term/")) return "qcfg-page-terminology";
  if (pathname.startsWith("/gate/")) return "qcfg-page-gate";

  const routeId = getRouteObjectId(pathname, "section");
  if (routeId) return getSectionVisual(routeId).tokenClass;

  const activityId = getRouteObjectId(pathname, "activity");
  if (activityId) {
    const activity = productionRegistries.activities.getById(activityId);
    return getSectionVisual(activity?.sectionId).tokenClass;
  }

  const workflowId = getRouteObjectId(pathname, "workflow");
  if (workflowId) {
    const workflow = productionRegistries.workflows.getById(workflowId);
    const activityId = workflow?.activityIds?.[0];
    const activity = activityId
      ? productionRegistries.activities.getById(activityId)
      : undefined;
    return getSectionVisual(activity?.sectionId).tokenClass;
  }

  const preConcealmentId = getRouteObjectId(pathname, "preconcealment");
  if (preConcealmentId) {
    const workflow =
      productionRegistries.preConcealmentWorkflows.getById(preConcealmentId);
    const activityId = workflow?.activityIds?.[0];
    const activity = activityId
      ? productionRegistries.activities.getById(activityId)
      : undefined;
    return getSectionVisual(activity?.sectionId).tokenClass;
  }

  return "qcfg-system-default";
}

function getRouteObjectId(pathname: string, segment: string) {
  const prefix = `/${segment}/`;
  if (!pathname.startsWith(prefix)) return undefined;

  return decodeURIComponent(pathname.slice(prefix.length).split("/")[0] ?? "");
}
