// ===== Path-based SPA router =====
type RouteHandler = () => void;
type DynRouteHandler = (param: string) => void;

const routes: Record<string, RouteHandler> = {};
let projectHandler: DynRouteHandler | null = null;

export function registerRoute(path: string, handler: RouteHandler): void {
  routes[path] = handler;
}

export function registerProjectRoute(handler: DynRouteHandler): void {
  projectHandler = handler;
}

export function navigate(path: string, param?: string): void {
  let url: string;
  if (path === 'home') {
    url = '/';
  } else if (path === 'project' && param) {
    url = `/projects/${param}`;
  } else {
    url = `/${path}`;
  }
  history.pushState(null, '', url);
  handleRoute();
}

export interface ParsedRoute {
  route: string;
  param?: string;
}

export function getCurrentRoute(pathname = window.location.pathname): ParsedRoute {
  const projectMatch = pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (projectMatch) {
    return { route: 'project', param: projectMatch[1] };
  }

  return { route: 'home' };
}

function handleRoute(): void {
  const { route, param } = getCurrentRoute();
  if (route === 'project' && param && projectHandler) {
    projectHandler(param);
  } else {
    const handler = routes[route];
    if (handler) handler();
  }
}

export function initRouter(): void {
  window.addEventListener('popstate', handleRoute);
  handleRoute();
}
