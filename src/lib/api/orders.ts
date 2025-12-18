import { createApi } from "./axios";
import { Order, CreateOrderData } from "../types/order";
import { ApiResponse, PaginatedResponse, OrderStatus } from "../types/common";

export const ordersApi = (api = createApi())=>({
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post<any, ApiResponse<Order>>("/orders", data);
    return response.data!;
  },

  getMyOrders: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<any, ApiResponse<PaginatedResponse<Order>>>(
      "/orders/my-orders",
      {
        params: { page, limit },
      }
    );
    return response.data!;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<any, ApiResponse<PaginatedResponse<Order>>>(
      "/orders",
      { params }
    );
    return response.data!;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<any, ApiResponse<Order>>(`/orders/${id}`);
    return response.data!;
  },

  updateStatus: async (
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<Order> => {
    const response = await api.patch<any, ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status, note }
    );
    return response.data!;
  },

  cancel: async (id: string): Promise<Order> => {
    const response = await api.patch<any, ApiResponse<Order>>(
      `/orders/${id}/cancel`
    );
    return response.data!;
  },
});
