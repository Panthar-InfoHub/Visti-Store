import { Suspense } from "react";
import { UsersTableWrapper } from "@/components/admin/customer/users-table-wrapper";
import { UserStats, UserStatsSkeleton } from "@/components/admin/customer/user-stats";
import { AdminTableSkeleton } from "@/components/ui/loading-skeleton";

interface AdminUsersPageProps {
  searchParams: Promise<{
    role?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage customer accounts and roles</p>
      </div>

      <Suspense fallback={<UserStatsSkeleton />}>
        <UserStats />
      </Suspense>

      <Suspense fallback={<AdminTableSkeleton rows={10} />}>
        <UsersTableWrapper filters={params} />
      </Suspense>
    </div>
  );
}
