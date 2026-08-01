export type ProductStatus = 'active' | 'in-development' | 'maintained';
export type ProductCategory = 'developer-tools' | 'desktop' | 'automation' | 'computer-vision';

export interface Product {
  id: string;
  name: string;
  summary: string;
  status: ProductStatus;
  category: ProductCategory;
  techStack: string[];
  docsUrl: string;
  repoUrl: string;
  releaseUrl: string | null;
  thumbnail: string | null;
  featured: boolean;
}

export interface Author {
  name: string;
  github: string;
  avatar: string;
}

export type CategoryId = 'web' | 'game' | 'tool' | 'ai' | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
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

export interface Registry {
  meta: { name: string; description: string };
  products: Product[];
  categories: Category[];
  projects: Project[];
}
