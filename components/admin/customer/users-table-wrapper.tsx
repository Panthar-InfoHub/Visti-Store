import { getUsers } from "@/actions/admin/user.actions";
import { UsersTable } from "./users-table";
import { UsersTableFilters } from "./users-table-filters";

interface UsersTableWrapperProps {
  filters: {
    role?: string;
    search?: string;
    page?: string;
  };
}

export async function UsersTableWrapper({ filters }: UsersTableWrapperProps) {
  const page = parseInt(filters.page || "1");
  const pageSize = 10;

  const result = await getUsers({
    role: filters.role && filters.role !== "all" ? (filters.role as any) : undefined,
    search: filters.search,
    page,
    pageSize,
  });

  if (!result.success) {
    return <div className="text-center py-8 text-destructive">Failed to load users</div>;
  }

  const users = result.data || [];
  const pagination = result.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 };

  return (
    <div className="space-y-4">
      <UsersTableFilters totalUsers={pagination.totalCount} />
      <UsersTable
        users={users}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
