"use client";

import { useRouter } from "next/navigation";
import { Package, MapPin, Heart, Loader2, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { useWishlist } from "@/hooks/use-wishlist";
import { useEffect, useState } from "react";
import { getUserOrderStats } from "@/actions/store/order.actions";
import { formatPrice, formatDate } from "@/utils/format";
import { OrderStatus } from "@/prisma/generated/prisma";

const getStatusConfig = (status: OrderStatus) => {
  const configs = {
    PENDING: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pending" },
    PROCESSING: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Processing" },
    SHIPPED: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Shipped" },
    DELIVERED: { color: "bg-green-50 text-green-700 border-green-200", label: "Delivered" },
    CANCELLED: { color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
    FAILED: { color: "bg-red-50 text-red-700 border-red-200", label: "Failed" },
  };
  return configs[status] || configs.PENDING;
};

export function ModernAccountOverview() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { items: wishlistItems } = useWishlist();
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const orderStatsRes = await getUserOrderStats();
        if (orderStatsRes.success && orderStatsRes.data) {
          setOrderCount(orderStatsRes.data.totalOrders);
          setRecentOrders(orderStatsRes.data.recentOrders);
        }

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

    fetchStats();
  }, [session, isPending]);

  if (isPending || isLoading || !session?.user) {
    if (!isPending && !isLoading && !session?.user) {
      router.push("/login");
    }
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-[#111111] break-words">
              Welcome Back, {userName}!
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm lg:text-base">
              Manage your order, address and wishlist all in are place
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <Link
          href="/account/orders"
          className="group bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3 sm:p-4 bg-[#FAF5F0] rounded-2xl group-hover:bg-[#F2EAE1] transition-colors shrink-0">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-[#BFA083]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-[#111111]">{orderCount}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Total Order</p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="group bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3 sm:p-4 bg-[#FAF5F0] rounded-2xl group-hover:bg-[#F2EAE1] transition-colors shrink-0">
              <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-[#BFA083]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-[#111111]">{addressCount}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Saved Addresses</p>
            </div>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="group bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3 sm:p-4 bg-[#FAF5F0] rounded-2xl group-hover:bg-[#F2EAE1] transition-colors shrink-0">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-[#BFA083]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-[#111111]">{wishlistItems.length}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Wishlist items</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] min-h-[300px]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-[#111111]">Recent Orders</h3>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[#BFA083] hover:text-[#BFA083] hover:bg-[#FAF5F0] text-sm sm:text-base font-semibold"
          >
            <Link href="/account/orders">View All →</Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FAF5F0] mb-4">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-[#BFA083]" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-[#111111] mb-4">No orders yet</p>
            <Button asChild size="default" className="rounded-full bg-[#284239] hover:bg-[#1a2b25] text-white px-8 h-12">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status as OrderStatus);
              return (
                <Link
                  key={order.id}
                  href="/account/orders"
                  className="flex items-center justify-between p-4 sm:p-5 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                      <Package className="h-5 w-5 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-base text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <Badge className={`${statusConfig.color} border text-xs mt-1.5 font-medium`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
