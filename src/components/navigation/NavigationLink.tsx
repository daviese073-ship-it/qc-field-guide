import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import {
  getCanonicalRoute,
  type CanonicalRouteTarget
} from "@/services/navigation";
import { classNames } from "@/utils/classNames";

type NavigationLinkProps = PropsWithChildren<{
  target: CanonicalRouteTarget;
  className?: string;
}>;

export function NavigationLink({
  children,
  className,
  target
}: NavigationLinkProps) {
  return (
    <Link
      className={classNames("text-blue-700 hover:underline", className)}
      to={getCanonicalRoute(target)}
    >
      {children}
    </Link>
  );
}
