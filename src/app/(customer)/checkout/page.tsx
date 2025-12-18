"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { ordersApi } from "@/lib/api/orders";
import { paymentApi } from "@/lib/api/payment";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  deliveryAddress: z.string().min(10, "Address must be at least 10 characters"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, couponCode, getTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      deliveryAddress: user?.address || "",
    },
  });

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (orderId: string, orderData: any) => {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      toast.error("Failed to load payment gateway");
      return;
    }

    try {
      const paymentOrder = await paymentApi().createOrder(orderId);

      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Dessy69",
        description: "Ice Cream Order",
        order_id: paymentOrder.razorpayOrderId,
        handler: async (response: any) => {
          try {
            await paymentApi().verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart();
            toast.success("Payment successful!");
            router.push(`/orders/${orderId}`);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: orderData.name,
          contact: orderData.phone,
        },
        theme: {
          color: "#f97316",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        deliveryAddress: data.deliveryAddress,
        phone: data.phone,
        couponCode: couponCode ?? undefined,
        notes: data.notes,
      };

      const order = await ordersApi().create(orderData);
      await handlePayment(order.id, data);
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const total = getTotal();

  if (items.length === 0) {
    router.push("/menu");
    return null;
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Checkout
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Delivery Details */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Delivery Details
              </h2>
              <div className="space-y-4">
                <Input
                  {...register("name")}
                  label="Full Name"
                  placeholder="Enter your name"
                  icon={<User className="w-5 h-5" />}
                  error={errors.name?.message}
                />
                <Input
                  {...register("phone")}
                  label="Phone Number"
                  placeholder="10 digit mobile number"
                  icon={<Phone className="w-5 h-5" />}
                  error={errors.phone?.message}
                />
                <Input
                  {...register("deliveryAddress")}
                  label="Delivery Address"
                  placeholder="Enter complete address"
                  icon={<MapPin className="w-5 h-5" />}
                  error={errors.deliveryAddress?.message}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Any special instructions?"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.quantity}x {item.productName}
                      {item.variantName && ` (${item.variantName})`}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                  <span>Total Amount</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Place Order Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-4xl mx-auto">
              <Button
                type="submit"
                isLoading={isProcessing}
                className="w-full"
                size="lg"
              >
                Proceed to Payment
                <span className="ml-2 font-bold">{formatCurrency(total)}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
