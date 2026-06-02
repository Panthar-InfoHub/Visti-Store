import { prisma } from "@/prisma/db";
import { ProductCarousel } from "@/components/store/home/product-carousel";
import { siteConfig } from "@/site.config";

interface FeaturedProductsProps {
  title: string;
  filter: "featured" | "bestseller" | "new" | "sale";
}

export async function FeaturedProducts({ title, filter }: FeaturedProductsProps) {
  const whereClause = {
    isActive: true,
    ...(filter === "featured" && { isFeatured: true }),
    ...(filter === "bestseller" && { isBestSeller: true }),
    ...(filter === "new" && { isNewArrival: true }),
    ...(filter === "sale" && { isOnSale: true }),
  };

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
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

  if (products.length === 0) return null;

  const isBestseller = filter === "bestseller";

  return (
    <section
      className={`py-12 md:py-20 ${
        isBestseller
          ? "bg-[url('/visti-image/bestseller-bg.png')] bg-cover  bg-no-repeat"
          : "bg-gray-50"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            {!isBestseller && (
              <p 
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: siteConfig.colors.primary }}
              >
                {filter === "new" ? "New Arrivals" : "Featured"}
              </p>
            )}
            <h2 
              className="text-3xl md:text-4xl font-bold mb-3 tracking-tight"
              style={{ color: siteConfig.colors.secondary }}
            >
              {isBestseller ? "Top Picks for Home Jewellery" : title}
            </h2>
            <p 
              className="text-sm md:text-base font-medium"
              style={{ color: siteConfig.colors.tertiary }}
            >
              {isBestseller
                ? "This week's curated selection from our jewellery collection."
                : "Discover our most popular products"}
            </p>
          </div>
          {isBestseller && (
            <a
              href="/products"
              className="font-semibold text-sm flex items-center gap-1.5 transition-all hover:opacity-80 shrink-0 md:mb-1"
              style={{ color: siteConfig.colors.primary }}
            >
              View All Products
              <span className="text-base font-normal">→</span>
            </a>
          )}
        </div>

        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
