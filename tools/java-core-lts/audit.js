// Injected mobile-layout audit. Reports layout defects that screenshots hide.
window.__audit = function () {
  const vw = document.documentElement.clientWidth;
  const out = { width: vw, issues: [] };
  const add = (sev, kind, detail) => out.issues.push({ sev, kind, detail });

  // 1. Page-level horizontal scroll — the classic "vỡ giao diện" on mobile.
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) {
    add('HIGH', 'page-h-scroll', `scrollWidth=${de.scrollWidth} > clientWidth=${de.clientWidth}`);
  }

  // An ancestor that legitimately scrolls sideways (code block, chip row) makes
  // a child's overflow intentional, so only report escapes from non-scrollers.
  const inScroller = el => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflowX === 'auto' || s.overflowX === 'scroll') return true;
    }
    return false;
  };

  // 2. Elements sticking out past the right edge.
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right > vw + 1 && !inScroller(el)) {
      const id = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : el.tagName;
      add('HIGH', 'overflow-right', `${id} right=${Math.round(r.right)} vw=${vw}`);
    }
  });

  // 3. Tap targets. WCAG 2.5.8 wants >=24px; Apple/Google guidance is 44px.
  const seen = new Set();
  document.querySelectorAll('button, .choice, .menu-item, .tab, .chip, .retry, .reset, [onclick]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const key = el.className + '|' + Math.round(r.height);
    if (seen.has(key)) return;           // one report per visually identical class
    seen.add(key);
    if (r.height < 24 || r.width < 24) {
      add('HIGH', 'tap-target-tiny', `${el.className || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`);
    } else if (r.height < 44) {
      add('LOW', 'tap-target-small', `${el.className || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  });

  // 4. Body text too small to read on a phone.
  document.querySelectorAll('.prose p, .verdict p, .choice, .tut-sum').forEach(el => {
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs && fs < 12) {
      const key = 'fs|' + el.className + '|' + fs;
      if (seen.has(key)) return; seen.add(key);
      add('MEDIUM', 'font-too-small', `${el.className || el.tagName} ${fs}px`);
    }
  });

  // 5. Code blocks must scroll internally, never widen the page.
  document.querySelectorAll('.code pre').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1) add('HIGH', 'code-escapes', `pre right=${Math.round(r.right)}`);
  });

  // 6. Sticky header must not swallow content underneath it.
  const bar = document.querySelector('.bar');
  if (bar) {
    const bh = bar.getBoundingClientRect().height;
    if (bh > vw * 0.35) add('MEDIUM', 'sticky-bar-tall', `${Math.round(bh)}px on ${vw}px viewport`);
  }

  // 7. Content actually rendered (guards against a filter wiping the list).
  out.cards = document.querySelectorAll('.card').length;
  return out;
};
