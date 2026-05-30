import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/prisma/db";
import { formatPrice } from "@/utils/format";

export async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null, // Only top-level categories
    },
    orderBy: {
      order: "asc",
    },
    include: {
      products: {
        where: {
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          variants: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
            select: { sellingPrice: true },
          },
        },
      },
    },
  });

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Shop By Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of electronics, robotics, and DIY components
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {categories.map((category) => {
            const minPrice = category.products[0]?.variants?.[0]?.sellingPrice;

            return (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group">
                <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 md:p-6 hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="relative aspect-square mb-2 sm:mb-3 md:mb-4 rounded-xl overflow-hidden bg-white">
                    <Image
                      src={category.image || "/images/placeholder.png"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>

                  <h3 className="font-semibold text-gray-900 text-center text-xs sm:text-sm md:text-base mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>

                  {minPrice && (
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                      from {formatPrice(minPrice)}*
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
