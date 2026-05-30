"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TimeFilter,
  type TimeFilter as TimeFilterType,
} from "@/components/admin/dashboard/time-filter";

// Lazy load chart components (heavy with recharts)
const RevenueAreaChart = dynamic(
  () =>
    import("@/components/admin/dashboard/revenue-area-chart-new").then((mod) => ({
      default: mod.RevenueAreaChart,
    })),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);

const CategoryPerformance = dynamic(
  () =>
    import("@/components/admin/dashboard/category-performance").then((mod) => ({
      default: mod.CategoryPerformance,
    })),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);

const OrdersComparison = dynamic(
  () =>
    import("@/components/admin/dashboard/orders-comparison").then((mod) => ({
      default: mod.OrdersComparison,
    })),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);

const OrderStatusChart = dynamic(
  () =>
    import("@/components/admin/dashboard/order-status-chart").then((mod) => ({
      default: mod.OrderStatusChart,
    })),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);

const RecentOrdersList = dynamic(
  () =>
    import("@/components/admin/dashboard/recent-orders-list").then((mod) => ({
      default: mod.RecentOrdersList,
    })),
  { loading: () => <Skeleton className="h-[400px] w-full" /> }
);

import { useRouter } from "next/navigation";

interface DashboardClientProps {
  initialStats: any;
  initialRevenue: any[];
  initialCategories: any[];
  initialTopProducts: any[];
  initialFilter: any;
}

export function DashboardClient({
  initialStats,
  initialRevenue,
  initialCategories,
  initialTopProducts,
  initialFilter = "lifetime",
}: DashboardClientProps) {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>(initialFilter);
  const [isLoading, setIsLoading] = useState(false);

  // For now, use initial data - full implementation would refetch on filter change
  const stats = initialStats;
  const revenueData = initialRevenue;
  const categoryData = initialCategories;
  const topProducts = initialTopProducts;

  const handleFilterChange = (value: TimeFilterType) => {
    setTimeFilter(value);
    router.push(`/admin?filter=${value}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Your store performance at a glance</p>
        </div>
        <TimeFilter value={timeFilter} onValueChange={handleFilterChange} />
      </div>

      {/* Stats - Minimal Cards with Today's Data */}
      {stats && <DashboardStats stats={stats} timeFilter={timeFilter} />}

      {/* Main Revenue & Orders Area Chart - Rectangular & Colorful */}
      <RevenueAreaChart data={revenueData} />

      {/* Two Column Grid for Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Performance Radar */}
        <CategoryPerformance data={categoryData} />

        {/* Monthly Orders Bar Chart */}
        <OrdersComparison data={revenueData} />
      </div>
      {/* Order Status Distribution */}
      <OrderStatusChart />

      {/* Recent Orders Full Width */}
      <RecentOrdersList />
    </div>
  );
}
