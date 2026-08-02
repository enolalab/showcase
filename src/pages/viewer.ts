import { getProductById } from '../data';
import type { Registry } from '../types';

export function redirectToProductDocs(
  registry: Registry,
  productId: string,
  location: Pick<Location, 'assign' | 'replace'> = window.location,
): void {
  const product = getProductById(registry, productId);
  if (product) {
    location.assign(product.docsUrl);
    return;
  }
  location.replace('/');
}
