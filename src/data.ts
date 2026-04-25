// ===== Registry data loader =====
import type { Registry } from './types';

let cachedRegistry: Registry | null = null;

export async function loadRegistry(): Promise<Registry> {
  if (cachedRegistry) return cachedRegistry;

  try {
    const res = await fetch('/registry.json');
    cachedRegistry = await res.json();
    return cachedRegistry!;
  } catch {
    return {
      meta: { name: 'Enolalab', description: '', version: '1.0.0', maintainer: '' },
      categories: [],
      projects: [],
    };
  }
}
