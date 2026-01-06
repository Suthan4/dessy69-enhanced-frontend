import { Category, CategoryTree } from "../types/category";
import { ApiResponse } from "../types/common";
import { clientApi } from "./client-api";

export const categoriesApi = () =>({
  getAll: async () => {
    const response = await clientApi.get("/categories/tree");
    return response.data!;
  },

  getTree: async (): Promise<CategoryTree[]> => {
    const response = await clientApi.get<any, ApiResponse<CategoryTree[]>>(
      "/categories/tree"
    );
    return response.data!;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await clientApi.get<any, ApiResponse<Category>>(
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
    const response = await clientApi.post<any, ApiResponse<Category>>(
      "/categories",
      data
    );
    return response.data!;
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; isActive?: boolean }
  ): Promise<Category> => {
    const response = await clientApi.put<any, ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    return response.data!;
  },

  delete: async (id: string) => {
    await clientApi.delete(`/categories/${id}`);
  },
});
