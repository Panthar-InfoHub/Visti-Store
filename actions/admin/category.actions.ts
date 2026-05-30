"use server";

import { CategoryFormData, categorySchema } from "@/lib/zod-schema";
import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

// Validation Schema

// Helper: Get all descendant category IDs recursively
async function getAllDescendantIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  if (children.length === 0) return [];

  const childIds = children.map((c) => c.id);
  const grandchildIds = await Promise.all(childIds.map((id) => getAllDescendantIds(id)));

  return [...childIds, ...grandchildIds.flat()];
}

// Helper: Get deletion impact (children count and total products)
async function getCategoryDeletionImpact(categoryId: string) {
  const descendantIds = await getAllDescendantIds(categoryId);
  const allIds = [categoryId, ...descendantIds];

  const [directProducts, affectedProducts] = await Promise.all([
    prisma.product.count({ where: { categoryId } }),
    prisma.product.count({ where: { categoryId: { in: allIds } } }),
  ]);

  return {
    childrenCount: descendantIds.length,
    directProducts,
    totalAffectedProducts: affectedProducts,
    descendantIds,
  };
}

// Get all categories (with hierarchy support)
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
        parent: true,
        children: true,
      },
      orderBy: { order: "asc" },
    });

    // Map categories with product count
    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
    }));

    return {
      success: true,
      data: categoriesWithCount,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get single category by ID
export async function getCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
        parent: true,
        children: true,
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return {
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// Get single category by slug (for URLs)
export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return {
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// Create category
export async function createCategory(data: CategoryFormData) {
  await requireAdmin();

  try {
    // Validate data
    const validatedData = categorySchema.parse(data);

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { success: false, error: "Category with this slug already exists" };
    }

    const category = await prisma.category.create({
      data: validatedData,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create category" };
  }
}

// Update category
export async function updateCategory(id: string, data: CategoryFormData) {
  await requireAdmin();

  try {
    // Validate data
    const validatedData = categorySchema.parse(data);

    // Check if slug is taken by another category
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "Category with this slug already exists" };
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update category" };
  }
}

// Get deletion impact for a category
export async function getCategoryDeletionInfo(id: string) {
  await requireAdmin();

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    const impact = await getCategoryDeletionImpact(id);

    return {
      success: true,
      data: {
        ...impact,
        categoryName: category.name,
      },
    };
  } catch (error) {
    console.error("Error getting deletion info:", error);
    return { success: false, error: "Failed to get deletion info" };
  }
}

// Delete category with cascade handling
export async function deleteCategory(
  id: string,
  options?: { moveProductsToUncategorized?: boolean }
) {
  await requireAdmin();

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, parentId: true },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Get deletion impact
    const impact = await getCategoryDeletionImpact(id);

    // If has children or products, require explicit confirmation
    if (
      !options?.moveProductsToUncategorized &&
      (impact.childrenCount > 0 || impact.totalAffectedProducts > 0)
    ) {
      return {
        success: false,
        requiresConfirmation: true,
        impact: {
          ...impact,
          categoryName: category.name,
        },
        error: `This category has ${impact.childrenCount} subcategories and ${impact.totalAffectedProducts} products that will be affected.`,
      };
    }

    // Delete with cascade (Prisma schema has onDelete: Cascade for children)
    // Move products to uncategorized (set categoryId to null)
    if (options?.moveProductsToUncategorized) {
      const allIds = [id, ...impact.descendantIds];
      await prisma.product.updateMany({
        where: { categoryId: { in: allIds } },
        data: { categoryId: null },
      });
    }

    // Delete category (children will be cascade deleted by Prisma)
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return {
      success: true,
      message: `Category "${category.name}" and ${impact.childrenCount} subcategories deleted. ${impact.totalAffectedProducts} products moved to uncategorized.`,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// Toggle category active status
export async function toggleCategoryStatus(id: string) {
  await requireAdmin();

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling category status:", error);
    return { success: false, error: "Failed to update category status" };
  }
}
