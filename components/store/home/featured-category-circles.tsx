import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/prisma/db";
import { siteConfig } from "@/site.config";

export async function FeaturedCategoryCircles() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    orderBy: {
      order: "asc",
    },
    take: 7,
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
  });

  if (categories.length === 0) return null;

  return (
    <section className="py-8 md:py-12" style={{ backgroundColor: siteConfig.colors.bgColor }}>
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto no-scrollbar md:flex-wrap md:justify-center gap-6 md:gap-10 pb-4">
          {categories.map((category) => {
            const hasImage = category.image && category.image.trim() !== "";
            
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center gap-3 shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <div 
                  className="relative w-24 h-24 md:w-32 md:h-32 rounded-full p-[2px]"
                  style={{ backgroundColor: siteConfig.colors.primary }}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white border-2 border-white shadow-md">
                    {hasImage ? (
                      <Image
                        src={category.image!}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-pink-100 to-rose-200" />
                    )}
                  </div>
                </div>
                
                <span 
                  className="text-sm md:text-base font-semibold text-center max-w-[100px] md:max-w-[128px] truncate"
                  style={{ color: siteConfig.colors.secondary }}
                  title={category.name}
                >
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
