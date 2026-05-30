import { getProducts } from "@/actions/admin/product.actions";
import { getCategories } from "@/actions/admin/category.actions";
import { ProductsTableClient } from "./products-table-client";
import { ProductsTableFilters } from "./products-table-filters";

interface ProductsTableWrapperProps {
  filters: {
    search?: string;
    category?: string;
    status?: string;
    featured?: string;
    page?: string;
  };
}

export async function ProductsTableWrapper({ filters }: ProductsTableWrapperProps) {
  const page = parseInt(filters.page || "1");
  const pageSize = 10;

  // Parse filters for database query
  const isActive =
    filters.status === "in-stock" || filters.status === "out-of-stock" ? true : undefined;
  const isFeatured = filters.featured === "featured" ? true : undefined;
  const isBestSeller = filters.featured === "bestseller" ? true : undefined;

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({
      search: filters.search,
      categoryId: filters.category && filters.category !== "all" ? filters.category : undefined,
      isFeatured,
      isBestSeller,
      page,
      pageSize,
    }),
    getCategories(),
  ]);

  if (!productsResult.success) {
    return <div className="text-center py-8 text-destructive">Failed to load products</div>;
  }

  const products = productsResult.data || [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const pagination = productsResult.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  return (
    <div className="space-y-4">
      <ProductsTableFilters totalProducts={pagination.totalCount} categories={categories || []} />
      <ProductsTableClient
        products={products}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
