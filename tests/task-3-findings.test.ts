import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/index.css'), 'utf8');
const home = readFileSync(resolve(process.cwd(), 'src/pages/home.ts'), 'utf8');

describe('Task 3 review fixes', () => {
  it('defines light-theme status tokens and uses them for product badges', () => {
    expect(css).toMatch(/--status-active:#(?:[0-9a-fA-F]{6})/);
    expect(css).toMatch(/--status-in-development:#(?:[0-9a-fA-F]{6})/);
    expect(css).toMatch(/\[data-theme="light"\]\{[\s\S]*--status-active:#(?:[0-9a-fA-F]{6})[\s\S]*--status-in-development:#(?:[0-9a-fA-F]{6})/);
    expect(css).toContain('.product-status{color:var(--status-active)');
    expect(css).toContain('.product-status--in-development{color:var(--status-in-development)');
  });

  it('attaches one stable navbar scroll handler instead of one per render', () => {
    expect(home).toContain('const navbarScrollHandler = (): void =>');
    expect(home).toContain("window.addEventListener('scroll', navbarScrollHandler)");
    expect(home).not.toContain("window.addEventListener('scroll', () =>");
  });
});
