export interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  description?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}
