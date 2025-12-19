import {
  Coupon,
  ValidateCouponData,
  CouponValidationResult,
} from "../types/coupon";
import { ApiResponse, PaginatedResponse } from "../types/common";
import { normalizePaginatedResponse } from "../utils/normalizePaginatedResponse";
import { clientApi } from "./client-api";

export const couponsApi = () => ({
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Coupon>> => {
    const response = await clientApi.get<any, ApiResponse<PaginatedResponse<Coupon>>>(
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
    const response = await clientApi.post<any, ApiResponse<CouponValidationResult>>(
      "/coupons/validate",
      data
    );
    return response.data!;
  },

  create: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await clientApi.post<any, ApiResponse<Coupon>>("/coupons", data);
    return response.data!;
  },

  update: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await clientApi.put<any, ApiResponse<Coupon>>(
      `/coupons/${id}`,
      data
    );
    return response.data!;
  },

  delete: async (id: string): Promise<void> => {
    await clientApi.delete(`/coupons/${id}`);
  },
});
