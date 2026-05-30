import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { notFound } from "next/navigation";
import { ModernProductCard } from "@/components/store/products/modern-product-card";
import { ProductSort } from "@/components/store/products/product-sort";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/store/products/product-list-skeleton";
import Image from "next/image";

export const experimental_ppr = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!category) return {};

  return generatePageMetadata({
    path: `/categories/${slug}`,
    title: category.name,
    description: category.description || `Browse ${category.name}`,
  });
}

export const revalidate = 3600;

interface SearchParams {
  sort?: string;
}

// Separate component for category content to enable streaming
async function CategoryContent({ slug, sort }: { slug: string; sort: string }) {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  let products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isOnSale: true,
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

  if (sort === "price-asc") {
    products.sort((a, b) => (a.variants[0]?.sellingPrice || 0) - (b.variants[0]?.sellingPrice || 0));
  } else if (sort === "price-desc") {
    products.sort((a, b) => (b.variants[0]?.sellingPrice || 0) - (a.variants[0]?.sellingPrice || 0));
  } else if (sort === "name") {
    products.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === "popular") {
    products.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
  }

  return (
    <>
      {/* Minimal Breadcrumb Header */}
      <div className="container mx-auto px-4 py-6 border-b border-gray-100">
        <nav className="text-sm text-gray-500 font-medium mb-3">
          <a href="/" className="hover:text-gray-900 transition-colors">
            Home
          </a>
          <span className="mx-2 text-gray-300">/</span>
          <a href="/categories" className="hover:text-gray-900 transition-colors">
            Categories
          </a>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Subcategories Section - Only show if there are child categories */}
        {category.children.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subcategories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {category.children.map((child) => (
                <a key={child.id} href={`/categories/${child.slug}`} className="group block">
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <div className="relative aspect-square bg-gray-50">
                      {child.image ? (
                        <Image
                          src={child.image}
                          alt={child.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {child.name}
                      </h3>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {category.children.length > 0 ? `All Products in ${category.name}` : "Products"}
              </h2>
              <ProductSort />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {products.map((product) => (
                <ModernProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* No Products Message */}
        {products.length === 0 && category.children.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any products in this category at the moment.
            </p>
            <a
              href="/products"
              className="inline-flex items-center justify-center px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse All Products
            </a>
          </div>
        )}
      </div>
    </>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { sort = "newest" } = await searchParams;

  return (
    <div className="min-h-screen bg-white">
      <Suspense
        fallback={
          <>
            {/* Header Skeleton */}
            <div className="container mx-auto px-4 py-6 border-b border-gray-100">
              <Skeleton className="h-4 w-48 mb-3" />
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto px-4 py-8">
              {/* Subcategories Skeleton */}
              <div className="mb-10">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Products Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </>
        }
      >
        <CategoryContent slug={slug} sort={sort} />
      </Suspense>
    </div>
  );
}
