import type { ActivityMode } from "@/services/navigation/navigationContext";

export type CanonicalRouteTarget =
  | { objectType: "home" }
  | { objectType: "section"; id: string }
  | { objectType: "activity"; id: string; mode?: ActivityMode }
  | { objectType: "workflow"; id: string }
  | { objectType: "preConcealment"; id: string }
  | { objectType: "gate"; id: string }
  | { objectType: "term"; id: string }
  | { objectType: "search"; query?: string };

const encodePathId = (id: string) =>
  id
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

export const getCanonicalRoute = (target: CanonicalRouteTarget): string => {
  switch (target.objectType) {
    case "home":
      return "/";
    case "section":
      return `/section/${encodePathId(target.id)}`;
    case "activity": {
      const path = `/activity/${encodePathId(target.id)}`;

      return target.mode ? `${path}?mode=${target.mode}` : path;
    }
    case "workflow":
      return `/workflow/${encodePathId(target.id)}`;
    case "preConcealment":
      return `/preconcealment/${encodePathId(target.id)}`;
    case "gate":
      return `/gate/${encodePathId(target.id)}`;
    case "term":
      return `/term/${encodePathId(target.id)}`;
    case "search":
      return target.query
        ? `/search?q=${encodeURIComponent(target.query)}`
        : "/search";
  }
};
