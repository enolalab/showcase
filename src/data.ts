import type {
  Product,
  ProductCategory,
  ProductStatus,
  Registry,
} from './types';

const statuses = new Set<ProductStatus>([
  'active',
  'in-development',
  'maintained',
]);

const categories = new Set<ProductCategory>([
  'developer-tools',
  'desktop',
  'automation',
  'computer-vision',
]);

const officialProductIds = [
  'dotagen',
  'sunset',
  'grid-screen',
  'linear-cli',
  'sunbeam',
  'java-interview-drill',
] as const;
const officialProductIdSet = new Set<string>(officialProductIds);

let cachedRegistry: Registry | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isProductStatus(value: unknown): value is ProductStatus {
  return typeof value === 'string' && statuses.has(value as ProductStatus);
}

function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && categories.has(value as ProductCategory);
}

function requireString(product: Record<string, unknown>, field: string, index: number): string {
  const value = product[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Product ${index} ${field} must be a non-empty string`);
  }
  return value;
}

function parseProduct(value: unknown, index: number): Product {
  if (!isRecord(value)) {
    throw new Error(`Product ${index} must be an object`);
  }

  const id = requireString(value, 'id', index);
  const name = requireString(value, 'name', index);
  const summary = requireString(value, 'summary', index);
  const docsUrl = requireString(value, 'docsUrl', index);
  const repoUrl = requireString(value, 'repoUrl', index);

  if (!isProductStatus(value.status)) {
    throw new Error(`Product ${index} status is invalid`);
  }
  if (!isProductCategory(value.category)) {
    throw new Error(`Product ${index} category is invalid`);
  }
  if (!isStringArray(value.techStack)) {
    throw new Error(`Product ${index} techStack must be a non-empty string array`);
  }
  if (!isHttpsUrl(docsUrl)) {
    throw new Error(`Product ${index} docsUrl must be an HTTPS URL`);
  }
  if (!isHttpsUrl(repoUrl)) {
    throw new Error(`Product ${index} repoUrl must be an HTTPS URL`);
  }

  const releaseUrl = value.releaseUrl;
  if (releaseUrl !== null && typeof releaseUrl !== 'string') {
    throw new Error(`Product ${index} releaseUrl must be a string or null`);
  }
  if (typeof releaseUrl === 'string' && !isHttpsUrl(releaseUrl)) {
    throw new Error(`Product ${index} releaseUrl must be an HTTPS URL`);
  }

  const thumbnail = value.thumbnail;
  if (thumbnail !== null && typeof thumbnail !== 'string') {
    throw new Error(`Product ${index} thumbnail must be a string or null`);
  }

  if (typeof value.featured !== 'boolean') {
    throw new Error(`Product ${index} featured must be a boolean`);
  }

  return {
    id,
    name,
    summary,
    status: value.status,
    category: value.category,
    techStack: value.techStack,
    docsUrl,
    repoUrl,
    releaseUrl,
    thumbnail,
    featured: value.featured,
  };
}

export function parseRegistry(value: unknown): Registry {
  if (!isRecord(value)) {
    throw new Error('Registry must be an object');
  }
  if (!isRecord(value.meta)) {
    throw new Error('Registry meta must be an object');
  }
  if (typeof value.meta.name !== 'string') {
    throw new Error('Registry meta.name must be a string');
  }
  if (typeof value.meta.description !== 'string') {
    throw new Error('Registry meta.description must be a string');
  }
  if (!Array.isArray(value.products)) {
    throw new Error('Registry products must be an array');
  }

  const products = value.products.map((product, index) => parseProduct(product, index));
  const ids = new Set<string>();
  for (const product of products) {
    if (ids.has(product.id)) {
      throw new Error(`Registry product IDs: Duplicate product id: ${product.id}`);
    }
    ids.add(product.id);
  }

  const missingProductIds = officialProductIds.filter((id) => !ids.has(id));
  const unexpectedProductIds = [...ids].filter((id) => !officialProductIdSet.has(id));
  if (missingProductIds.length > 0 || unexpectedProductIds.length > 0) {
    const details = [
      missingProductIds.length > 0 ? `missing: ${missingProductIds.join(', ')}` : '',
      unexpectedProductIds.length > 0 ? `unexpected: ${unexpectedProductIds.join(', ')}` : '',
    ].filter((detail) => detail.length > 0).join('; ');
    throw new Error(
      `Registry product IDs must contain exactly ${officialProductIds.join(', ')}; ${details}`,
    );
  }

  return {
    meta: {
      name: value.meta.name,
      description: value.meta.description,
    },
    products,
  };
}

export async function loadRegistry(): Promise<Registry> {
  if (cachedRegistry !== null) return cachedRegistry;

  const response = await fetch('/registry.json');
  const input: unknown = await response.json();
  const registry = parseRegistry(input);
  cachedRegistry = registry;
  return registry;
}

export function getProductById(registry: Registry, id: string): Product | undefined {
  return registry.products.find((product) => product.id === id);
}
