import { describe, expect, it } from 'vitest';
import { getProductById, parseRegistry } from '../src/data';

const product = {
  id: 'dotagen',
  name: 'dotagen',
  summary: 'One source of truth.',
  status: 'active',
  category: 'developer-tools',
  techStack: ['Go'],
  docsUrl: 'https://dotagen.enolalab.com',
  repoUrl: 'https://github.com/enolalab/dotagen',
  releaseUrl: 'https://github.com/enolalab/dotagen/releases',
  thumbnail: null,
  featured: true,
};

const products = [
  product,
  {
    ...product,
    id: 'sunset',
    name: 'sunset',
    docsUrl: 'https://sunset.enolalab.com',
    repoUrl: 'https://github.com/enolalab/sunset',
    releaseUrl: 'https://github.com/enolalab/sunset/releases',
    techStack: ['Go', 'Tree-sitter'],
    featured: true,
  },
  {
    ...product,
    id: 'grid-screen',
    name: 'grid-screen',
    docsUrl: 'https://grid-screen.enolalab.com',
    repoUrl: 'https://github.com/enolalab/grid-screen',
    releaseUrl: 'https://github.com/enolalab/grid-screen/releases',
    techStack: ['Rust', 'Tauri', 'Svelte'],
    featured: true,
  },
  {
    ...product,
    id: 'linear-cli',
    name: 'linear-cli',
    docsUrl: 'https://linear-cli.enolalab.com',
    repoUrl: 'https://github.com/enolalab/linear-cli',
    releaseUrl: 'https://github.com/enolalab/linear-cli/releases',
    featured: false,
  },
  {
    ...product,
    id: 'sunbeam',
    name: 'sunbeam',
    docsUrl: 'https://sunbeam.enolalab.com',
    repoUrl: 'https://github.com/enolalab/sunbeam',
    releaseUrl: null,
    techStack: ['Java', 'Spring Boot', 'OpenCV'],
    featured: false,
  },
];

const officialProductIds = ['dotagen', 'sunset', 'grid-screen', 'linear-cli', 'sunbeam'];

const registryInput = (products: unknown[]) => ({
  meta: { name: 'Enolalab', description: 'Products' },
  products,
});

describe('parseRegistry', () => {
  it('accepts a complete product registry and supports lookup', () => {
    const registry = parseRegistry(registryInput(products));
    expect(registry.products.map(({ id }) => id)).toEqual(officialProductIds);
    expect(getProductById(registry, 'dotagen')).toMatchObject({
      id: 'dotagen',
      docsUrl: product.docsUrl,
    });
  });

  it('rejects a product without an HTTPS docs URL', () => {
    expect(() => parseRegistry(registryInput([
      { ...product, docsUrl: 'http://dotagen.enolalab.com' },
    ]))).toThrow('docsUrl');
  });

  it('rejects unsupported status and category values', () => {
    expect(() => parseRegistry(registryInput([
      { ...product, status: 'beta' },
    ]))).toThrow('status');
    expect(() => parseRegistry(registryInput([
      { ...product, category: 'games' },
    ]))).toThrow('category');
  });

  it('rejects a registry with a missing official product ID', () => {
    expect(() => parseRegistry(registryInput(products.slice(0, -1)))).toThrow(
      /Registry product IDs.*missing.*sunbeam/i,
    );
  });

  it('rejects a registry with an extra product ID', () => {
    expect(() => parseRegistry(registryInput([
      ...products,
      { ...product, id: 'unofficial-product', name: 'unofficial-product' },
    ]))).toThrow(/Registry product IDs.*unofficial-product/i);
  });

  it('rejects duplicate official product IDs', () => {
    expect(() => parseRegistry(registryInput([...products, product]))).toThrow(
      /Registry product IDs.*Duplicate product id: dotagen/i,
    );
  });

  it.each([
    'http://dotagen.enolalab.com/releases',
    'javascript:alert(1)',
  ])('rejects a non-HTTPS release URL: %s', (releaseUrl) => {
    expect(() => parseRegistry(registryInput([
      { ...products[0], releaseUrl },
      ...products.slice(1),
    ]))).toThrow(/releaseUrl.*HTTPS URL/i);
  });

  it.each(['id', 'name', 'summary'])('rejects whitespace-only %s', (field) => {
    expect(() => parseRegistry(registryInput([
      { ...products[0], [field]: ' \t\n' },
      ...products.slice(1),
    ]))).toThrow(new RegExp(`Product 0 ${field}.*non-empty`, 'i'));
  });

  it.each(['', ' \t\n'])('rejects an empty techStack entry: %j', (entry) => {
    expect(() => parseRegistry(registryInput([
      { ...products[0], techStack: ['Go', entry] },
      ...products.slice(1),
    ]))).toThrow(/Product 0 techStack.*non-empty/i);
  });
});
