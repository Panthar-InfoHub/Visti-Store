import { getOrders } from "@/actions/admin/order.actions";
import { OrdersTable } from "./orders-table";
import { OrdersTableFilters } from "./orders-table-filters";

interface OrdersTableWrapperProps {
  filters: {
    search?: string;
    status?: string;
    payment?: string;
    page?: string;
  };
}

export async function OrdersTableWrapper({ filters }: OrdersTableWrapperProps) {
  const page = parseInt(filters.page || "1");
  const pageSize = 10;

  // Parse filters and call getOrders with database pagination
  const result = await getOrders({
    status: filters.status && filters.status !== "all" ? (filters.status as any) : undefined,
    search: filters.search,
    page,
    pageSize,
  });

  if (!result.success) {
    return <div className="text-center py-8 text-destructive">Failed to load orders</div>;
  }

  const orders = result.data || [];
  const pagination = result.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 };

  // Apply payment status filter (client-side for now, or move to server)
  let filteredOrders = orders;
  if (filters.payment && filters.payment !== "all") {
    filteredOrders = orders.filter((order) => order.paymentStatus === filters.payment);
  }

  return (
    <div className="space-y-4">
      <OrdersTableFilters totalOrders={pagination.totalCount} />
      <OrdersTable
        orders={filteredOrders}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
