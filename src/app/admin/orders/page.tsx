"use client";

import React, { useEffect, useState } from "react";
import { Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { Order } from "@/lib/types/order";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { OrderStatus } from "@/lib/types/common";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const data = await ordersApi().getAll({
        page: 1,
        limit: 50,
        status: filter === "all" ? undefined : filter,
      });
      setOrders(data.payload);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await ordersApi().updateStatus(orderId, newStatus);
      toast.success("Order status updated");
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading orders..." />;
  }

  const filterOptions: Array<{ value: OrderStatus | "all"; label: string }> = [
    { value: "all", label: "All Orders" },
    { value: OrderStatus.PENDING, label: "Pending" },
    { value: OrderStatus.CONFIRMED, label: "Confirmed" },
    { value: OrderStatus.PREPARING, label: "Preparing" },
    { value: OrderStatus.READY, label: "Ready" },
    { value: OrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery" },
    { value: OrderStatus.DELIVERED, label: "Delivered" },
    { value: OrderStatus.CANCELLED, label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Order Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and track all orders ({orders?.length})
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              filter === option.value
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No orders found</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <OrderManagementCard
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderManagementCard({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusActions: Array<{
    status: OrderStatus;
    label: string;
    icon: any;
    color: string;
  }> = [
    {
      status: OrderStatus.CONFIRMED,
      label: "Confirm",
      icon: CheckCircle2,
      color: "from-blue-500 to-blue-600",
    },
    {
      status: OrderStatus.PREPARING,
      label: "Preparing",
      icon: Clock,
      color: "from-purple-500 to-purple-600",
    },
    {
      status: OrderStatus.READY,
      label: "Ready",
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
    },
    {
      status: OrderStatus.OUT_FOR_DELIVERY,
      label: "Out for Delivery",
      icon: Truck,
      color: "from-orange-500 to-orange-600",
    },
    {
      status: OrderStatus.DELIVERED,
      label: "Delivered",
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
    },
    {
      status: OrderStatus.CANCELLED,
      label: "Cancel",
      icon: XCircle,
      color: "from-red-500 to-red-600",
    },
  ];

  const availableActions = statusActions.filter((action) => {
    if (order.status === "delivered" || order.status === "cancelled") {
      return false;
    }
    if (action.status === "cancelled") {
      return ["pending", "confirmed"].includes(order.status);
    }
    return true;
  });

  return (
    <Card>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Order #{order.id.slice(0, 8)}
              </h3>
              <Badge className={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(order.total)}
          </span>
        </div>

        {/* Customer Info */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="space-y-1 text-sm">
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {order.phone}
            </p>
            <p className="text-gray-600 dark:text-gray-400 line-clamp-1">
              {order.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {isExpanded ? "Hide" : "View"} {order.items.length} item
            {order.items.length > 1 ? "s" : ""}
          </button>
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div>
                    <p className="text-gray-900 dark:text-gray-100">
                      {item.quantity}x {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-gray-500 dark:text-gray-400">
                        {item.variantName}
                      </p>
                    )}
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Actions */}
        {availableActions.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Update Status:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.status}
                    onClick={() => onStatusUpdate(order.id, action.status)}
                    disabled={order.status === action.status}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      order.status === action.status
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : `bg-gradient-to-r ${action.color} text-white hover:shadow-lg active:scale-95`
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(order.status === "delivered" || order.status === "cancelled") && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <Badge
              variant={order.status === "delivered" ? "success" : "error"}
              className="w-full justify-center"
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
