import { createApi } from "./axios";
import { Product, CreateProductData } from "../types/product";
import { ApiResponse, PaginatedResponse } from "../types/common";
import { normalizePaginatedResponse } from "../utils/normalizePaginatedResponse";
import { clientApi } from "./client-api";

export const productsApi = () => ({
  getAll: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    isAvailable?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await clientApi.get<
      any,
      ApiResponse<PaginatedResponse<Product>>
    >("/products", { params });
    return normalizePaginatedResponse<Product>(response.data!);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await clientApi.get<any, ApiResponse<Product>>(
      `/products/${id}`
    );
    return response.data!;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await clientApi.get<any, ApiResponse<Product>>(
      `/products/slug/${slug}`
    );
    return response.data!;
  },

  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await clientApi.get<
      any,
      ApiResponse<PaginatedResponse<Product>>
    >("/products/search", {
      params: { q: query, page, limit },
    });
    return response.data!;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await clientApi.post<any, ApiResponse<Product>>(
      "/products",
      data
    );
    return response.data!;
  },

  update: async (
    id: string,
    data: Partial<CreateProductData>
  ): Promise<Product> => {
    const response = await clientApi.put<any, ApiResponse<Product>>(
      `/products/${id}`,
      data
    );
    return response.data!;
  },

  updateAvailability: async (
    id: string,
    isAvailable: boolean
  ): Promise<Product> => {
    const response = await clientApi.patch<any, ApiResponse<Product>>(
      `/products/${id}/availability`,
      { isAvailable }
    );
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await clientApi.delete(`/products/${id}`);
  },
});
