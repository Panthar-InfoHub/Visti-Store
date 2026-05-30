import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { getPrimaryVariant, getVariantDisplayDetails } from "@/lib/variant-helpers";
import { notFound } from "next/navigation";
import { ProductMainClient } from "@/components/store/products/product-main-client";
import { ProductTabs } from "@/components/store/products/product-tabs";
import { RelatedProducts } from "@/components/store/products/related-products";
import { ProductReviews } from "@/components/store/products/product-reviews";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedProducts } from "@/components/store/home/featured-products";

export const experimental_ppr = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, shortDescription: true, variants: true },
  });

  if (!product) return {};

  const primaryVariant = getPrimaryVariant(product.variants);
  const displayDetails = getVariantDisplayDetails(primaryVariant);

  return generatePageMetadata({
    path: `/products/${slug}`,
    title: product.title,
    description: product.shortDescription || product.title,
  });
}

export const revalidate = 3600;

// Separate component for product main content
async function ProductMainContent({ slug }: { slug: string }) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      variants: {
        orderBy: { sortOrder: 'asc' }
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Parse JSON fields
  const sections =
    typeof product.sections === "string" ? JSON.parse(product.sections) : product.sections;
  const faqs = typeof product.faqs === "string" ? JSON.parse(product.faqs) : product.faqs;

  // Calculate average rating
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <a href="/" className="hover:text-blue-600">
          Home
        </a>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <a href={`/categories/${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </a>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900">{product.title}</span>
      </nav>

      {/* Product Main Section */}
      <ProductMainClient
        product={{
          id: product.id,
          title: product.title,
          shortDescription: product.shortDescription,
          variants: product.variants,
          tags: product.tags,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          isNewArrival: product.isNewArrival,
          isOnSale: product.isOnSale,
          avgRating,
          reviewCount: product.reviews.length,
        }}
      />

      {/* Product Tabs */}
      <ProductTabs description={product.description} sections={sections} faqs={faqs} />

      {/* Reviews Section */}
      <Suspense
        fallback={
          <div className="mb-12">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ProductReviews
          productId={product.id}
          reviews={product.reviews.map((r) => ({
            ...r,
            comment: r.comment || "",
          }))}
          avgRating={avgRating}
        />
      </Suspense>

      {/* Related Products */}
      {product.categoryId && (
        <Suspense
          fallback={
            <div>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
        </Suspense>
      )}
    </>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Suspense
          fallback={
            <>
              {/* Breadcrumb Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-4 w-64" />
              </div>

              {/* Product Main Section Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-20 w-20 rounded-lg" />
                    ))}
                  </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-10 w-16" />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="mb-12">
                <div className="flex gap-4 border-b mb-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-32" />
                  ))}
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </>
          }
        >
          <ProductMainContent slug={slug} />
        </Suspense>
      </div>

      {/* Featured Products Grid */}
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
        <FeaturedProducts title="FEATURED PRODUCTS" filter="featured" />
      </Suspense>
    </div>
  );
}
