export type ProductStatus = 'active' | 'in-development' | 'maintained';

export type ProductCategory =
  | 'developer-tools'
  | 'desktop'
  | 'automation'
  | 'computer-vision';

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

export interface Registry {
  meta: {
    name: string;
    description: string;
  };
  products: Product[];
}
