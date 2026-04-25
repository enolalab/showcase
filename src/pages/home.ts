// ===== Home Page =====
import type { Category, Project, Registry } from '../types';
import { esc, animateCount, observeReveal, typeTerminal } from '../utils';
import { navigate } from '../router';
import { t, getLang, setLang } from '../i18n';
import { getTheme, setTheme } from '../theme';
import type { Lang } from '../i18n';
import type { Theme } from '../theme';

function renderProjectCard(p: Project, cat: Category, delay: number): string {
  const badgeBg = `${cat.color}18`;
  const badgeBorder = `${cat.color}30`;
  return `
    <article class="card" data-category="${p.category}" style="animation-delay:${delay}ms" id="project-${p.id}">
      <div class="card__thumb" style="background:linear-gradient(135deg,${cat.color}15,${cat.color}05)">
        <span class="card__thumb-icon">${cat.icon}</span>
        ${p.featured ? '<span class="card__featured">⭐ Featured</span>' : ''}
      </div>
      <div class="card__body">
        <span class="card__badge" style="background:${badgeBg};color:${cat.color};border:1px solid ${badgeBorder}">
          ${cat.icon} ${esc(cat.name)}
        </span>
        <h3 class="card__title">${esc(p.name)}</h3>
        <p class="card__desc">${esc(p.description)}</p>
        <div class="card__tags">
          ${p.tags.slice(0, 4).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
        </div>
        <div class="card__meta">
          <div class="card__author">
            <img class="card__avatar" src="${esc(p.author.avatar)}" alt="${esc(p.author.name)}" loading="lazy" onerror="this.style.display='none'" />
            <span>${esc(p.author.name)}</span>
          </div>
          <span class="card__date">${p.createdAt}</span>
        </div>
      </div>
    </article>`;
}

function toolbarHTML(): string {
  const lang = getLang();
  const theme = getTheme();
  const sunIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  return `
    <div class="toolbar">
      <button class="toolbar__btn" id="theme-toggle" aria-label="Toggle theme" title="${theme === 'dark' ? 'Light mode' : 'Dark mode'}">
        ${theme === 'dark' ? sunIcon : moonIcon}
      </button>
      <button class="toolbar__btn toolbar__lang" id="lang-toggle" aria-label="Toggle language" title="Switch language">
        ${lang === 'vi' ? 'EN' : 'VI'}
      </button>
    </div>`;
}

const GITHUB_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;
const GITHUB_SVG_18 = GITHUB_SVG.replace('16', '18').replace('16', '18');

