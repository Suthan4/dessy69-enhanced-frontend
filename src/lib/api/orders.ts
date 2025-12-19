import { Order, CreateOrderData } from "../types/order";
import { ApiResponse, PaginatedResponse, OrderStatus } from "../types/common";
import { normalizePaginatedResponse } from "../utils/normalizePaginatedResponse";
import { clientApi } from "./client-api";

export const ordersApi = ()=>({
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await clientApi.post<any, ApiResponse<Order>>("/orders", data);
    return response.data!;
  },

  getMyOrders: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Order>> => {
    const response = await clientApi.get<
      any,
      ApiResponse<PaginatedResponse<Order>>
    >("/orders/my-orders", {
      params: { page, limit },
    });
    return response.data!;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await clientApi.get<
      any,
      ApiResponse<PaginatedResponse<Order>>
    >("/orders", { params });
    return normalizePaginatedResponse<Order>(response.data!);
  },

  getById: async (id: string): Promise<Order> => {
    const response = await clientApi.get<any, ApiResponse<Order>>(
      `/orders/${id}`
    );
    return response.data!;
  },

  updateStatus: async (
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<Order> => {
    const response = await clientApi.patch<any, ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status, note }
    );
    return response.data!;
  },

  cancel: async (id: string): Promise<Order> => {
    const response = await clientApi.patch<any, ApiResponse<Order>>(
      `/orders/${id}/cancel`
    );
    return response.data!;
  },
});
