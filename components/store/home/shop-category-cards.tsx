import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/prisma/db";
import { formatPrice } from "@/utils/format";
import { siteConfig } from "@/site.config";

// Vibrant gradient backgrounds for categories without images
const gradients = [
  "from-purple-500 via-pink-500 to-red-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-fuchsia-500 via-purple-500 to-indigo-500",
];

export async function ShopCategoryCards() {
  // Try to get featured categories first
  let categories = await prisma.category.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      parentId: null,
    },
    orderBy: {
      order: "asc",
    },
    take: 5,
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

  // Fallback: If no featured categories or less than 5, get regular active categories
  if (categories.length < 5) {
    const additionalNeeded = 5 - categories.length;
    const existingIds = categories.map((c) => c.id);

    const additionalCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
        id: {
          notIn: existingIds,
        },
      },
      orderBy: {
        order: "asc",
      },
      take: additionalNeeded,
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

    categories = [...categories, ...additionalCategories];
  }

  // If still no categories, don't render the section
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p 
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: siteConfig.colors.quaternary }}
            >
              Curated Collections
            </p>
            <h2 
              className="text-3xl md:text-4xl font-bold"
              style={{ color: siteConfig.colors.secondary }}
            >
              Accessories that spark elegance
            </h2>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity whitespace-nowrap md:mb-1"
            style={{ color: siteConfig.colors.quaternary }}
          >
            <span>View All Category</span>
            <span className="text-base">→</span>
          </Link>
          </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 5).map((category, index) => {
            const minPrice = category.products[0]?.variants?.[0]?.sellingPrice;
            const hasImage = category.image && category.image.trim() !== "";
            const gradient = gradients[index % gradients.length];

            // Specific layout logic for the 1-large + 4-small design
            const isLarge = index === 0;
            const isSecond = index === 1;

            // Spanning Logic:
            // Mobile (cols 2): [0]=2, [1,2,3,4]=1 -> Balanced rows
            // Tablet (cols 6): [0,1]=3, [2,3,4]=2 -> Two perfect rows (2 then 3)
            // Desktop (cols 4): [0]=2x2, [1,2,3,4]=1x1 -> 1 big, 4 small stack
            let gridClasses = "";
            if (isLarge) {
              gridClasses = "col-span-2 md:col-span-3 lg:col-span-2 lg:row-span-2";
            } else if (isSecond) {
              gridClasses = "col-span-1 md:col-span-3 lg:col-span-1 lg:row-span-1";
            } else {
              gridClasses = "col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-1";
            }

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl ${gridClasses}`}
              >
                <div className="relative w-full h-full aspect-square">
                  {hasImage ? (
                    <>
                      <Image
                        src={category.image!}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes={
                          isLarge
                            ? "(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                            : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        }
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-500" />
                    </>
                  ) : (
                    <>
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${gradient} transition-transform duration-700 group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.8)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.6)_0%,transparent_50%)]" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                    </>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 transform transition-transform duration-500 group-hover:-translate-y-1">
                    <h3
                      className={`font-bold text-white mb-2 drop-shadow-lg tracking-tight ${isLarge ? "text-xl md:text-3xl lg:text-4xl" :
                          isSecond ? "text-base md:text-3xl lg:text-xl" : // Large on tablet
                            "text-base md:text-lg lg:text-xl"
                        }`}
                    >
                      {category.name}
                    </h3>

                    {isLarge && category.description && (
                      <p className="text-white/80 text-sm md:text-base mb-4 max-w-lg line-clamp-2 md:line-clamp-3">
                        {category.description}
                      </p>
                    )}

                    {minPrice && (
                      <div className="flex items-center">
                        <span
                          className={`text-white/90 font-medium px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-sm ${isLarge ? "text-xs md:text-base" :
                              isSecond ? "text-[10px] md:text-base lg:text-xs" : // Larger on tablet
                                "text-[10px] md:text-xs"
                            }`}
                        >
                          Starting from {formatPrice(minPrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <div className="absolute top-4 right-4 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg border border-white/20">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-gray-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
