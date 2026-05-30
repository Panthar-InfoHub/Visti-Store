import { CategoryForm } from "@/components/admin/category/category-form";
import { getCategoryBySlug } from "@/actions/admin/category.actions";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Protect page - only admins can access
  await requireAdmin();

  const { slug } = await params;
  const result = await getCategoryBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return <CategoryForm mode="edit" category={result.data} />;
}
