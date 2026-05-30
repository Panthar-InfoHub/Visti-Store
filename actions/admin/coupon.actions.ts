"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { couponSchema, type CouponFormData } from "@/lib/zod-schema";
import { z } from "zod";

// Get all coupons
export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: coupons };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { success: false, error: "Failed to fetch coupons" };
  }
}

// Get single coupon
export async function getCoupon(id: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return { success: false, error: "Failed to fetch coupon" };
  }
}

// Validate and apply coupon
export async function validateCoupon(code: string, orderTotal: number, userId?: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      return { success: false, error: "Invalid coupon code" };
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { success: false, error: "This coupon has expired" };
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return {
        success: false,
        error: `Minimum order value of ₹${coupon.minOrderValue} required`,
      };
    }

    // Check global usage limit
    if (coupon.globalUsageLimit && coupon.totalUsed >= coupon.globalUsageLimit) {
      return { success: false, error: "This coupon has reached its usage limit" };
    }

    // Check per-user usage limit
    if (coupon.perUserLimit && userId) {
      const userUsage = await prisma.couponUsage.findUnique({
        where: {
          couponId_userId: {
            couponId: coupon.id,
            userId: userId,
          },
        },
      });

      if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
        return {
          success: false,
          error: `You have already used this coupon ${coupon.perUserLimit} time${
            coupon.perUserLimit > 1 ? "s" : ""
          }`,
        };
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (orderTotal * coupon.value) / 100;
      // Apply max discount cap if exists
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    // Ensure discount doesn't exceed order total
    if (discount > orderTotal) {
      discount = orderTotal;
    }

    return {
      success: true,
      data: {
        code: coupon.code,
        discount: Math.round(discount * 100) / 100,
        type: coupon.type,
        value: coupon.value,
      },
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { success: false, error: "Failed to validate coupon" };
  }
}

// Create coupon
export async function createCoupon(data: CouponFormData) {
  try {
    // Validate data
    const validatedData = couponSchema.parse(data);

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: validatedData.code.toUpperCase() },
    });

    if (existing) {
      return { success: false, error: "Coupon code already exists" };
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...validatedData,
        code: validatedData.code.toUpperCase(),
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, data: coupon, message: "Coupon created successfully" };
  } catch (error) {
    console.error("Error creating coupon:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create coupon" };
  }
}

// Update coupon
export async function updateCoupon(id: string, data: CouponFormData) {
  try {
    // Validate data
    const validatedData = couponSchema.parse(data);

    // Check if code is taken by another coupon
    const existing = await prisma.coupon.findUnique({
      where: { code: validatedData.code.toUpperCase() },
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "Coupon code already exists" };
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...validatedData,
        code: validatedData.code.toUpperCase(),
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, data: coupon, message: "Coupon updated successfully" };
  } catch (error) {
    console.error("Error updating coupon:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update coupon" };
  }
}

// Delete coupon
export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id },
    });

    revalidatePath("/admin/coupons");
    return { success: true, message: "Coupon deleted successfully" };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}

// Toggle coupon active status
export async function toggleCouponStatus(id: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    revalidatePath("/admin/coupons");
    return { success: true, data: updated, message: "Coupon status updated" };
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    return { success: false, error: "Failed to update coupon status" };
  }
}
