import { describe, expect, it, vi } from 'vitest';
import { getCurrentRoute } from '../src/router';
import { redirectToProductDocs } from '../src/pages/viewer';

const registry = {
  meta: { name: 'Enolalab', description: 'Products' },
  products: [{
    id: 'sunset',
    name: 'sunset',
    summary: 'Indexer',
    status: 'active' as const,
    category: 'developer-tools' as const,
    techStack: ['Go'],
    docsUrl: 'https://sunset.enolalab.com',
    repoUrl: 'https://github.com/enolalab/sunset',
    releaseUrl: null,
    thumbnail: null,
    featured: false,
  }],
};

describe('legacy product routes', () => {
  it('parses a product route', () => {
    expect(getCurrentRoute('/projects/sunset')).toEqual({
      route: 'project',
      param: 'sunset',
    });
  });

  it('redirects a known product to its docs URL', () => {
    const assign = vi.fn();
    const replace = vi.fn();
    redirectToProductDocs(registry, 'sunset', { assign, replace });
    expect(assign).toHaveBeenCalledWith('https://sunset.enolalab.com');
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects an unknown legacy product to the catalogue home', () => {
    const assign = vi.fn();
    const replace = vi.fn();
    redirectToProductDocs(registry, 'legacy-product', { assign, replace });
    expect(assign).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
  });
});
