"use server";

import { prisma } from "@/prisma/db";

export async function FailedOrder(orderId: string) {
  try {
    console.log("Marking order as failed:", orderId);
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED", paymentStatus: "FAILED" },
    });

    return { success: true, message: "Order marked as failed successfully" };
  } catch (error) {
    console.error("Error marking order as failed:", error);
    return { success: false, message: "Failed to mark order as failed" };
  }
}
