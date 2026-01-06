// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Package, Users, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/admin/statsCard";
import { OrderTable } from "@/components/admin/orderTable";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/formatters";
import { clientApi } from "@/lib/api/client-api";

interface DashboardData {
  orders: any[];
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    orders: [],
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("📡 Fetching dashboard data...");


        const [ordersResponse, productsResponse] = await Promise.all([
          clientApi.get("/orders", { params: { page: 1, limit: 10 } }),
          clientApi.get("/products", {
            params: { page: 1, limit: 10, isAvailable: true },
          }),
        ]);

        console.log("✅ Data fetched successfully");

        const orders = ordersResponse.data.data.orders || [];
        const totalOrders = ordersResponse.data.data.total || 0;
        const totalProducts = productsResponse.data.data.total || 0;

        // Calculate stats
        const totalRevenue = orders.reduce(
          (sum: number, order: any) => sum + (order.total || 0),
          0
        );
        const pendingOrders = orders.filter(
          (o: any) => o.status === "pending"
        ).length;

        setData({
          orders,
          totalOrders,
          totalProducts,
          totalRevenue,
          pendingOrders,
        });

        setLoading(false);
      } catch (error: any) {
        console.error("❌ Error fetching dashboard data:", error);

        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          console.log("❌ Unauthorized, redirecting to login");
          router.push("/login");
          return;
        }

        // Set fallback data
        setData({
          orders: [],
          totalOrders: 0,
          totalProducts: 0,
          totalRevenue: 0,
          pendingOrders: 0,
        });

        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

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
          value={data.totalOrders}
          icon={ShoppingBag}
          color="primary"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          title="Products"
          value={data.totalProducts}
          icon={Package}
          color="secondary"
        />
        <StatsCard
          title="Pending Orders"
          value={data.pendingOrders}
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
          {data.orders.length > 0 ? (
            <OrderTable orders={data.orders.slice(0, 5)} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No orders found
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
