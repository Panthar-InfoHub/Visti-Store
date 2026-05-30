import { ModernAccountOverview } from "@/components/store/account/modern-account-overview";
import { Suspense } from "react";
import { AccountSkeleton } from "@/components/store/account/account-skeleton";

// Account pages need fresh data on every request
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <ModernAccountOverview />
    </Suspense>
  );
}
