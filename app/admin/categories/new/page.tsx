import { CategoryForm } from "@/components/admin/category/category-form";
import { requireAdmin } from "@/lib/admin-auth";

export default async function NewCategoryPage() {
  // Protect page - only admins can access
  await requireAdmin();

  return <CategoryForm mode="create" />;
}
