import type { Product, ProductCategory, ProductStatus, Registry } from './types';

const productStatuses: readonly ProductStatus[] = ['active', 'in-development', 'maintained'];
const productCategories: readonly ProductCategory[] = ['developer-tools', 'desktop', 'automation', 'computer-vision'];

let cachedRegistry: Registry | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringField(value: Record<string, unknown>, field: string): string {
  if (typeof value[field] !== 'string') {
    throw new Error(`Invalid ${field}`);
  }

  return value[field];
}

function nullableStringField(value: Record<string, unknown>, field: string): string | null {
  const fieldValue = value[field];
  if (fieldValue !== null && typeof fieldValue !== 'string') {
    throw new Error(`Invalid ${field}`);
  }

  return fieldValue;
}

function httpsUrlField(value: Record<string, unknown>, field: string): string {
  const url = stringField(value, field);

  try {
    if (new URL(url).protocol !== 'https:') {
      throw new Error();
    }
  } catch {
    throw new Error(`Invalid ${field}`);
  }

  return url;
}

function parseProduct(value: unknown): Product {
  if (!isRecord(value)) {
    throw new Error('Invalid product');
  }

  const status = stringField(value, 'status');
  if (!productStatuses.includes(status as ProductStatus)) {
    throw new Error('Invalid status');
  }

  const category = stringField(value, 'category');
  if (!productCategories.includes(category as ProductCategory)) {
    throw new Error('Invalid category');
  }

  if (!Array.isArray(value.techStack) || !value.techStack.every(item => typeof item === 'string')) {
    throw new Error('Invalid techStack');
  }

  if (typeof value.featured !== 'boolean') {
    throw new Error('Invalid featured');
  }

  return {
    id: stringField(value, 'id'),
    name: stringField(value, 'name'),
    summary: stringField(value, 'summary'),
    status: status as ProductStatus,
    category: category as ProductCategory,
    techStack: value.techStack,
    docsUrl: httpsUrlField(value, 'docsUrl'),
    repoUrl: httpsUrlField(value, 'repoUrl'),
    releaseUrl: nullableStringField(value, 'releaseUrl'),
    thumbnail: nullableStringField(value, 'thumbnail'),
    featured: value.featured,
  };
}

export function parseRegistry(value: unknown): Registry {
  if (!isRecord(value)) {
    throw new Error('Invalid registry');
  }

  if (!isRecord(value.meta)) {
    throw new Error('Invalid meta');
  }

  if (!Array.isArray(value.products)) {
    throw new Error('Invalid products');
  }

  const products = value.products.map(parseProduct);
  const productIds = new Set<string>();

  for (const product of products) {
    if (productIds.has(product.id)) {
      throw new Error(`Duplicate product id: ${product.id}`);
    }
    productIds.add(product.id);
  }

  return {
    meta: {
      name: stringField(value.meta, 'name'),
      description: stringField(value.meta, 'description'),
    },
    products,
    categories: [],
    projects: [],
  };
}

export function getProductById(registry: Registry, id: string): Product | undefined {
  return registry.products.find(product => product.id === id);
}

export async function loadRegistry(): Promise<Registry> {
  if (cachedRegistry) return cachedRegistry;

  const res = await fetch('/registry.json');
  if (!res.ok) {
    throw new Error(`Unable to load registry: ${res.status}`);
  }

  cachedRegistry = parseRegistry(await res.json());
  return cachedRegistry;
}
