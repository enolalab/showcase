import { describe, expect, it } from 'vitest';
import { getProductById, parseRegistry } from '../src/data';

const product = {
  id: 'dotagen', name: 'dotagen', summary: 'One source of truth.',
  status: 'active', category: 'developer-tools', techStack: ['Go'],
  docsUrl: 'https://dotagen.enolalab.com',
  repoUrl: 'https://github.com/enolalab/dotagen',
  releaseUrl: 'https://github.com/enolalab/dotagen/releases',
  thumbnail: null, featured: true,
};

describe('parseRegistry', () => {
  it('accepts a complete product registry and supports lookup', () => {
    const registry = parseRegistry({ meta: { name: 'Enolalab', description: 'Products' }, products: [product] });
    expect(getProductById(registry, 'dotagen')).toMatchObject({ id: 'dotagen', docsUrl: product.docsUrl });
  });

  it('rejects a product without an HTTPS docs URL', () => {
    expect(() => parseRegistry({ meta: { name: 'Enolalab', description: 'Products' }, products: [{ ...product, docsUrl: 'http://dotagen.enolalab.com' }] })).toThrow('docsUrl');
  });

  it('rejects an unsupported status and duplicate id', () => {
    expect(() => parseRegistry({ meta: { name: 'Enolalab', description: 'Products' }, products: [{ ...product, status: 'beta' }] })).toThrow('status');
    expect(() => parseRegistry({ meta: { name: 'Enolalab', description: 'Products' }, products: [product, product] })).toThrow('Duplicate product id');
  });
});
