import { Suspense } from "react";
import { getCoupons } from "@/actions/admin/coupon.actions";
import { CouponsTable } from "@/components/admin/coupons/coupons-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

// Loading skeleton for the table
function CouponsTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-lg border">
          {/* Table Header */}
          <div className="flex gap-4 p-4 border-b bg-muted/50">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b items-center">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function CouponsTableWrapper() {
  const result = await getCoupons();
  const coupons = result.success ? result.data : [];

  return <CouponsTable coupons={coupons || []} />;
}

export default async function AdminCouponsPage() {
  // Protect page - only admins can access
  // await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground mt-1">
            Manage discount coupons and promotional codes
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <Suspense fallback={<CouponsTableSkeleton />}>
        <CouponsTableWrapper />
      </Suspense>
    </div>
  );
}
