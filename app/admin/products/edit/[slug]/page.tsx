import { ProductForm } from "@/components/admin/products/product-form";
import { getProductBySlug } from "@/actions/admin/product.actions";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Protect page - only admins can access
  await requireAdmin();

  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  return <ProductForm mode="edit" product={result.data} />;
}
