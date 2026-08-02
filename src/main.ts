// ===== Enolalab Showcase — Entry Point =====
import './styles/index.css';
import { loadRegistry } from './data';
import { registerRoute, registerProjectRoute, initRouter } from './router';
import { renderHome } from './pages/home';
import { redirectToProductDocs } from './pages/viewer';
import { initTheme } from './theme';

async function bootstrap(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  // Initialize theme from localStorage
  initTheme();

  const data = await loadRegistry();

  registerRoute('home', () => renderHome(app, data));
  registerProjectRoute((productId) => {
    redirectToProductDocs(data, productId);
  });

  initRouter();
}

bootstrap();
