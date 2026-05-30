// actions/payment/confirm-order.ts
"use server";

import { prisma } from "@/prisma/db";
import {
  verifyRazorpaySignature,
  deductStockForOrder,
  updateCouponUsage,
} from "@/utils/order-helpers";
import { sendOrderConfirmationToUser, sendOrderNotificationToAdmin } from "@/lib/send-mail";
import { getSiteConfig } from "@/actions/admin/site-config.actions";
import { generateAndUploadInvoice } from "@/lib/invoice/invoice-service";

export async function confirmOrder({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    // Step 1: Verify signature (CRITICAL SECURITY CHECK)
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error(`❌ SECURITY: Invalid payment signature for order ${orderId}`);
      // Mark order as failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: "Invalid payment signature - possible fraud attempt" },
        },
      });
      throw new Error("Payment verification failed - invalid signature");
    }

    // Step 2: Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      throw new Error("Order not found");
    }

    // Step 3: Verify the Razorpay order ID matches (SECURITY CHECK)
    if (order.razorpayOrderId !== razorpay_order_id) {
      console.error(
        `❌ SECURITY: Razorpay order ID mismatch. Expected: ${order.razorpayOrderId}, Got: ${razorpay_order_id}`
      );
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: "Order ID mismatch - possible fraud attempt" },
        },
      });
      throw new Error("Order verification failed - ID mismatch");
    }

    // Step 4: Check if order is already processed (prevent double processing)
    if (order.paymentStatus === "SUCCESS") {
      console.log(`⚠️ Order ${order.orderNumber} already processed successfully`);
      return {
        success: true,
        data: order,
        message: "Order already processed",
      };
    }

    // Step 4: Update order in transaction - SUCCESS flow
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PROCESSING",
          paymentStatus: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          paymentCapturedAt: new Date(),
          paymentMethod: "RAZORPAY",
        },
        include: {
          items: true,
        },
      });

      // Deduct stock for all items
      await deductStockForOrder(
        order.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        tx
      );

      // Update coupon usage if applied
      if (order.couponCode) {
        await updateCouponUsage(order.couponCode, order.userId, tx);
      }

      return updated;
    });

    // Send emails asynchronously (don't await - fire and forget)
    sendEmailsInBackground(updatedOrder);

    return {
      success: true,
      data: updatedOrder,
      message: "Payment confirmed successfully",
    };
  } catch (error: any) {
    console.error("Error confirming order:", error);

    // Try to mark order as failed
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: error.message || "Unknown error" },
        },
      });
    } catch (updateError) {
      console.error("Failed to update order status to failed:", updateError);
    }

    throw error;
  }
}

