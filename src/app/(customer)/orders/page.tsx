"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { Order } from "@/lib/types/order";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersApi().getMyOrders(1, 20);
      setOrders(data.payload);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading orders..." />;
  }

  if (orders?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your order history will appear here
          </p>
          <Link
            href="/menu"
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-glow transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          My Orders
        </h1>

        <div className="space-y-4">
          {orders?.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const getStatusIcon = () => {
    switch (order.status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <Link href={`/orders/${order.id}`}>
      <Card hover>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Order #{order.id.slice(0, 8)}
              </span>
            </div>
            <Badge className={ORDER_STATUS_COLORS[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>

          {/* Items */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.items.length} item{order.items.length > 1 ? "s" : ""} •{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Amount
            </span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
