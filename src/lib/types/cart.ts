export interface CartItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  variantSize?: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode?: string;
}
