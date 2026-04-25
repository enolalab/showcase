// ===== Types for the showcase registry =====

export interface Author {
  name: string;
  github: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  author: Author;
  category: CategoryId;
  tags: string[];
  thumbnail: string | null;
  path: string;
  liveUrl: string | null;
  repoUrl: string | null;
  createdAt: string;
  featured: boolean;
}

export type CategoryId = 'web' | 'game' | 'tool' | 'ai' | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export interface RegistryMeta {
  name: string;
  description: string;
  version: string;
  maintainer: string;
}

export interface Registry {
  meta: RegistryMeta;
  categories: Category[];
  projects: Project[];
}

export type PageRoute = 'home' | 'guide';
