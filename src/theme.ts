// ===== Theme (dark/light) =====
export type Theme = 'dark' | 'light';

let currentTheme: Theme = (localStorage.getItem('theme') as Theme) || 'dark';

export function getTheme(): Theme {
  return currentTheme;
}

export function setTheme(theme: Theme): void {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme(): void {
  setTheme(currentTheme);
}
