import type { Product, Registry } from '../types';
import { esc } from '../utils';
import { getTheme, setTheme } from '../theme';
import type { Theme } from '../theme';

function statusLabel(status: Product['status']): string {
  return status.replace('-', ' ');
}

function renderProductCard(product: Product): string {
  return `
    <article class="product-card">
      <div class="product-card__header">
        <p class="product-status product-status--${product.status}">${esc(statusLabel(product.status))}</p>
        <p class="product-card__category">${esc(product.category)}</p>
      </div>
      <h3><a class="product-card__title" href="${esc(product.docsUrl)}">${esc(product.name)}</a></h3>
      <p class="product-card__summary">${esc(product.summary)}</p>
      <ul class="product-stack" aria-label="Technology stack">
        ${product.techStack.map(technology => `<li>${esc(technology)}</li>`).join('')}
      </ul>
      <div class="product-links">
        <a href="${esc(product.docsUrl)}">Documentation</a>
        <a href="${esc(product.repoUrl)}" target="_blank" rel="noopener noreferrer">Source</a>
        ${product.releaseUrl ? `<a href="${esc(product.releaseUrl)}" target="_blank" rel="noopener noreferrer">Releases</a>` : ''}
      </div>
    </article>`;
}

function toolbarHTML(): string {
  const theme = getTheme();
  const label = theme === 'dark' ? 'Use light theme' : 'Use dark theme';

  return `<button class="toolbar__btn" id="theme-toggle" aria-label="${label}" title="${label}">
    ${theme === 'dark' ? 'Light' : 'Dark'}
  </button>`;
}

export function renderHome(app: HTMLElement, data: Registry): void {
  app.innerHTML = `
    <nav class="nav" id="navbar" aria-label="Primary navigation">
      <div class="nav__inner">
        <a href="/" class="nav__brand"><img class="nav__logo" src="/logo.png" alt="" />Enolalab</a>
        <div class="nav__links" id="nav-links">
          <a href="#products" class="nav__link">Products</a>
          <a href="https://github.com/enolalab" target="_blank" rel="noopener noreferrer" class="nav__link">GitHub</a>
          ${toolbarHTML()}
        </div>
        <button class="nav__toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </nav>

    <header class="hero">
      <div class="hero__content">
        <p class="hero__eyebrow">Open-source tools and systems</p>
        <h1>Products built by Enolalab.</h1>
        <p class="hero__summary">Explore production projects, documentation, releases, and source code.</p>
      </div>
    </header>

    <section class="products" id="products" aria-labelledby="products-title">
      <div class="container">
        <div class="products__header">
          <h2 id="products-title">Featured products</h2>
          <p>Independent tools with documentation and source available to explore.</p>
        </div>
        <div class="product-grid">
          ${data.products.map(renderProductCard).join('')}
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container footer__inner">
        <a href="/" class="footer__brand">Enolalab</a>
        <a href="https://github.com/enolalab" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  `;

  initNavbar();
  initToolbar(app, data);
}

function initNavbar(): void {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

function initToolbar(app: HTMLElement, data: Registry): void {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    renderHome(app, data);
  });
}
