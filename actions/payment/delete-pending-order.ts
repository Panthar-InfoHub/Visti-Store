"use server";

import { prisma } from "@/prisma/db";

/**
 * Deletes a pending order ONLY if it's still in PENDING status
 * This should only be called when user manually closes the payment modal
 * before attempting payment.
 *
 * DO NOT call this after a payment failure - failed orders should be kept
 * for record-keeping and customer support.
 */
export async function DeletePendingOrder(orderId: string) {
  try {
    // First, check the current status of the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, paymentStatus: true },
    });

    if (!order) {
      console.log("Order not found:", orderId);
      return { success: false, message: "Order not found" };
    }

    // Only delete if order is still PENDING
    // If it's FAILED, keep it for record-keeping
    if (order.status !== "PENDING") {
      return {
        success: false,
        message: `Order is ${order.status}, not deleted`,
        shouldDelete: false,
      };
    }

    // Check if payment was attempted (payment status changed from PENDING)
    if (order.paymentStatus !== "PENDING") {
      return {
        success: false,
        message: `Payment was attempted (${order.paymentStatus}), order kept for records`,
        shouldDelete: false,
      };
    }

    console.log("Deleting pending order:", orderId);
    await prisma.order.delete({
      where: {
        id: orderId,
        status: "PENDING",
      },
    });

    return {
      success: true,
      message: "Pending order deleted successfully",
      shouldDelete: true,
    };
  } catch (error) {
    console.error("Error deleting pending order");
    return {
      success: false,
      message: "Failed to delete pending order",
      shouldDelete: false,
    };
  }
}
