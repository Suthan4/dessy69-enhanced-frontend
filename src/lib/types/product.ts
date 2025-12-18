export interface ProductVariant {
  id: string;
  name: string;
  size: string;
  basePrice: number;
  sellingPrice: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;
  sellingPrice: number;
  isAvailable: boolean;
  variants: ProductVariant[];
  images: string[];
  ingredients: string[];
  nutritionInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;
  sellingPrice: number;
  variants: Omit<ProductVariant, "id">[];
  images?: string[];
  ingredients?: string[];
}
