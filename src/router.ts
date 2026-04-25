// ===== Simple hash-based router =====
import type { PageRoute } from './types';

type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {};

export function registerRoute(path: PageRoute, handler: RouteHandler): void {
  routes[path] = handler;
}

export function navigate(path: PageRoute): void {
  window.location.hash = path === 'home' ? '' : path;
}

export function getCurrentRoute(): PageRoute {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash === 'guide') return 'guide';
  return 'home';
}

export function initRouter(): void {
  const handleRoute = () => {
    const route = getCurrentRoute();
    const handler = routes[route];
    if (handler) handler();
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
