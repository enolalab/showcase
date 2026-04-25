// ===== Guide Page =====
import { navigate } from '../router';
import { t, getLang, setLang } from '../i18n';
import { getTheme, setTheme } from '../theme';
import type { Lang } from '../i18n';
import type { Theme } from '../theme';

const GITHUB_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;

function toolbarHTML(): string {
  const lang = getLang();
  const theme = getTheme();
  const sunIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  return `
    <div class="toolbar">
      <button class="toolbar__btn" id="theme-toggle-guide" aria-label="Toggle theme">
        ${theme === 'dark' ? sunIcon : moonIcon}
      </button>
      <button class="toolbar__btn toolbar__lang" id="lang-toggle-guide" aria-label="Toggle language">
        ${lang === 'vi' ? 'EN' : 'VI'}
      </button>
    </div>`;
}

export function renderGuide(app: HTMLElement): void {
  const i = t();

  app.innerHTML = `
    <nav class="nav scrolled" id="navbar-guide">
      <div class="nav__inner">
        <a class="nav__brand" id="guide-back" href="#"><img class="nav__logo" src="/logo.png" alt="enolalab" /> enolalab</a>
        <div class="nav__links">
          <a class="nav__link" id="guide-home-link">${i.guideBack}</a>
          ${toolbarHTML()}
          <a href="https://github.com/enolalab/showcase" target="_blank" rel="noopener" class="nav__cta">
            ${GITHUB_SVG} GitHub
          </a>
        </div>
      </div>
    </nav>

    <main class="guide" id="guide-content">
      <div class="container">
        <div class="guide__header">
          <span class="section__tag">${i.guideTag}</span>
          <h1 class="guide__title">${i.guideTitle}</h1>
          <p class="guide__sub">${i.guideSub}</p>
        </div>

        <div class="guide__section">
          <h2 class="guide__h2">${i.guideReqTitle}</h2>
          <div class="guide__card">
            <ul class="guide__list">
              <li>${i.guideReq1}</li>
              <li>${i.guideReq2}</li>
              <li>${i.guideReq3}</li>
              <li>${i.guideReq4}</li>
              <li>${i.guideReq5}</li>
            </ul>
          </div>
        </div>

        <div class="guide__section">
          <h2 class="guide__h2">${i.guideStepsTitle}</h2>
          <div class="guide__step">
            <div class="guide__step-num">1</div>
            <div class="guide__step-body">
              <h3>${i.guideStep1}</h3>
              <p>${i.guideStep1Desc}</p>
              <pre class="guide__code"><code>git clone https://github.com/&lt;your-username&gt;/ropascis.git
cd ropascis</code></pre>
            </div>
          </div>
          <div class="guide__step">
            <div class="guide__step-num">2</div>
            <div class="guide__step-body">
              <h3>${i.guideStep2}</h3>
              <p>${i.guideStep2Desc}</p>
              <pre class="guide__code"><code>mkdir -p projects/my-awesome-project</code></pre>
              <pre class="guide__code"><code>projects/
└── my-awesome-project/
    ├── index.html    ← Required
    ├── style.css
    ├── script.js
    └── assets/</code></pre>
            </div>
          </div>
          <div class="guide__step">
            <div class="guide__step-num">3</div>
            <div class="guide__step-body">
              <h3>${i.guideStep3}</h3>
              <p>${i.guideStep3Desc}</p>
              <pre class="guide__code"><code>{
  "id": "my-awesome-project",
  "name": "My Awesome Project",
  "description": "Short description (max 150 chars)",
  "author": {
    "name": "your-name",
    "github": "your-github-username",
    "avatar": "https://github.com/your-github-username.png"
  },
  "category": "web",
  "tags": ["tag1", "tag2"],
  "thumbnail": null,
  "path": "projects/my-awesome-project",
  "liveUrl": null,
  "repoUrl": "https://github.com/you/your-repo",
  "createdAt": "2026-04-25",
  "featured": false
}</code></pre>
              <p>${i.guideStep3Cat}</p>
            </div>
          </div>
          <div class="guide__step">
            <div class="guide__step-num">4</div>
            <div class="guide__step-body">
              <h3>${i.guideStep4}</h3>
              <pre class="guide__code"><code>git checkout -b feat/add-my-awesome-project
git add .
git commit -m "feat: add my-awesome-project"
git push origin feat/add-my-awesome-project</code></pre>
              <p>${i.guideStep4Desc}</p>
            </div>
          </div>
        </div>

        <div class="guide__section">
          <h2 class="guide__h2">${i.guideCheckTitle}</h2>
          <div class="guide__card">
            <ul class="guide__checklist">
              <li><span class="check">☐</span> ${i.guideCheck1}</li>
              <li><span class="check">☐</span> ${i.guideCheck2}</li>
              <li><span class="check">☐</span> ${i.guideCheck3}</li>
              <li><span class="check">☐</span> ${i.guideCheck4}</li>
              <li><span class="check">☐</span> ${i.guideCheck5}</li>
              <li><span class="check">☐</span> ${i.guideCheck6}</li>
            </ul>
          </div>
        </div>

        <div class="guide__section">
          <h2 class="guide__h2">${i.guideFaqTitle}</h2>
          <div class="guide__faq">
            <details class="faq-item"><summary>${i.faq1Q}</summary><p>${i.faq1A}</p></details>
            <details class="faq-item"><summary>${i.faq2Q}</summary><p>${i.faq2A}</p></details>
            <details class="faq-item"><summary>${i.faq3Q}</summary><p>${i.faq3A}</p></details>
            <details class="faq-item"><summary>${i.faq4Q}</summary><p>${i.faq4A}</p></details>
          </div>
        </div>

        <div class="guide__cta">
          <a href="https://github.com/enolalab/showcase" target="_blank" class="btn btn--primary btn--lg">
            ${GITHUB_SVG} ${i.guideCta}
          </a>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer__inner">
          <div class="footer__brand"><img class="nav__logo" src="/logo.png" alt="enolalab" /> enolalab</div>
          <p class="footer__tag">${i.footerTag}</p>
        </div>
      </div>
    </footer>
  `;

  // Nav links
  ['guide-back', 'guide-home-link'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('home');
    });
  });

  // Toolbar
  document.getElementById('theme-toggle-guide')?.addEventListener('click', () => {
    const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    renderGuide(app);
  });
  document.getElementById('lang-toggle-guide')?.addEventListener('click', () => {
    const next: Lang = getLang() === 'vi' ? 'en' : 'vi';
    setLang(next);
    renderGuide(app);
  });

  window.scrollTo(0, 0);
}
