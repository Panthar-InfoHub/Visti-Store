"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/prisma/generated/prisma";
import { updateOrderStatus, getOrder } from "@/actions/admin/order.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OrderStatusDialogProps {
  orderId: string | null;
  currentStatus?: OrderStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

const getStatusColorClass = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "PROCESSING":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "SHIPPED":
      return "border-gray-200 bg-gray-50 text-gray-700";
    case "DELIVERED":
      return "border-green-200 bg-green-50 text-green-700";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
  }
};

export function OrderStatusDialog({
  orderId,
  currentStatus,
  open,
  onOpenChange,
}: OrderStatusDialogProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [fetchedStatus, setFetchedStatus] = useState<OrderStatus | null>(null);
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchOrderStatus = async () => {
      if (orderId && open) {
        setFetching(true);
        try {
          const result = await getOrder(orderId);
          if (result.success && result.data) {
            const status = result.data.status as OrderStatus;
            setFetchedStatus(status);
            setOrderStatus(status);
            setTrackingId(result.data.trackingId || "");
          }
        } catch (error) {
          console.error("Error fetching order status:", error);
        } finally {
          setFetching(false);
        }
      }
    };

    if (open) {
      if (currentStatus) {
        setFetchedStatus(currentStatus);
        setOrderStatus(currentStatus);
      } else {
        fetchOrderStatus();
      }
    }
  }, [orderId, currentStatus, open]);

  const handleSubmit = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const result = await updateOrderStatus(orderId, orderStatus, trackingId || undefined);
      if (!result.success) {
        toast.error(result.error || "Failed to update order status");
        return;
      }

      toast.success("Order status updated successfully");
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error("An error occurred while updating order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>Change the fulfillment status of this order</DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {fetchedStatus && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                <Badge className={getStatusColorClass(fetchedStatus)}>
                  {statusLabels[fetchedStatus]}
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="trackingId">Tracking ID (Optional)</Label>
              <Input
                id="trackingId"
                type="text"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Add a tracking ID for shipped orders</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderStatus">New Status</Label>
              <Select
                value={orderStatus}
                onValueChange={(value) => setOrderStatus(value as OrderStatus)}
              >
                <SelectTrigger id="orderStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrderStatus.PENDING}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value={OrderStatus.PROCESSING}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Processing
                    </div>
                  </SelectItem>
                  <SelectItem value={OrderStatus.SHIPPED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      Shipped
                    </div>
                  </SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Delivered
                    </div>
                  </SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                  <SelectItem value={OrderStatus.FAILED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Failed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || fetching}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
