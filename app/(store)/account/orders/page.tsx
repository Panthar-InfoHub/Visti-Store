import { ModernOrdersList } from "@/components/store/account/modern-orders-list";
import { Suspense } from "react";
import { OrdersSkeleton } from "@/components/store/account/orders-skeleton";

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <ModernOrdersList />
    </Suspense>
  );
}
