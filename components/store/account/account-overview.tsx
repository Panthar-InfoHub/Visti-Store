"use client";

import { Package, MapPin, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { useWishlist } from "@/hooks/use-wishlist";
import { useEffect, useState } from "react";
import { getUserOrderStats } from "@/actions/store/order.actions";
import { formatPrice, formatDate } from "@/utils/format";
import { OrderStatus } from "@/prisma/generated/prisma";

// Custom color classes for order status badges
const getStatusColorClass = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400";
    case "PROCESSING":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400";
    case "SHIPPED":
      return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
    case "DELIVERED":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

export function AccountOverview() {
  const { data: session, isPending } = useSession();
  const { items: wishlistItems } = useWishlist();
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch order stats and recent orders
        const orderStatsRes = await getUserOrderStats();
        if (orderStatsRes.success && orderStatsRes.data) {
          setOrderCount(orderStatsRes.data.totalOrders);
          setRecentOrders(orderStatsRes.data.recentOrders);
        }

        // Fetch address count
        const addressRes = await fetch("/api/account/addresses-count");
        if (addressRes.ok) {
          const data = await addressRes.json();
          setAddressCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const stats = [
    { label: "Total Orders", value: orderCount.toString(), icon: Package, href: "/account/orders" },
    {
      label: "Saved Addresses",
      value: addressCount.toString(),
      icon: MapPin,
      href: "/account/addresses",
    },
    {
      label: "Wishlist Items",
      value: wishlistItems.length.toString(),
      icon: Heart,
      href: "/account/wishlist",
    },
  ];

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}!
        </h2>
        <p className="text-foreground-muted">Manage your orders, addresses, and wishlist</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-foreground-muted">{stat.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/orders">View All</Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No orders yet</p>
            <Link href="/products">
              <Button size="sm" className="mt-3">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-surface rounded-lg"
              >
                <div>
                  <p className="font-medium">Order #{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                  <Badge
                    className={`text-xs mt-1 ${getStatusColorClass(order.status as OrderStatus)}`}
                  >
                    {statusLabels[order.status as OrderStatus]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
