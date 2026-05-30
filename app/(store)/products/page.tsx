import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { ModernProductCard } from "@/components/store/products/modern-product-card";
import { ProductFilters } from "@/components/store/products/product-filters";
import { ProductSort } from "@/components/store/products/product-sort";
import { MobileFilters } from "@/components/store/products/mobile-filters";
import { ProductPagination } from "@/components/store/products/product-pagination";
import { Suspense } from "react";
import { ProductCardSkeleton } from "@/components/store/products/product-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedProducts } from "@/components/store/home/featured-products";
import { siteConfig } from "@/site.config";

export const experimental_ppr = true;

export const metadata = generatePageMetadata({
  path: "/products",
  title: "All Products",
  description: "Browse our complete collection of electronics, robotics, and DIY components",
});

export const revalidate = 3600;

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  page?: string;
}

// Separate component for categories to enable partial prerendering
async function CategoriesFilter() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <>
      <aside className="hidden lg:block lg:w-64 shrink-0">
        <ProductFilters categories={categories} />
      </aside>
    </>
  );
}

// Mobile filters wrapper component
async function MobileFiltersWrapper() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return <MobileFilters categories={categories} />;
}

// Separate component for products grid to enable streaming
async function ProductsGrid({ params }: { params: SearchParams }) {
  const { category, search, sort = "newest", minPrice, maxPrice, inStock, page = "1" } = params;

  // Build where clause
  const whereClause: any = {
    isActive: true,
  };

  // Handle category filter - include nested categories
  if (category) {
    const categoryData = await prisma.category.findUnique({
      where: { slug: category },
      select: {
        id: true,
        children: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    if (categoryData) {
      // Include products from this category AND all its children
      const categoryIds = [categoryData.id, ...categoryData.children.map((child) => child.id)];

      whereClause.categoryId = {
        in: categoryIds,
      };
    }
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  // 1. Fetch lightweight data for filtering and sorting
  const allProductsForFilter = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
      createdAt: true,
      title: true,
      isBestSeller: true,
      variants: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: {
          sellingPrice: true,
          stock: true,
        },
      },
    },
  });

  const min = minPrice ? parseFloat(minPrice) : null;
  const max = maxPrice ? parseFloat(maxPrice) : null;
  let filteredProductsData = allProductsForFilter.filter((product) => {
    const primary = product.variants[0];
    if (!primary) return false;
    if (inStock === "true" && primary.stock <= 0) return false;
    if (min !== null && primary.sellingPrice < min) return false;
    if (max !== null && primary.sellingPrice > max) return false;
    return true;
  });

  if (sort === "price-asc") {
    filteredProductsData.sort((a, b) => (a.variants[0]?.sellingPrice || 0) - (b.variants[0]?.sellingPrice || 0));
  } else if (sort === "price-desc") {
    filteredProductsData.sort((a, b) => (b.variants[0]?.sellingPrice || 0) - (a.variants[0]?.sellingPrice || 0));
  } else if (sort === "name") {
    filteredProductsData.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "popular") {
    filteredProductsData.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
  } else {
    // Default: newest
    filteredProductsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const currentPage = parseInt(page);
  const pageSize = 9;
  const totalCount = filteredProductsData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const skip = (currentPage - 1) * pageSize;
  const paginatedIds = filteredProductsData.slice(skip, skip + pageSize).map((p) => p.id);

  // 2. Fetch full payload only for the paginated products
  const paginatedProductsRaw = await prisma.product.findMany({
    where: { id: { in: paginatedIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isOnSale: true,
      reviews: {
        select: {
          rating: true,
        },
      },
      variants: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          sku: true,
          images: true,
          mrp: true,
          sellingPrice: true,
          stock: true,
          isActive: true,
          sortOrder: true,
          createdAt: true,
        },
      },
    },
  });

  // Map back to preserve sorted order
  const productsMap = new Map(paginatedProductsRaw.map((p) => [p.id, p]));
  const sortedPaginatedProducts = paginatedIds.map((id) => productsMap.get(id)!).filter(Boolean);

  const paginatedProducts = sortedPaginatedProducts.map((product) => {
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
    return {
      ...product,
      avgRating,
    };
  });

  return (
    <>
      {/* Products Grid */}
      <div className="flex-1">
        {/* Sort and View Options */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {totalCount} {totalCount === 1 ? "Product" : "Products"}
          </h2>
          <ProductSort />
        </div>

        {/* Products */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {paginatedProducts.map((product) => (
                <ModernProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <ProductPagination currentPage={currentPage} totalPages={totalPages} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any products matching your filters. Try adjusting your search or
              filter criteria.
            </p>
            <a
              href="/products"
              className="inline-flex items-center justify-center px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear All Filters
            </a>
          </div>
        )}
      </div>
    </>
  );
}

// Main page component with instant header and streaming content
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header - Renders instantly */}
      <div className="container mx-auto px-4 py-6 border-b border-gray-100">
        <nav className="text-sm text-gray-500 font-medium mb-3">
          <a href="/" className="hover:text-gray-900 transition-colors">
            Home
          </a>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900">Products</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: siteConfig.colors.primary }}
            >
              All Products
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: siteConfig.colors.secondary }}
            >
              Browse our complete collection Luxary furniture
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button - Show only on mobile */}
          <div className="lg:hidden">
            <Suspense fallback={<Skeleton className="h-10 w-24" />}>
              <MobileFiltersWrapper />
            </Suspense>
          </div>

          {/* Desktop Filters Sidebar - Streams in */}
          <Suspense
            fallback={
              <aside className="hidden lg:block lg:w-64 shrink-0">
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-6 w-32 mb-3" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            }
          >
            <CategoriesFilter />
          </Suspense>

          {/* Products Grid - Streams in */}
          <Suspense
            key={JSON.stringify(params)}
            fallback={
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            }
          >
            <ProductsGrid params={params} />
          </Suspense>
        </div>
      </div>

      {/* Bestseller Grid Section */}
      <div className="mt-16 border-t border-gray-100 pt-8 lg:pt-12">
        <Suspense
          fallback={
            <section className="py-12 md:py-20 bg-gray-50">
              <div className="container mx-auto px-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-10 w-64 mb-12" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          }
        >
          <FeaturedProducts title="PRODUCTS ON SALE" filter="sale" />
        </Suspense>
      </div>
    </div>
  );
}
