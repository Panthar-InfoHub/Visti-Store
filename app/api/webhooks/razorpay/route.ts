import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import {
  verifyWebhookSignature,
  deductStockForOrder,
  updateCouponUsage,
} from "@/utils/order-helpers";
import { sendOrderConfirmationToUser, sendOrderNotificationToAdmin } from "@/lib/send-mail";
import { getSiteConfig } from "@/actions/admin/site-config.actions";
import { generateAndUploadInvoice } from "@/lib/invoice/invoice-service";

/**
 * Razorpay Webhook Handler
 * Listens to payment events from Razorpay as a backup mechanism
 * Events handled:
 * - payment.captured: Payment successful
 * - payment.failed: Payment failed
 * - order.paid: Order paid (alternative success event)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("❌ SECURITY: Missing webhook signature");
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ CRITICAL: RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // Parse the payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    console.log(`Received webhook event: ${event}`);

    // Handle different events
    switch (event) {
      case "payment.captured":
      case "order.paid":
        await handlePaymentSuccess(paymentEntity, orderEntity);
        break;

      case "payment.failed":
        await handlePaymentFailure(paymentEntity, orderEntity);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentEntity: any, orderEntity: any) {
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;

  if (!razorpayOrderId) {
    console.error("Missing order ID in webhook payload");
    return;
  }

  console.log(`Processing payment success for order: ${razorpayOrderId}`);

  // Find order by razorpayOrderId
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
    include: { items: true },
  });

  if (!order) {
    console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
    return;
  }

  // Check if already processed
  if (order.paymentStatus === "SUCCESS") {
    console.log(`Order ${order.orderNumber} already marked as successful`);
    return;
  }

  // SECURITY: Verify payment amount matches order total
  const paidAmount = paymentEntity?.amount ? paymentEntity.amount / 100 : 0;
  if (paidAmount > 0 && Math.abs(paidAmount - order.total) > 0.01) {
    console.error(
      `❌ SECURITY: Amount mismatch in webhook. Expected: ${order.total}, Got: ${paidAmount}`
    );
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        paymentStatus: "FAILED",
        paymentMeta: {
          error: `Amount mismatch - expected ${order.total}, got ${paidAmount}`,
          webhookPayload: paymentEntity,
        },
      },
    });
    return;
  }

  // SECURITY: Verify payment status is captured
  if (paymentEntity?.status && paymentEntity.status !== "captured") {
    console.error(`❌ SECURITY: Payment not captured in webhook. Status: ${paymentEntity.status}`);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        paymentStatus: "FAILED",
        paymentMeta: {
          error: `Payment not captured - status: ${paymentEntity.status}`,
          webhookPayload: paymentEntity,
        },
      },
    });
    return;
  }

  console.log(`✅ Webhook payment verified: ${razorpayPaymentId} - Amount: ₹${paidAmount}`);

  try {
    // Update order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
          paymentStatus: "SUCCESS",
          razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
          paymentCapturedAt: new Date(),
          paymentMethod: paymentEntity?.method || "RAZORPAY",
          paymentMeta: paymentEntity || {},
        },
        include: {
          items: true,
        },
      });

      // Deduct stock for all items (only if not already deducted)
      if (order.status === "PENDING") {
        await deductStockForOrder(
          order.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          tx
        );
      }

      // Update coupon usage if applied
      if (order.couponCode) {
        await updateCouponUsage(order.couponCode, order.userId, tx);
      }

      return updated;
    });

    console.log(`Successfully processed payment for order: ${order.orderNumber}`);

    // Send emails asynchronously (don't block the webhook response)
    sendEmailsInBackground(updatedOrder).catch((error) => {
      console.error("Failed to send webhook emails:", error);
    });
  } catch (error: any) {
    console.error(`Error processing payment success webhook:`, error);
    throw error;
  }
}

async function handlePaymentFailure(paymentEntity: any, orderEntity: any) {
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  if (!razorpayOrderId) {
    console.error("Missing order ID in webhook payload");
    return;
  }

  console.log(`Processing payment failure for order: ${razorpayOrderId}`);

  // Find order by razorpayOrderId
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
  });

  if (!order) {
    console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
    return;
  }

  // Check if already marked as failed
  if (order.paymentStatus === "FAILED") {
    console.log(`Order ${order.orderNumber} already marked as failed`);
    return;
  }

  try {
    // Update order status to failed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        paymentStatus: "FAILED",
        paymentMeta: paymentEntity || {},
      },
    });

    console.log(`Successfully marked order as failed: ${order.orderNumber}`);
  } catch (error: any) {
    console.error(`Error processing payment failure webhook:`, error);
    throw error;
  }
}

// Helper function to send emails in the background
async function sendEmailsInBackground(order: any) {
  try {
    console.log("📧 [WEBHOOK] Preparing to send emails for order:", order.orderNumber);
    console.log(
      "📦 [WEBHOOK] Raw order data:",
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

    let invoiceUrl: string | null = null;
    try {
      invoiceUrl = await generateAndUploadInvoice(order, siteConfig);
    } catch (err) {
      console.error("[WEBHOOK] Invoice generation failed:", err);
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
      "✉️ [WEBHOOK] Formatted email data:",
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

    console.log("Webhook emails sent successfully");
  } catch (error) {
    // Just log the error, don't fail the webhook
    console.error("Failed to send webhook emails:", error);
  }
}
