import { OrderStatus, PaymentStatus } from "./common";

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  deliveryAddress: string;
  phone: string;
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  deliveryAddress: string;
  phone: string;
  couponCode?: string;
  notes?: string;
}