// Helper function to send emails in the background
async function sendEmailsInBackground(order: any) {
  try {
    console.log("📧 Preparing to send emails for order:", order.orderNumber);
    console.log(
      "📦 Raw order data:",
      JSON.stringify(
        {
          orderNumber: order.orderNumber,
          shippingAddress: order.shippingAddress,
          total: order.total,
          paymentMethod: order.paymentMethod,
          itemCount: order.items?.length,
        },
        null,
        2
      )
    );

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    const configResult = await getSiteConfig();
    const siteConfig = configResult.success ? configResult.data : null;

    // Generate invoice PDF (non-blocking, won't fail the order)
    let invoiceUrl: string | null = null;
    try {
      invoiceUrl = await generateAndUploadInvoice(order, siteConfig);
    } catch (err) {
      console.error("Invoice generation failed:", err);
    }

    // Format order details for email
    const orderDateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    
    // Prefix + date + sequence
    const dateStr = new Date(order.createdAt).toISOString().split('T')[0].replace(/-/g, '');
    const sequenceMatch = order.orderNumber.match(/\d{3}$/);
    const sequence = sequenceMatch ? sequenceMatch[0] : "001";
    const invoiceNumber = `${siteConfig?.invoicePrefix || "INV"}${dateStr}${sequence}`;

    const subtotal = order.subtotal || 0;
    const discount = order.discount || 0;
    
    // Split discount among items proportionally based on their contribution to subtotal
    let remainingDiscount = discount;

    const items = order.items.map((item: any, index: number) => {
      const price = item.variantDetails?.sellingPrice || item.variantDetails?.price || 0;
      const grossAmount = price * item.quantity;
      
      // Calculate this item's share of the discount
      let itemDiscountAmount = 0;
      if (discount > 0 && subtotal > 0) {
        if (index === order.items.length - 1) {
          // Last item takes whatever discount is left to avoid rounding errors
          itemDiscountAmount = remainingDiscount;
        } else {
          itemDiscountAmount = (grossAmount / subtotal) * discount;
          remainingDiscount -= itemDiscountAmount;
        }
      }

      const taxableAmount = grossAmount - itemDiscountAmount;
      const cgstRate = siteConfig?.cgstRate ?? 9;
      const sgstRate = siteConfig?.sgstRate ?? 9;
      
      const cgstAmount = (taxableAmount * cgstRate) / 100;
      const sgstAmount = (taxableAmount * sgstRate) / 100;
      const totalAmount = taxableAmount + cgstAmount + sgstAmount;

      return {
        name: item.name,
        quantity: item.quantity,
        price: price,
        mrp: item.variantDetails?.mrp || price,
        variantName: item.variantDetails?.variantName || "",
        sku: item.variantDetails?.sku || null,
        hsnCode: item.hsnCode || null,
        discountAmount: itemDiscountAmount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        totalAmount,
      };
    });

    const orderDetails = {
      orderId: order.orderNumber,
      customerName:
        [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
          .filter(Boolean)
          .join(" ") || "",
      customerEmail: order.shippingAddress?.email || "",
      customerPhone: order.shippingAddress?.phone || "",
      items,
      totalAmount: order.total,
      subtotal,
      discount,
      taxAmount: order.taxAmount || 0,
      shippingAddress: [
        order.shippingAddress?.firstName && order.shippingAddress?.lastName
          ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
          : null,
        order.shippingAddress?.address,
        order.shippingAddress?.city,
        order.shippingAddress?.state,
        order.shippingAddress?.pinCode,
        order.shippingAddress?.country,
      ]
        .filter(Boolean)
        .join(", "),
      billingAddress: order.billingAddress ? [
        order.billingAddress.firstName && order.billingAddress.lastName
          ? `${order.billingAddress.firstName} ${order.billingAddress.lastName}`
          : null,
        order.billingAddress.address,
        order.billingAddress.city,
        order.billingAddress.state,
        order.billingAddress.pinCode,
        order.billingAddress.country,
      ]
        .filter(Boolean)
        .join(", ") : undefined,
      gstNumber: order.billingAddress?.gstNumber,
      paymentMethod: order.paymentMethod || "RAZORPAY",
      orderDate: orderDateFormatted,
      invoiceNumber,
      invoiceDate: orderDateFormatted,
      businessName: siteConfig?.businessName || null,
      businessAddress: siteConfig?.businessAddress || null,
      businessGstin: siteConfig?.businessGstin || null,
      businessPan: siteConfig?.businessPan || null,
      businessCin: siteConfig?.businessCin || null,
      businessPhone: siteConfig?.businessPhone || null,
      businessEmail: siteConfig?.businessEmail || null,
      cgstRate: siteConfig?.cgstRate ?? 9,
      sgstRate: siteConfig?.sgstRate ?? 9,
      shippingAddressObj: {
        name: [order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(" "),
        address: order.shippingAddress?.address || "",
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        pinCode: order.shippingAddress?.pinCode || "",
        country: order.shippingAddress?.country || "India",
        phone: order.shippingAddress?.phone || "",
      },
      billingAddressObj: order.billingAddress ? {
        name: [order.billingAddress.firstName, order.billingAddress.lastName].filter(Boolean).join(" "),
        address: order.billingAddress.address || "",
        city: order.billingAddress.city || "",
        state: order.billingAddress.state || "",
        pinCode: order.billingAddress.pinCode || "",
        country: order.billingAddress.country || "India",
        phone: order.billingAddress.phone || "",
      } : undefined,
      invoiceUrl,
    };

    // Log formatted order details to identify missing fields
    console.log(
      "✉️ Formatted email data:",
      JSON.stringify(
        {
          orderId: orderDetails.orderId,
          customerName: orderDetails.customerName || "❌ MISSING",
          customerEmail: orderDetails.customerEmail || "❌ MISSING",
          customerPhone: orderDetails.customerPhone || "❌ MISSING",
          shippingAddress: orderDetails.shippingAddress || "❌ MISSING",
          itemCount: orderDetails.items.length,
          totalAmount: orderDetails.totalAmount,
        },
        null,
        2
      )
    );

    // Send both emails in parallel
    await Promise.all([
      // Send to customer
      sendOrderConfirmationToUser(orderDetails as any),
      // Send to all admins
      ...adminEmails.map((email) => sendOrderNotificationToAdmin(email.trim(), orderDetails)),
    ]);

    console.log("Order emails sent successfully");
  } catch (error) {
    // Just log the error, don't fail the order
    console.error("Failed to send order emails:", error);
  }
}
