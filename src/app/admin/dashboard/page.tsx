import React from "react";
import { ShoppingBag, Package, Users, TrendingUp } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { productsApi } from "@/lib/api/products";
import { StatsCard } from "@/components/admin/statsCard";
import { OrderTable } from "@/components/admin/orderTable";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/formatters";
import { cookies } from "next/headers";
import { createApi } from "@/lib/api/axios";

export default async function AdminDashboard() {
  const cookiesStore = await cookies();
  const api = createApi(cookiesStore);
  // Fetch dashboard data
  let ordersData;
  let productsData;
  try {
     [ordersData, productsData] = await Promise.all([
      ordersApi(api).getAll({ page: 1, limit: 10 }),
      productsApi(api).getAll({ page: 1, limit: 1 }),
    ]);
  } catch (error) {
    console.error("Error fetching menu data:", error);
    // fallback so RSC doesn’t crash
    productsData = { products: [], total: 0 };
    ordersData = { payload: [], total: 0 };
  }

  const orders = ordersData?.payload || [];
  const totalOrders = ordersData?.total || 0;
  const totalProducts = productsData?.total || 0;

  console.log("orders", orders);
  console.log("ordersData", ordersData);
  

  // Calculate stats
  // const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  // const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = 1223;
  const pendingOrders = 2;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          color="primary"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          title="Products"
          value={totalProducts}
          icon={Package}
          color="secondary"
        />
        <StatsCard
          title="Pending Orders"
          value={pendingOrders}
          icon={Users}
          color="warning"
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Orders
          </h2>
          <OrderTable orders={orders.slice(0, 5)} />
        </div>
      </Card>
    </div>
  );
}