const STEP_ICONS = {
  fork: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  pr: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  deploy: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

export function renderHome(app: HTMLElement, data: Registry): void {
  const i = t();
  const catMap = new Map(data.categories.map(c => [c.id, c]));
  const fallbackCat: Category = { id: 'other', name: 'Khác', icon: '✨', color: '#a18cd1' };
  const sorted = [...data.projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const uniqueAuthors = new Set(data.projects.map(p => p.author.github)).size;

  app.innerHTML = `
    <nav class="nav" id="navbar">
      <div class="nav__inner">
        <a href="/" class="nav__brand"><img class="nav__logo" src="/logo.png" alt="Enolalab" /> Enolalab</a>
        <div class="nav__links" id="nav-links">
          <a href="#projects" class="nav__link">${i.navProjects}</a>
          <a href="#how" class="nav__link">${i.navHowItWorks}</a>
          <a class="nav__link" id="nav-guide-link">${i.navGuide}</a>
          ${toolbarHTML()}
          <a href="https://github.com/Enolalab/showcase" target="_blank" rel="noopener" class="nav__cta" id="nav-contribute">
            ${GITHUB_SVG} ${i.navContribute}
          </a>
        </div>
        <button class="nav__toggle" id="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </nav>

    <header class="hero" id="hero">
      <div class="hero__grid"></div>
      <div class="hero__glow hero__glow--a"></div>
      <div class="hero__glow hero__glow--b"></div>
      <div class="hero__content">
        <div class="hero__badge"><span class="dot dot--pulse"></span>${i.heroBadge}</div>
        <h1 class="hero__title">${i.heroTitle1}<br/><span class="gradient-text">${i.heroTitle2}</span></h1>
        <p class="hero__sub">${i.heroSub1}<br/>${i.heroSub2}</p>
        <div class="hero__actions">
          <a href="https://github.com/Enolalab/showcase" target="_blank" class="btn btn--primary" id="hero-cta">
            ${GITHUB_SVG_18} ${i.heroSubmit}
          </a>
          <a href="#projects" class="btn btn--ghost">${i.heroExplore}</a>
        </div>
        <div class="terminal" id="terminal">
          <div class="terminal__bar"><span class="terminal__dot terminal__dot--r"></span><span class="terminal__dot terminal__dot--y"></span><span class="terminal__dot terminal__dot--g"></span><span class="terminal__title">terminal</span></div>
          <div class="terminal__body">
            <div class="term-line"><span class="term-ps">$</span><span class="term-cmd" data-text="git clone https://github.com/Enolalab/showcase.git"></span></div>
            <div class="term-line"><span class="term-ps">$</span><span class="term-cmd" data-text="cp -r my-project/ projects/my-project/"></span></div>
            <div class="term-line"><span class="term-ps">$</span><span class="term-cmd" data-text="git push origin main && # Create PR 🚀"></span></div>
            <div class="term-line term-line--ok"><span class="term-output">${i.terminalSuccess}</span></div>
          </div>
        </div>
      </div>
    </header>

    <section class="section reveal" id="how">
      <div class="container">
        <div class="section__header">
          <span class="section__tag">${i.howTag}</span>
          <h2 class="section__title">${i.howTitle1}<span class="gradient-text">${i.howTitle2}</span></h2>
          <p class="section__desc">${i.howDesc}</p>
        </div>
        <div class="steps">
          <div class="step" id="step-1"><div class="step__num">01</div><div class="step__icon">${STEP_ICONS.fork}</div><h3 class="step__title">${i.step1Title}</h3><p class="step__desc">${i.step1Desc}</p></div>
          <div class="step-arrow">→</div>
          <div class="step" id="step-2"><div class="step__num">02</div><div class="step__icon">${STEP_ICONS.pr}</div><h3 class="step__title">${i.step2Title}</h3><p class="step__desc">${i.step2Desc}</p></div>
          <div class="step-arrow">→</div>
          <div class="step" id="step-3"><div class="step__num">03</div><div class="step__icon">${STEP_ICONS.deploy}</div><h3 class="step__title">${i.step3Title}</h3><p class="step__desc">${i.step3Desc}</p></div>
        </div>
      </div>
    </section>

    <section class="section reveal" id="projects">
      <div class="container">
        <div class="section__header">
          <span class="section__tag">${i.projTag}</span>
          <h2 class="section__title">${i.projTitle1}<span class="gradient-text">${i.projTitle2}</span></h2>
          <p class="section__desc">${i.projDesc}</p>
        </div>
        <div class="filters" id="filters">
          <button class="filter active" data-cat="all" id="filter-all"><span>🔥</span> ${i.filterAll}</button>
          ${data.categories.map(c => `<button class="filter" data-cat="${c.id}" id="filter-${c.id}"><span>${c.icon}</span> ${esc(c.name)}</button>`).join('')}
        </div>
        <div class="grid" id="grid">
          ${sorted.map((p, idx) => renderProjectCard(p, catMap.get(p.category) || fallbackCat, idx * 80)).join('')}
        </div>
        ${!data.projects.length ? `
          <div class="empty">
            <div class="empty__icon">📭</div>
            <h3>${i.emptyTitle}</h3>
            <p>${i.emptyDesc}</p>
            <a href="https://github.com/Enolalab/showcase" target="_blank" class="btn btn--primary">${i.emptyBtn}</a>
          </div>` : ''}
      </div>
    </section>

    <section class="section section--stats reveal" id="stats">
      <div class="container">
        <div class="stats-grid" id="stats-grid">
          <div class="stat"><div class="stat__val" data-target="${data.projects.length}">0</div><div class="stat__label">${i.statProjects}</div></div>
          <div class="stat"><div class="stat__val" data-target="${uniqueAuthors}">0</div><div class="stat__label">${i.statContributors}</div></div>
          <div class="stat"><div class="stat__val" data-target="${data.categories.length}">0</div><div class="stat__label">${i.statCategories}</div></div>
          <div class="stat"><div class="stat__val" data-target="100">0</div><div class="stat__label">${i.statFree}</div></div>
        </div>
      </div>
    </section>

    <section class="section section--cta reveal" id="cta">
      <div class="container">
        <div class="cta">
          <div class="cta__glow"></div>
          <h2 class="cta__title">${i.ctaTitle}</h2>
          <p class="cta__desc">${i.ctaDesc}</p>
          <div class="cta__actions">
            <a href="https://github.com/Enolalab/showcase" target="_blank" class="btn btn--primary btn--lg">${i.ctaSubmit}</a>
            <button class="btn btn--ghost btn--lg" id="cta-guide">${i.ctaGuide}</button>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div class="footer__inner">
          <div class="footer__brand"><img class="nav__logo" src="/logo.png" alt="Enolalab" /> Enolalab</div>
          <p class="footer__tag">${i.footerTag}</p>
          <div class="footer__links">
            <a href="https://github.com/Enolalab/showcase" target="_blank">GitHub</a>
            <a href="/guide" id="footer-guide-link">${i.footerGuide}</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  initNavbar();
  initFilters(sorted, catMap, fallbackCat);
  initTerminalAnim();
  initStats();
  initGuideLinks();
  initToolbar(app, data);
  observeReveal('.reveal');
}

function initNavbar(): void {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('.nav__link').forEach(l =>
    l.addEventListener('click', () => links.classList.remove('open'))
  );
}

function initFilters(sorted: Project[], _catMap: Map<string, Category>, _fallback: Category): void {
  const bar = document.getElementById('filters');
  if (!bar) return;
  bar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.filter') as HTMLElement | null;
    if (!btn) return;
    bar.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat || 'all';
    const grid = document.getElementById('grid');
    if (!grid) return;
    grid.querySelectorAll<HTMLElement>('.card').forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
    });
  });
  const grid = document.getElementById('grid');
  grid?.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('.card') as HTMLElement | null;
    if (!card) return;
    const id = card.id.replace('project-', '');
    const p = sorted.find(pr => pr.id === id);
    if (p) {
      // Navigate to in-app project viewer
      navigate('project', p.id);
    }
  });
}

function initTerminalAnim(): void {
  const terminal = document.getElementById('terminal');
  if (terminal) typeTerminal(terminal);
}

function initStats(): void {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        grid.querySelectorAll<HTMLElement>('.stat__val').forEach(el => {
          animateCount(el, parseInt(el.dataset.target || '0', 10));
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  observer.observe(grid);
}

function initGuideLinks(): void {
  ['nav-guide-link', 'cta-guide', 'footer-guide-link'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('guide');
    });
  });
}

function initToolbar(app: HTMLElement, data: Registry): void {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    renderHome(app, data); // re-render with new theme icon
  });
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    const next: Lang = getLang() === 'vi' ? 'en' : 'vi';
    setLang(next);
    renderHome(app, data); // re-render with new language
  });
}
