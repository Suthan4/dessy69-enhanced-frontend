export enum CouponType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategories: string[];
  applicableProducts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponData {
  code: string;
  orderAmount: number;
  productIds: string[];
  categoryIds: string[];
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  reason?: string;
  coupon?: Coupon;
}
