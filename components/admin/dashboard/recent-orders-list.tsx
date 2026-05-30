"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  FAILED: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
};

export function RecentOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent orders
    async function fetchOrders() {
      try {
        const response = await fetch("/api/admin/recent-orders");
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest customer orders</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{order.customerName}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || ""}
              >
                {order.status}
              </Badge>
              <div className="font-semibold text-sm min-w-[80px] text-right">
                {formatCurrency(order.total)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          No recent orders
        </div>
      )}
    </div>
  );
}
