import { Suspense } from "react";
import { CategoriesTable } from "@/components/admin/category/categories-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminCategoriesPage() {
  // Protect page - only admins can access
  // await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage product categories</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </Button>
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
        <CategoriesTable />
      </Suspense>
    </div>
  );
}
