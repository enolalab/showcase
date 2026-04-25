// ===== Enolalab Showcase — Entry Point =====
import './styles/index.css';
import { loadRegistry } from './data';
import { registerRoute, initRouter } from './router';
import { renderHome } from './pages/home';
import { renderGuide } from './pages/guide';
import { initTheme } from './theme';
import { getLang } from './i18n';

async function bootstrap(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  // Initialize theme & lang from localStorage
  initTheme();
  document.documentElement.setAttribute('lang', getLang());

  const data = await loadRegistry();

  registerRoute('home', () => renderHome(app, data));
  registerRoute('guide', () => renderGuide(app));

  initRouter();
}

bootstrap();
