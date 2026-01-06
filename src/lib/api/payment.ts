import { ApiResponse } from "../types/common";
import { Order } from "../types/order";
import { clientApi } from "./client-api";

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

export const paymentApi = () => ({
  createOrder: async (orderId: string) => {
    const response = await clientApi.post("/payment/create-order", { orderId });
    return response.data!;
  },

  verifyPayment: async (data: VerifyPaymentData) => {
    const response = await clientApi.post(
      "/payment/verify",
      data
    );
    return response.data!;
  },
});
