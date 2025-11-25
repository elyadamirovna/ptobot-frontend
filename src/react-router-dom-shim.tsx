import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type To = string | { pathname: string; search?: string };

type NavigateFunction = (to: To | number, options?: { replace?: boolean }) => void;

interface RouteProps {
  path?: string;
  element?: React.ReactNode;
  children?: React.ReactNode;
}

interface RouterContextValue {
  location: { pathname: string; search: string };
  navigate: NavigateFunction;
}

const RouterContext = createContext<RouterContextValue | null>(null);
const ParamsContext = createContext<Record<string, string>>({});

const getWindowLocation = () => {
  if (typeof window === "undefined") {
    return { pathname: "/", search: "" };
  }
  return { pathname: window.location.pathname, search: window.location.search };
};

const matchPath = (pathname: string, path?: string) => {
  if (!path) return { matched: true, params: {} };

  const trim = (value: string) => value.replace(/^\/+|\/+$/g, "");
  const pathSegments = trim(path).split("/").filter(Boolean);
  const urlSegments = trim(pathname).split("/").filter(Boolean);

  if (pathSegments.length !== urlSegments.length) return { matched: false, params: {} };

  const params: Record<string, string> = {};
  for (let i = 0; i < pathSegments.length; i += 1) {
    const routeSegment = pathSegments[i];
    const urlSegment = urlSegments[i];
    if (routeSegment.startsWith(":")) {
      params[routeSegment.slice(1)] = decodeURIComponent(urlSegment);
    } else if (routeSegment !== urlSegment) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
};

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState(getWindowLocation());

  useEffect(() => {
    const handler = () => setLocation(getWindowLocation());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate: NavigateFunction = (to, options) => {
    if (typeof to === "number") {
      window.history.go(to);
      setLocation(getWindowLocation());
      return;
    }

    const target = typeof to === "string" ? to : `${to.pathname}${to.search ?? ""}`;
    if (options?.replace) {
      window.history.replaceState({}, "", target);
    } else {
      window.history.pushState({}, "", target);
    }
    setLocation(getWindowLocation());
  };

  const contextValue = useMemo(() => ({ location, navigate }), [location]);

  return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>;
}

export function Routes({ children }: { children?: React.ReactNode }) {
  const router = useContext(RouterContext);
  if (!router) throw new Error("Routes must be used inside BrowserRouter");

  const { pathname } = router.location;
  const routeElements = React.Children.toArray(children) as React.ReactElement<RouteProps>[];

  for (const routeElement of routeElements) {
    if (!React.isValidElement<RouteProps>(routeElement)) continue;
    const { path, element } = routeElement.props;
    const { matched, params } = matchPath(pathname, path);
    if (matched) {
      return <ParamsContext.Provider value={params}>{element ?? null}</ParamsContext.Provider>;
    }
  }

  return null;
}

export function Route(_props: RouteProps) {
  return null;
}

export function useLocation() {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useLocation must be used inside BrowserRouter");
  return router.location;
}

export function useNavigate() {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useNavigate must be used inside BrowserRouter");
  return router.navigate;
}

export function useParams() {
  return useContext(ParamsContext);
}

export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | string) => void] {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useSearchParams must be used inside BrowserRouter");

  const setSearchParams = (params: URLSearchParams | string) => {
    const search = typeof params === "string" ? params : params.toString();
    router.navigate({ pathname: router.location.pathname, search: search ? `?${search}` : "" });
  };

  return [new URLSearchParams(router.location.search), setSearchParams];
}

export function Outlet() {
  return null;
}
