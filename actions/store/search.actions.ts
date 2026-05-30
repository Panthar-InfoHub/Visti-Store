"use server";

import { prisma } from "@/prisma/db";
import { getPrimaryVariant, getVariantDisplayDetails } from "@/lib/variant-helpers";

export interface SearchPreviewResult {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  products: Array<{
    id: string;
    title: string;
    slug: string;
    images: string[];
    sellingPrice: number;
    mrp: number;
    category?: {
      name: string;
      slug: string;
    } | null;
  }>;
  totalProducts: number;
  totalCategories: number;
}

// Quick search for preview (limited results)
export async function searchPreview(query: string): Promise<SearchPreviewResult> {
  if (!query || query.trim().length < 2) {
    return {
      categories: [],
      products: [],
      totalProducts: 0,
      totalCategories: 0,
    };
  }

  const searchTerm = query.trim();

  try {
    // Search categories
    const [categories, totalCategories] = await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
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
        take: 3,
      }),
      prisma.category.count({
        where: {
          isActive: true,
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      }),
    ]);

    // Search products
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has: searchTerm,
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          variants: {
            orderBy: { sortOrder: 'asc' }
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has: searchTerm,
              },
            },
          ],
        },
      }),
    ]);

    return {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat._count.products,
      })),
      products: products.map(p => {
        const primaryVariant = getPrimaryVariant(p.variants as any);
        const displayDetails = getVariantDisplayDetails(primaryVariant);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          images: Array.from(new Set(p.variants.flatMap((v: any) => v.images))),
          sellingPrice: displayDetails.price,
          mrp: displayDetails.mrp,
          category: p.category
        };
      }),
      totalProducts,
      totalCategories,
    };
  } catch (error) {
    console.error("Search preview error:", error);
    return {
      categories: [],
      products: [],
      totalProducts: 0,
      totalCategories: 0,
    };
  }
}
