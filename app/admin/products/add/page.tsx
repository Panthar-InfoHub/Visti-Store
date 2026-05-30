import { ProductForm } from "@/components/admin/products/product-form";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AddProductPage() {
  // Protect page - only admins can access
  await requireAdmin();

  return <ProductForm mode="create" />;
}
