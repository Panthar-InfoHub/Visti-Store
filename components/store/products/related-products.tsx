import { prisma } from "@/prisma/db";
import { ModernProductCard } from "@/components/store/products/modern-product-card";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
      id: { not: currentProductId },
    },
    take: 4,
    orderBy: {
      isBestSeller: "desc",
    },
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

  return (
    <section className="mt-16 pt-12 border-t">
      <div className="mb-12">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          You May Also Like
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">Related Products</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ModernProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
