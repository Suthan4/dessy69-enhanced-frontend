import { createApi } from "./axios";
import { ApiResponse } from "../types/common";
import { Order } from "../types/order";

export interface PaymentOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const paymentApi = (api = createApi()) => ({
  createOrder: async (orderId: string): Promise<PaymentOrderResponse> => {
    const response = await api.post<any, ApiResponse<PaymentOrderResponse>>(
      "/payment/create-order",
      { orderId }
    );
    return response.data!;
  },

  verifyPayment: async (data: VerifyPaymentData): Promise<Order> => {
    const response = await api.post<any, ApiResponse<Order>>(
      "/payment/verify",
      data
    );
    return response.data!;
  },
});
