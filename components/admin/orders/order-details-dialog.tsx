"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/utils/format";
import { Package, MapPin, CreditCard, User, Copy, Check, FileDown } from "lucide-react";
import { getOrder } from "@/actions/admin/order.actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderStatus } from "@/prisma/generated/prisma";
import Image from "next/image";
import { toast } from "sonner";

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  taxAmount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string | null;
  paymentStatus: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentCapturedAt: Date | null;
  invoiceUrl: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    image: string | null;
    variantDetails: any;
    orderId: string;
    productId: string;
    createdAt: Date;
    product: {
      id: string;
      title: string;
      images: string[];
      slug: string;
    };
  }>;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "PROCESSING":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "SHIPPED":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
    case "DELIVERED":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "CANCELLED":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export function OrderDetailsDialog({ orderId, open, onOpenChange }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  useEffect(() => {
    if (orderId && open) {
      setLoading(true);
      getOrder(orderId).then((result) => {
        if (result.success && result.data) {
          setOrder(result.data as unknown as OrderDetails);
        }
        setLoading(false);
      });
    }
  }, [orderId, open]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-w-7xl! w-[95vw] max-h-[90vh]! p-0 gap-0 flex! flex-col! overflow-hidden sm:max-w-7xl!">
        <DialogHeader className="shrink-0 border-b pb-4 px-6 pt-6">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl">Order Details</DialogTitle>
            {order && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-mono">{order.orderNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(order.orderNumber, "Order ID")}
                >
                  {copiedId === order.orderNumber ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : order ? (
          <div className="overflow-y-scroll flex-1 px-6">
            <div className="space-y-5 py-6">
              {/* Top Row: Status, Date, Customer - 3 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                  <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="secondary" className={getStatusColor(order.status)}>
                    {order.status.toLowerCase()}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium text-sm">{order.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.user.email}</p>
                </div>
              </div>

              {/* Order Summary - Prominent at Top */}
              <div className="p-4 rounded-lg bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Order Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                    <p className="font-semibold">{formatCurrency(order.subtotal)}</p>
                  </div>
                  {order.discount > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Discount {order.couponCode && `(${order.couponCode})`}
                      </p>
                      <p className="font-semibold text-green-600">
                        -{formatCurrency(order.discount)}
                      </p>
                    </div>
                  )}
                  {order.taxAmount > 0 && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Taxable Amount</p>
                        <p className="font-semibold">{formatCurrency(order.taxableAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">CGST</p>
                        <p className="font-semibold">{formatCurrency(order.cgstAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">SGST</p>
                        <p className="font-semibold">{formatCurrency(order.sgstAmount)}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Shipping</p>
                    <p className="font-semibold">
                      {order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}
                    </p>
                  </div>
                  <div className="md:col-span-1 col-span-2 p-3 bg-background rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="font-bold text-xl">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              </div>

              {/* Addresses & Payment Info - 3 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Shipping Address */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    <h3 className="font-semibold">Shipping Address</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.address}
                      {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.pinCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p className="text-sm text-muted-foreground mt-2">
                        📞 {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Billing Address */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    <h3 className="font-semibold">Billing Address</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {(order.billingAddress || order.shippingAddress).firstName} {(order.billingAddress || order.shippingAddress).lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(order.billingAddress || order.shippingAddress).address}
                      {(order.billingAddress || order.shippingAddress).apartment && `, ${(order.billingAddress || order.shippingAddress).apartment}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(order.billingAddress || order.shippingAddress).city}, {(order.billingAddress || order.shippingAddress).state}{" "}
                      {(order.billingAddress || order.shippingAddress).pinCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{(order.billingAddress || order.shippingAddress).country}</p>
                    {(order.billingAddress || order.shippingAddress).phone && (
                      <p className="text-sm text-muted-foreground mt-2">
                        📞 {(order.billingAddress || order.shippingAddress).phone}
                      </p>
                    )}
                    {order.billingAddress?.gstNumber && (
                      <p className="text-sm font-medium mt-1">
                        GST: {order.billingAddress.gstNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4" />
                    <h3 className="font-semibold">Payment Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Method</p>
                        <p className="text-sm font-medium capitalize">
                          {order.paymentMethod || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge variant="secondary" className="text-xs">
                          {order.paymentStatus.toLowerCase()}
                        </Badge>
                      </div>
                    </div>

                    {order.razorpayOrderId && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Razorpay Order ID</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                            {order.razorpayOrderId}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={() =>
                              copyToClipboard(order.razorpayOrderId!, "Razorpay Order ID")
                            }
                          >
                            {copiedId === order.razorpayOrderId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {order.razorpayPaymentId && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Razorpay Payment ID</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                            {order.razorpayPaymentId}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={() =>
                              copyToClipboard(order.razorpayPaymentId!, "Razorpay Payment ID")
                            }
                          >
                            {copiedId === order.razorpayPaymentId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {order.paymentCapturedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Captured At</p>
                        <p className="text-sm">{formatDate(order.paymentCapturedAt)}</p>
                      </div>
                    )}
                    
                    {order.invoiceUrl && (
                      <div className="pt-3 border-t">
                        <Button size="sm" variant="outline" className="w-full gap-2" asChild>
                          <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <FileDown className="h-4 w-4" />
                            Download Invoice
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4" />
                  <h3 className="font-semibold">Order Items ({order.items.length})</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {order.items.map((item) => {
                    const variantDetails = item.variantDetails as { price?: number };
                    const itemTotal = (variantDetails?.price || 0) * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        {item.image && (
                          <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Qty: {item.quantity} × {formatCurrency(variantDetails?.price || 0)}
                          </p>
                        </div>
                        <p className="font-semibold text-sm whitespace-nowrap">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 px-6 text-muted-foreground">Order not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
