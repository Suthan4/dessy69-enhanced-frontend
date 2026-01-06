"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { Order } from "@/lib/types/order";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  console.log("order", order);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const order = await ordersApi().getById(params.id as string);
      setOrder(order?.data);
    } catch (error) {
      toast.error("Failed to load order");
      router.push("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      await ordersApi().cancel(order.id);
      toast.success("Order cancelled successfully");
      loadOrder();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading order details..." />;
  }

  if (!order) {
    return null;
  }

  const canCancel = ["pending", "confirmed"].includes(order?.status);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Order Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Order #{order?.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Order Status
            </h2>
            <OrderStatusTimeline order={order} />
          </div>
        </Card>

        {/* Delivery Details */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Delivery Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Delivery Address
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone Number
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {order.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-800 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.variantName}
                      </p>
                    )}
                    {item.variantName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bill Summary */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Bill Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>
                    Discount {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Charge</span>
                <span>
                  {order.deliveryCharge === 0
                    ? "FREE"
                    : formatCurrency(order.deliveryCharge)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Cancel Order Button */}
        {canCancel && (
          <Button
            onClick={handleCancelOrder}
            variant="danger"
            className="w-full"
          >
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}

function OrderStatusTimeline({ order }: { order: Order }) {
  const statusSteps = [
    { status: "pending", label: "Order Placed", icon: Package },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { status: "preparing", label: "Preparing", icon: Clock },
    { status: "ready", label: "Ready", icon: CheckCircle2 },
    { status: "out_for_delivery", label: "Plated & Ready", icon: Package },
    { status: "delivered", label: "Served", icon: CheckCircle2 },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === order.status
  );
  const isCancelled = order.status === "cancelled";

  if (isCancelled) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Order Cancelled
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This order has been cancelled
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusSteps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const historyItem = order.statusHistory.find(
          (h) => h.status === step.status
        );

        return (
          <div key={step.status} className="flex gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted
                    ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-12 transition-all",
                    isCompleted
                      ? "bg-primary-500"
                      : "bg-gray-200 dark:bg-gray-800"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <p
                className={cn(
                  "font-semibold transition-colors",
                  isCompleted
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-600"
                )}
              >
                {step.label}
              </p>
              {historyItem && (
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(historyItem.timestamp)}
                  </p>
                  {historyItem.note && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {historyItem.note}
                    </p>
                  )}
                </div>
              )}
              {isCurrent && !historyItem && (
                <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                  In progress...
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
