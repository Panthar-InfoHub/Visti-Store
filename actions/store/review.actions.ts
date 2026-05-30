"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

interface CreateReviewData {
  productId: string;
  rating: number;
  comment?: string;
}

// Get product reviews with ratings
export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { success: false, error: "Failed to fetch reviews" };
  }
}

// Get product rating statistics
export async function getProductRatingStats(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
    );

    return {
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
        ratingDistribution,
      },
    };
  } catch (error) {
    console.error("Error fetching rating stats:", error);
    return { success: false, error: "Failed to fetch rating stats" };
  }
}

// Create or update review
export async function createOrUpdateReview(data: CreateReviewData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to review" };
    }

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: data.productId,
          userId: session.user.id,
        },
      },
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          productId: data.productId,
          userId: session.user.id,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    revalidatePath(`/products/${data.productId}`);
    return { success: true, data: review };
  } catch (error) {
    console.error("Error creating/updating review:", error);
    return { success: false, error: "Failed to save review" };
  }
}

// Submit review (simplified wrapper for UI)
export async function submitReview(productId: string, rating: number, comment: string) {
  return createOrUpdateReview({ productId, rating, comment });
}

// Check if user has reviewed product
export async function hasUserReviewedProduct(productId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: true, data: false };
    }

    const review = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    });

    return { success: true, data: !!review, review };
  } catch (error) {
    console.error("Error checking user review:", error);
    return { success: false, error: "Failed to check review status" };
  }
}

// Delete review (user can delete their own review)
export async function deleteReview(reviewId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in" };
    }

    // Check if review belongs to user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return { success: false, error: "Review not found" };
    }

    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "You can only delete your own reviews" };
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/products`);
    return { success: true, message: "Review deleted successfully" };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}
