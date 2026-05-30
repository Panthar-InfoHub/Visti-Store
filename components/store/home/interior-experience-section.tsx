import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/prisma/db";
import { siteConfig } from "@/site.config";

export async function InteriorExperienceSection() {
  // Fetch top 4 active categories with the most active products
  const topCategories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          products: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: {
      products: {
        _count: "desc",
      },
    },
    take: 4,
  });

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Editorial Content (approx 5 cols out of 12) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span 
              className="font-bold text-xs tracking-[0.2em] uppercase mb-4 block"
              style={{ color: siteConfig.colors.primary }}
            >
              Editorial
            </span>
            <h2 
              className="text-3xl md:text-4xl lg:text-[40px] font-medium leading-[1.2] tracking-tight mb-6"
              style={{ color: siteConfig.colors.secondary }}
            >
              The Interior Experience
            </h2>
            <p 
              className="text-sm md:text-base leading-relaxed mb-10 font-normal max-w-md"
              style={{ color: siteConfig.colors.secondary }}
            >
              A space not just for meals, but for conversation and connection. Our
              dining collection focuses on honest materials and timeless silhouettes
              that ground the room.
            </p>

            {/* Category List */}
            <div className="border-t border-gray-200">
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex items-center justify-between py-5 border-b border-gray-200 group hover:opacity-80 transition-opacity"
                >
                  <span 
                    className="text-base md:text-[17px] font-medium tracking-wide"
                    style={{ color: siteConfig.colors.secondary }}
                  >
                    {category.name}
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <Link
                href="/products"
                className="inline-block text-white border px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase font-bold transition-all duration-300 rounded-none hover:opacity-90"
                style={{ backgroundColor: siteConfig.colors.primary, borderColor: siteConfig.colors.primary }}
              >
                Shop Experience
              </Link>
            </div>
          </div>

          {/* Right Image Content (approx 7 cols out of 12) */}
          <div className="lg:col-span-7 w-full h-full relative aspect-[6/5] sm:aspect-[4/3] lg:aspect-[1.3] min-h-[350px] sm:min-h-[450px] lg:min-h-[550px]">
            <Image
              src="/image/dinner-table.png"
              alt="The Interior Experience"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
