import { prisma } from "@/prisma/db";
import crypto from "crypto";

/**
 * Generates a unique order number in format: ORD-YYYYMMDD-XXX
 * where XXX is a 3-digit sequence number for the day
 */
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD

  // Get today's order count
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayOrderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const orderSequence = (todayOrderCount + 1).toString().padStart(3, "0");
  return `ORD-${dateStr}-${orderSequence}`;
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verifies Razorpay webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return expectedSignature === signature;
}

/**
 * Deducts stock for order items in a transaction
 */
export async function deductStockForOrder(
  orderItems: Array<{
    variantId: string | null;
    quantity: number;
  }>,
  tx: any // Prisma transaction client
) {
  const validItems = orderItems.filter((i) => i.variantId);
  const variantIds = validItems.map((i) => i.variantId as string);
  const variants = await tx.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, name: true, stock: true },
  });

  // 1. Validate ALL items first in memory
  const updatePromises = validItems.map((item) => {
    const variant = variants.find((v: any) => v.id === item.variantId);
    if (!variant) throw new Error(`Variant not found: ${item.variantId}`);
    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${variant.name}. Available: ${variant.stock}`);
    }

    // 2. Prepare guarded atomic update promise
    return tx.productVariant.updateMany({
      where: { id: item.variantId as string, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
  });

  // 3. Execute all updates in parallel within the transaction
  const results = await Promise.all(updatePromises);
  for (const result of results) {
    if (!result || result.count !== 1) {
      throw new Error("Failed to deduct stock due to concurrent stock update");
    }
  }
}

/**
 * Updates coupon usage for an order
 */
export async function updateCouponUsage(
  couponCode: string,
  userId: string,
  tx: any // Prisma transaction client
) {
  // 1. Fetch coupon ID (needed for upsert)
  const coupon = await tx.coupon.findUnique({
    where: { code: couponCode },
    select: { id: true },
  });

  if (!coupon) return;

  // 2. Parallelize global increment and per-user upsert
  await Promise.all([
    // Update global usage count
    tx.coupon.update({
      where: { id: coupon.id },
      data: { totalUsed: { increment: 1 } },
    }),
    // Track per-user usage using upsert
    tx.couponUsage.upsert({
      where: {
        couponId_userId: {
          couponId: coupon.id,
          userId: userId,
        },
      },
      update: { usedCount: { increment: 1 } },
      create: {
        couponId: coupon.id,
        userId: userId,
        usedCount: 1,
      },
    }),
  ]);
}

/**
 * Calculates GST breakdown based on configurable CGST/SGST rates.
 * @param subtotal  - sum of item prices
 * @param discount  - coupon discount applied
 * @param cgstRate  - CGST percentage (e.g., 9 for 9%)
 * @param sgstRate  - SGST percentage (e.g., 9 for 9%)
 */
export function calculateTaxBreakdown(
  subtotal: number,
  discount: number,
  cgstRate: number = 9,
  sgstRate: number = 9
) {
  const taxableAmount = Math.max(subtotal - discount, 0);
  const cgstAmount = Math.round(taxableAmount * (cgstRate / 100) * 100) / 100;
  const sgstAmount = Math.round(taxableAmount * (sgstRate / 100) * 100) / 100;
  const taxAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100;
  return { taxableAmount, cgstAmount, sgstAmount, taxAmount };
}
