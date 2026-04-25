// ===== Project Viewer Page =====
import { navigate } from '../router';
import { t, getLang, setLang } from '../i18n';
import { getTheme, setTheme } from '../theme';
import type { Registry, Project, Category } from '../types';
import type { Lang } from '../i18n';
import type { Theme } from '../theme';

function toolbarHTML(): string {
  const lang = getLang();
  const theme = getTheme();
  const sunIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  return `
    <div class="toolbar">
      <button class="toolbar__btn" id="theme-toggle-viewer" aria-label="Toggle theme">
        ${theme === 'dark' ? sunIcon : moonIcon}
      </button>
      <button class="toolbar__btn toolbar__lang" id="lang-toggle-viewer" aria-label="Toggle language">
        ${lang === 'vi' ? 'EN' : 'VI'}
      </button>
    </div>`;
}

export function renderProjectViewer(app: HTMLElement, data: Registry, projectId: string): void {
  const i = t();
  const project = data.projects.find(p => p.id === projectId);
  const cat = data.categories.find(c => c.id === project?.category);

  if (!project) {
    app.innerHTML = `
      <div class="viewer-404">
        <h2>Project không tồn tại</h2>
        <p>Không tìm thấy project "<strong>${projectId}</strong>".</p>
        <button class="btn btn--primary" id="404-back">← ${i.guideBack}</button>
      </div>`;
    document.getElementById('404-back')?.addEventListener('click', () => navigate('home'));
    return;
  }

  const backArrow = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`;
  const externalIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

  const iframeSrc = `/${project.path}/index.html`;

  app.innerHTML = `
    <nav class="viewer-nav" id="viewer-nav">
      <div class="viewer-nav__inner">
        <div class="viewer-nav__left">
          <button class="viewer-nav__back" id="viewer-back" title="Về trang chủ">
            ${backArrow}
          </button>
          <a href="#" class="nav__brand" id="viewer-brand">
            <img class="nav__logo" src="/logo.png" alt="enolalab" /> enolalab
          </a>
          <span class="viewer-nav__sep">›</span>
          <span class="viewer-nav__project">
            <span class="viewer-nav__icon">${cat?.icon || '📦'}</span>
            ${project.name}
          </span>
        </div>
        <div class="viewer-nav__right">
          <span class="viewer-nav__author">
            <img class="viewer-nav__avatar" src="${project.author.avatar}" alt="${project.author.name}" onerror="this.style.display='none'" />
            ${project.author.name}
          </span>
          ${toolbarHTML()}
          ${project.repoUrl ? `<a href="${project.repoUrl}" target="_blank" rel="noopener" class="viewer-nav__link" title="Source code">${externalIcon}</a>` : ''}
          <a href="${iframeSrc}" target="_blank" rel="noopener" class="viewer-nav__link viewer-nav__link--open" title="Mở trong tab mới">${externalIcon} Mở tab mới</a>
        </div>
      </div>
    </nav>

    <div class="viewer-frame" id="viewer-frame">
      <iframe id="viewer-iframe" src="${iframeSrc}" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" allowfullscreen></iframe>
    </div>

    <footer class="viewer-footer">
      <div class="viewer-footer__inner">
        <div class="viewer-footer__brand">
          <img class="nav__logo" src="/logo.png" alt="enolalab" /> enolalab
        </div>
        <p class="viewer-footer__tag">${i.footerTag}</p>
        <div class="viewer-footer__links">
          <a href="#" id="footer-back-home">← ${getLang() === 'vi' ? 'Về trang chủ' : 'Back to home'}</a>
          <a href="https://github.com/enolalab/showcase" target="_blank">GitHub</a>
        </div>
      </div>
    </footer>
  `;

  // Event listeners
  const goHome = (e: Event) => { e.preventDefault(); navigate('home'); };
  document.getElementById('viewer-back')?.addEventListener('click', goHome);
  document.getElementById('viewer-brand')?.addEventListener('click', goHome);
  document.getElementById('footer-back-home')?.addEventListener('click', goHome);

  // Toolbar
  document.getElementById('theme-toggle-viewer')?.addEventListener('click', () => {
    const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    renderProjectViewer(app, data, projectId);
  });
  document.getElementById('lang-toggle-viewer')?.addEventListener('click', () => {
    const next: Lang = getLang() === 'vi' ? 'en' : 'vi';
    setLang(next);
    renderProjectViewer(app, data, projectId);
  });
}
