// ===== DOM utilities =====

/** Safely escape HTML */
export function esc(str: string): string {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/** Get typed element */
export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

/** Animate number counting up */
export function animateCount(el: HTMLElement, target: number, duration = 1200): void {
  const start = performance.now();
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Intersection Observer helper for scroll reveals */
export function observeReveal(selector: string): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
}

/** Terminal typing animation */
export function typeTerminal(container: HTMLElement): void {
  const lines = container.querySelectorAll<HTMLElement>('.term-cmd[data-text]');
  const output = container.querySelector<HTMLElement>('.term-output');
  let idx = 0;

  function typeLine(el: HTMLElement, text: string, cb: () => void) {
    let i = 0;
    const interval = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(interval);
        el.classList.add('done');
        setTimeout(cb, 250);
      }
    }, 25);
  }

  function next() {
    if (idx >= lines.length) {
      if (output) setTimeout(() => output.classList.add('visible'), 200);
      return;
    }
    const el = lines[idx];
    idx++;
    typeLine(el, el.dataset.text || '', next);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(next, 500);
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(container);
}
