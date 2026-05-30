import { Suspense } from "react";
import {
  getDashboardStats,
  getRevenueData,
  getCategoryDistribution,
  getTopProducts,
} from "@/actions/admin/dashboard.actions";
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import nextDynamic from "next/dynamic";
import { TimeFilter } from "@/components/admin/dashboard/time-filter";

// Lazy load heavy charts
const RevenueAreaChart = nextDynamic(
  () => import("@/components/admin/dashboard/revenue-area-chart-new").then(m => m.RevenueAreaChart),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);
const CategoryPerformance = nextDynamic(
  () => import("@/components/admin/dashboard/category-performance").then(m => m.CategoryPerformance),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);
const OrdersComparison = nextDynamic(
  () => import("@/components/admin/dashboard/orders-comparison").then(m => m.OrdersComparison),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);
const OrderStatusChart = nextDynamic(
  () => import("@/components/admin/dashboard/order-status-chart").then(m => m.OrderStatusChart),
  { loading: () => <Skeleton className="h-[350px] w-full" /> }
);
const RecentOrdersList = nextDynamic(
  () => import("@/components/admin/dashboard/recent-orders-list").then(m => m.RecentOrdersList),
  { loading: () => <Skeleton className="h-[400px] w-full" /> }
);

import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header-client";
import { DashboardProvider } from "@/components/admin/dashboard/dashboard-context";
import { DashboardTransitionWrapper } from "@/components/admin/dashboard/dashboard-transition-wrapper";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const timeFilter = (filter as any) || "lifetime";

  return (
    <DashboardProvider>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* Client Component Header for Filter Navigation */}
        <DashboardHeader initialFilter={timeFilter} />

        {/* Dynamic Parts wrapped in Suspense and Transition Wrapper */}
        <div className="space-y-6">
          <DashboardTransitionWrapper fallback={<StatsSkeleton />}>
            <Suspense fallback={<StatsSkeleton />}>
              <StatsWrapper filter={timeFilter} />
            </Suspense>
          </DashboardTransitionWrapper>

          <DashboardTransitionWrapper fallback={<ChartSkeleton height="350px" />}>
            <Suspense fallback={<ChartSkeleton height="350px" />}>
              <RevenueWrapper />
            </Suspense>
          </DashboardTransitionWrapper>

          <div className="grid lg:grid-cols-2 gap-6">
            <DashboardTransitionWrapper fallback={<ChartSkeleton height="350px" />}>
              <Suspense fallback={<ChartSkeleton height="350px" />}>
                <CategoryWrapper />
              </Suspense>
            </DashboardTransitionWrapper>

            <DashboardTransitionWrapper fallback={<ChartSkeleton height="350px" />}>
              <Suspense fallback={<ChartSkeleton height="350px" />}>
                <RevenueWrapper forComparison />
              </Suspense>
            </DashboardTransitionWrapper>
          </div>

          <DashboardTransitionWrapper fallback={<ChartSkeleton height="300px" />}>
            <Suspense fallback={<ChartSkeleton height="300px" />}>
              <OrderStatusChart />
            </Suspense>
          </DashboardTransitionWrapper>

          <DashboardTransitionWrapper fallback={<ChartSkeleton height="400px" />}>
            <Suspense fallback={<ChartSkeleton height="400px" />}>
              <RecentOrdersList />
            </Suspense>
          </DashboardTransitionWrapper>
        </div>
      </div>
    </DashboardProvider>
  );
}

// Wrapper Components to Fetch Data Independently
async function StatsWrapper({ filter }: { filter: string }) {
  const result = await getDashboardStats(filter as any);
  if (!result.success || !result.data) return null;
  return <DashboardStats stats={result.data} timeFilter={filter as any} />;
}

async function RevenueWrapper({ forComparison = false }: { forComparison?: boolean }) {
  const result = await getRevenueData();
  if (!result.success || !result.data) return null;
  return forComparison ? <OrdersComparison data={result.data} /> : <RevenueAreaChart data={result.data} />;
}

async function CategoryWrapper() {
  const result = await getCategoryDistribution();
  if (!result.success || !result.data) return null;
  return <CategoryPerformance data={result.data} />;
}

// Skeletons
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton({ height }: { height: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-48 mb-4 md:mb-6" />
        <Skeleton style={{ height }} className="w-full" />
      </CardContent>
    </Card>
  );
}
