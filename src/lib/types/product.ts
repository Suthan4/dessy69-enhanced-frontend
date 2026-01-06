export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Ingredient {
  _id: string;
  name: string;
  quantity?: string;
  isOptional: boolean;
  additionalPrice?: number;
  allergens?: string[];
}

export interface ProductMetadata {
  shelfLife?: string;
  storageInstructions?: string;
  countryOfOrigin?: string;
}
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
  variants: ProductVariant[];
  images: string[];
  ingredients: Ingredient[];
  nutrition?: NutritionInfo;
  metadata?: ProductMetadata;
  isAvailable: boolean;
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
  ingredients?: Ingredient[];
  nutrition?: NutritionInfo;
  metadata?: ProductMetadata;
}
