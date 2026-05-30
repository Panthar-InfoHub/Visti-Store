"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPrimaryVariant, getVariantDisplayDetails } from "@/lib/variant-helpers";

// Get user's wishlist - OPTIMIZED
export async function getWishlist() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: true, data: { items: [] } };
    }

    // Single optimized query with proper select
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: session.user.id,
        product: {
          isActive: true, // Only fetch active products
        },
      },
      select: {
        id: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            variants: {
              orderBy: { sortOrder: 'asc' }
            },
            shortDescription: true,
            isActive: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map variants to legacy format for UI
    const mappedItems = wishlistItems.map(item => {
      const primaryVariant = getPrimaryVariant(item.product.variants as any);
      const displayDetails = getVariantDisplayDetails(primaryVariant);
      return {
        ...item,
        product: {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          images: Array.from(new Set(item.product.variants.flatMap((v: any) => v.images))),
          sellingPrice: displayDetails.price,
          mrp: displayDetails.mrp,
          stock: displayDetails.stock,
          primaryVariantId: primaryVariant?.id || null,
          shortDescription: item.product.shortDescription,
          isActive: item.product.isActive,
          category: item.product.category,
        }
      };
    });

    return { success: true, data: { items: mappedItems } };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return { success: false, error: "Failed to fetch wishlist" };
  }
}

// Toggle wishlist item (add if not exists, remove if exists)
export async function toggleWishlist(productId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Please login to manage wishlist" };
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
      revalidatePath("/");
      return { success: true, message: "Removed from wishlist", isInWishlist: false };
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });
      revalidatePath("/");
      return { success: true, message: "Added to wishlist", isInWishlist: true };
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: "Failed to update wishlist" };
  }
}

// Clear entire wishlist
export async function clearWishlist() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Please login to manage wishlist" };
    }

    await prisma.wishlistItem.deleteMany({
      where: { userId: session.user.id },
    });

    revalidatePath("/");
    return { success: true, message: "Wishlist cleared" };
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return { success: false, error: "Failed to clear wishlist" };
  }
}
