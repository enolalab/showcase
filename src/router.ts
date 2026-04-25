// ===== Simple hash-based router =====
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
  if (path === 'home') {
    window.location.hash = '';
  } else if (path === 'project' && param) {
    window.location.hash = `project/${param}`;
  } else {
    window.location.hash = path;
  }
}

export interface ParsedRoute {
  route: string;
  param?: string;
}

export function getCurrentRoute(): ParsedRoute {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash.startsWith('project/')) {
    return { route: 'project', param: hash.replace('project/', '') };
  }
  if (hash === 'guide') return { route: 'guide' };
  return { route: 'home' };
}

export function initRouter(): void {
  const handleRoute = () => {
    const { route, param } = getCurrentRoute();
    if (route === 'project' && param && projectHandler) {
      projectHandler(param);
    } else {
      const handler = routes[route];
      if (handler) handler();
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
