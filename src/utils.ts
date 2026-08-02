// ===== DOM utilities =====

/** Safely escape HTML */
export function esc(str: string): string {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
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
