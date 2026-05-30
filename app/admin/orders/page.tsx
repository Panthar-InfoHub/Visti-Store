import { Suspense } from "react";
import { OrdersTableWrapper } from "@/components/admin/orders/orders-table-wrapper";
import { requireAdmin } from "@/lib/admin-auth";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    payment?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  // Protect page - only admins can access
  // await requireAdmin();

  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">Manage customer orders and fulfillment</p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </CardContent>
          </Card>
        }
      >
        <OrdersTableWrapper filters={params} />
      </Suspense>
    </div>
  );
}
