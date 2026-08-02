import type { Product, Registry } from '../types';
import { esc, observeReveal } from '../utils';
import { getTheme, setTheme, type Theme } from '../theme';

const GITHUB_SVG = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;
const SUN_SVG = `<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const MOON_SVG = `<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
let navbarScrollListenerAttached = false;

const navbarScrollHandler = (): void => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
};

function externalLinkAttributes(url: string): string {
  return `href="${esc(url)}" target="_blank" rel="noopener noreferrer"`;
}

function productStatus(status: Product['status']): string {
  return status.replace('-', ' ');
}

function renderProductCard(product: Product, delay: number): string {
  const links = [
    `<a href="${esc(product.docsUrl)}">Documentation</a>`,
    `<a ${externalLinkAttributes(product.repoUrl)}>Source</a>`,
    product.releaseUrl
      ? `<a ${externalLinkAttributes(product.releaseUrl)}>Releases</a>`
      : '',
  ].join('');

  return `
    <article class="product-card" style="animation-delay:${delay}ms">
      <div class="product-card__header">
        <span class="product-category">${esc(product.category.replace('-', ' '))}</span>
        <span class="product-status product-status--${esc(product.status)}">${esc(productStatus(product.status))}</span>
      </div>
      <div>
        <h3 class="product-card__title">${esc(product.name)}</h3>
        <p class="product-card__summary">${esc(product.summary)}</p>
      </div>
      <div class="product-stack" aria-label="Technology stack">
        ${product.techStack.map((technology) => `<span class="product-stack__item">${esc(technology)}</span>`).join('')}
      </div>
      <div class="product-links">${links}</div>
    </article>`;
}

function toolbarHTML(): string {
  const theme = getTheme();
  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
  return `
    <button class="toolbar__btn" id="theme-toggle" type="button" aria-label="Switch to ${nextTheme} theme" title="Switch to ${nextTheme} theme">
      ${theme === 'dark' ? SUN_SVG : MOON_SVG}
    </button>`;
}

export function renderHome(app: HTMLElement, data: Registry): void {
  const products = data.products;

  app.innerHTML = `
    <nav class="nav" id="navbar" aria-label="Primary navigation">
      <div class="nav__inner">
        <a href="/" class="nav__brand" aria-label="Enolalab home">
          <img class="nav__logo" src="/logo.png" alt="" />
          <span>Enolalab</span>
        </a>
        <div class="nav__links" id="nav-links">
          <a href="#products" class="nav__link">Products</a>
          <a ${externalLinkAttributes('https://github.com/enolalab/showcase')} class="nav__link">${GITHUB_SVG} GitHub</a>
          ${toolbarHTML()}
        </div>
        <button class="nav__toggle" id="nav-toggle" type="button" aria-label="Open navigation menu" aria-controls="nav-links" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <main>
      <header class="hero" id="hero">
        <div class="hero__grid" aria-hidden="true"></div>
        <div class="hero__glow hero__glow--a" aria-hidden="true"></div>
        <div class="hero__glow hero__glow--b" aria-hidden="true"></div>
        <div class="hero__content">
          <p class="hero__eyebrow"><span class="dot dot--pulse" aria-hidden="true"></span> Open-source tools and systems</p>
          <h1 class="hero__title">Products built by <span class="gradient-text">Enolalab.</span></h1>
          <p class="hero__sub">Explore production projects, documentation, releases, and source code.</p>
          <a href="#products" class="btn btn--primary">Explore products</a>
        </div>
      </header>

      <section class="section reveal" id="products" aria-labelledby="products-title">
        <div class="container">
          <div class="section__header">
            <p class="section__tag">The catalogue</p>
            <h2 class="section__title" id="products-title">All products</h2>
            <p class="section__desc">Tools for building, documenting, automating, and seeing more clearly.</p>
          </div>
          <div class="product-grid">
            ${products.map((product, index) => renderProductCard(product, index * 80)).join('')}
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer__inner">
        <a href="/" class="footer__brand"><img class="nav__logo" src="/logo.png" alt="" /> Enolalab</a>
        <p class="footer__tag">Open-source tools and systems built by Enolalab.</p>
        <a ${externalLinkAttributes('https://github.com/enolalab/showcase')} class="footer__link">GitHub</a>
      </div>
    </footer>
  `;

  initNavbar();
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const nextTheme: Theme = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    renderHome(app, data);
  });
  observeReveal('.reveal');
}

function initNavbar(): void {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;

  const closeMenu = (): void => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  };

  if (!navbarScrollListenerAttached) {
    window.addEventListener('scroll', navbarScrollHandler);
    navbarScrollListenerAttached = true;
  }
  navbarScrollHandler();
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}
