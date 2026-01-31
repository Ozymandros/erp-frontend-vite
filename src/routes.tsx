import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import type { RouteDefinition } from "@/config/app-routes";
import { ROUTE_DEFINITIONS } from "@/config/app-routes";

function renderRoutes(definitions: RouteDefinition[], keyPrefix = ""): ReactElement[] {
  return definitions.map((def, i) => {
    const key = `${keyPrefix}-${def.path ?? "layout"}-${i}`;
    if (def.children) {
      return (
        <Route key={key} element={def.element}>
          {renderRoutes(def.children, key)}
        </Route>
      );
    }
    const leafProps = {
      key,
      element: def.element,
      ...(def.path !== undefined && { path: def.path }),
      ...(def.index !== undefined && { index: def.index }),
    };
    return <Route {...leafProps} />;
  });
}

export function AppRoutes() {
  return <Routes>{renderRoutes(ROUTE_DEFINITIONS)}</Routes>;
}
