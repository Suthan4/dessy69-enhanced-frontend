import { createApi } from "./axios";
import {
  Coupon,
  ValidateCouponData,
  CouponValidationResult,
} from "../types/coupon";
import { ApiResponse, PaginatedResponse } from "../types/common";
import { normalizePaginatedResponse } from "../utils/normalizePaginatedResponse";

export const couponsApi = (api = createApi()) => ({
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Coupon>> => {
    const response = await api.get<any, ApiResponse<PaginatedResponse<Coupon>>>(
      "/coupons",
      {
        params: { page, limit },
      }
    );
    return normalizePaginatedResponse<Coupon>(response.data!);
  },

  validate: async (
    data: ValidateCouponData
  ): Promise<CouponValidationResult> => {
    const response = await api.post<any, ApiResponse<CouponValidationResult>>(
      "/coupons/validate",
      data
    );
    return response.data!;
  },

  create: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post<any, ApiResponse<Coupon>>("/coupons", data);
    return response.data!;
  },

  update: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put<any, ApiResponse<Coupon>>(
      `/coupons/${id}`,
      data
    );
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  },
});
