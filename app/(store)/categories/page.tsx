  import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = generatePageMetadata({
  path: "/categories",
  title: "All Categories",
  description: "Browse products by category",
});

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoriesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;

  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: "asc" },
      skip,
      take: perPage,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
    prisma.category.count({
      where: { isActive: true, parentId: null },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  // Group categories into alternating grids (Grid 1: 2 items, Grid 2: 3 items)
  const grids: Array<{ type: "grid1" | "grid2"; categories: typeof categories }> = [];
  let index = 0;
  let isGrid1 = true;

  while (index < categories.length) {
    const take = isGrid1 ? 2 : 3;
    const chunk = categories.slice(index, index + take);
    if (chunk.length > 0) {
      grids.push({ type: isGrid1 ? "grid1" : "grid2", categories: chunk });
    }
    index += take;
    isGrid1 = !isGrid1;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Header */}
      <div className="bg-[#f5f4f1] py-16 md:py-24 mb-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c9a8e] block">
            Shop by Category
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#2d2d2d] leading-tight max-w-3xl">
            Discover Our <br />
            <span className="italic font-light text-[#5a6e5d]">Stylish Interiors</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl font-light leading-relaxed pt-2">
            Explore a thoughtfully curated selection of eco-friendly, premium furniture and home decor designed to bring style, comfort, and sustainable elegance to every corner of your living spaces.
          </p>
        </div>
      </div>

      {/* Main Categories Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-500 text-sm font-light">
              We couldn't find any active categories at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-20 lg:space-y-28">
            {grids.map((grid, gridIdx) => {
              if (grid.type === "grid1" && grid.categories.length === 2) {
                const largeCat = grid.categories[0];
                const smallCat = grid.categories[1];
                return (
                  <div key={gridIdx} className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-stretch">
                    {/* Large Card */}
                    <Link
                      href={`/categories/${largeCat.slug}`}
                      className="group lg:col-span-3 flex flex-col justify-between"
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[1.4] w-full overflow-hidden rounded-2xl bg-[#f0efec]">
                          <Image
                            src={largeCat.image || "/images/placeholder.png"}
                            alt={largeCat.name}
                            fill
                            className="object-contain p-6 sm:p-8 lg:p-10 group-hover:scale-[1.03] transition-transform duration-500"
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            priority={gridIdx === 0}
                          />
                        </div>
                        <div className="mt-6 flex justify-between items-start">
                          <div className="space-y-2 pr-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#8c9a8e]">
                              {largeCat._count.products} {largeCat._count.products === 1 ? "Product" : "Products"}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-medium text-[#2d2d2d] group-hover:text-[#5a6e5d] transition-colors duration-300">
                              {largeCat.name}
                            </h3>
                            {largeCat.description && (
                              <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xl line-clamp-2">
                                {largeCat.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 bg-[#2d3b2d] group-hover:bg-[#3d4f3d] w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors duration-300">
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Small Card */}
                    <Link
                      href={`/categories/${smallCat.slug}`}
                      className="group lg:col-span-2 flex flex-col justify-between"
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[1.1] w-full overflow-hidden rounded-2xl bg-[#f0efec]">
                          <Image
                            src={smallCat.image || "/images/placeholder.png"}
                            alt={smallCat.name}
                            fill
                            className="object-contain p-6 sm:p-8 group-hover:scale-[1.03] transition-transform duration-500"
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            priority={gridIdx === 0}
                          />
                        </div>
                        <div className="mt-6 space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c9a8e]">
                            {smallCat._count.products} {smallCat._count.products === 1 ? "Product" : "Products"}
                          </span>
                          <h3 className="text-xl md:text-2xl font-medium text-[#2d2d2d] group-hover:text-[#5a6e5d] transition-colors duration-300">
                            {smallCat.name}
                          </h3>
                          {smallCat.description && (
                            <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-2">
                              {smallCat.description}
                            </p>
                          )}
                          <div className="pt-2 flex items-center text-sm font-medium text-[#2d2d2d] group-hover:text-[#5a6e5d] transition-colors duration-300">
                            <span>Shop Collection</span>
                            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              } else {
                // Render as a standard multi-column grid
                const cols = grid.categories.length === 1
                  ? "grid-cols-1 max-w-2xl"
                  : grid.categories.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-3";

                return (
                  <div key={gridIdx} className={`grid ${cols} gap-8 lg:gap-12 items-stretch`}>
                    {grid.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="group flex flex-col justify-between"
                      >
                        <div className="flex flex-col h-full justify-between">
                          <div className="relative aspect-[4/3] sm:aspect-[1.2] w-full overflow-hidden rounded-2xl bg-[#f0efec]">
                            <Image
                              src={cat.image || "/images/placeholder.png"}
                              alt={cat.name}
                              fill
                              className="object-contain p-6 sm:p-8 group-hover:scale-[1.03] transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                          <div className="mt-6 space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#8c9a8e]">
                              {cat._count.products} {cat._count.products === 1 ? "Product" : "Products"}
                            </span>
                            <h3 className="text-xl md:text-2xl font-medium text-[#2d2d2d] group-hover:text-[#5a6e5d] transition-colors duration-300">
                              {cat.name}
                            </h3>
                            {cat.description && (
                              <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-2">
                                {cat.description}
                              </p>
                            )}
                            <div className="pt-2 flex items-center text-sm font-medium text-[#2d2d2d] group-hover:text-[#5a6e5d] transition-colors duration-300">
                              <span>Explore</span>
                              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              }
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-12 mt-16">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Link
                    href={currentPage > 1 ? `/categories?page=${currentPage - 1}` : "#"}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Previous
                  </Link>
                  <Link
                    href={currentPage < totalPages ? `/categories?page=${currentPage + 1}` : "#"}
                    className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                  >
                    Next
                  </Link>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-light">
                      Showing page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
                      <span className="font-medium text-gray-900">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md -space-x-px" aria-label="Pagination">
                      <Link
                        href={currentPage > 1 ? `/categories?page=${currentPage - 1}` : "#"}
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? "pointer-events-none opacity-30" : ""}`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </Link>
                      
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isCurrent = pageNum === currentPage;
                        return (
                          <Link
                            key={pageNum}
                            href={`/categories?page=${pageNum}`}
                            aria-current={isCurrent ? "page" : undefined}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                              isCurrent
                                ? "z-10 bg-[#2d3b2d] border-[#2d3b2d] text-white"
                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}

                      <Link
                        href={currentPage < totalPages ? `/categories?page=${currentPage + 1}` : "#"}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? "pointer-events-none opacity-30" : ""}`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {/* Static Home Decor Highlight Banner */}
            <div className="bg-[#dadada] rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-stretch mt-20 lg:mt-28">
              {/* Left Copy Column */}
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 space-y-6 text-left">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5a6e5d]">
                  Home Decor Highlights
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1b2b22] leading-tight max-w-md">
                  Stylish Home <br />
                  Designs
                </h2>
                <p className="text-[#3b4c40] text-sm sm:text-base font-light leading-relaxed max-w-sm">
                  Crafted by skilled artisans, each piece is made in small quantities. Carefully designed and finished to enhance the beauty and functionality of your space.
                </p>
                <div className="pt-4">
                  <Link
                    href="/products"
                    className="inline-block bg-[#23382b] hover:bg-[#2e4737] text-white font-medium text-sm px-8 py-3.5 rounded-full transition-colors duration-300 shadow-sm"
                  >
                    Explore Now
                  </Link>
                </div>
              </div>

              {/* Right Image Column */}
              <div className="relative min-h-[300px] sm:min-h-[400px] lg:min-h-full w-full">
                <Image
                  src="/image/category-image.png"
                  alt="Stylish Home Designs"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
