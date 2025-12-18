import { createApi } from "./axios";
import { Category, CategoryTree } from "../types/category";
import { ApiResponse } from "../types/common";

export const categoriesApi = (api = createApi()) =>({
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<any, ApiResponse<Category[]>>("/categories/tree");
    return response.data!;
  },

  getTree: async (): Promise<CategoryTree[]> => {
    const response = await api.get<any, ApiResponse<CategoryTree[]>>(
      "/categories/tree"
    );
    return response.data!;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get<any, ApiResponse<Category>>(
      `/categories/${id}`
    );
    return response.data!;
  },

  create: async (data: {
    name: string;
    slug: string;
    parentId?: string;
    description?: string;
  }): Promise<Category> => {
    const response = await api.post<any, ApiResponse<Category>>(
      "/categories",
      data
    );
    return response.data!;
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<Category> => {
    const response = await api.put<any, ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
});
