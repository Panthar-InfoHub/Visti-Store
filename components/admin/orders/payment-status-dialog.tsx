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
import { PaymentStatus } from "@/prisma/generated/prisma";
import { updatePaymentStatus, getOrder } from "@/actions/admin/order.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PaymentStatusDialogProps {
  orderId: string | null;
  currentStatus?: PaymentStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const getStatusColorClass = (status: PaymentStatus) => {
  switch (status) {
    case "PENDING":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "SUCCESS":
      return "border-green-200 bg-green-50 text-green-700";
    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";
    case "REFUNDED":
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
};

export function PaymentStatusDialog({
  orderId,
  currentStatus,
  open,
  onOpenChange,
}: PaymentStatusDialogProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);
  const [fetchedStatus, setFetchedStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (orderId && open) {
        setFetching(true);
        try {
          const result = await getOrder(orderId);
          if (result.success && result.data) {
            const status = result.data.paymentStatus as PaymentStatus;
            setFetchedStatus(status);
            setPaymentStatus(status);
          }
        } catch (error) {
          console.error("Error fetching payment status:", error);
        } finally {
          setFetching(false);
        }
      }
    };

    if (open) {
      if (currentStatus) {
        setFetchedStatus(currentStatus);
        setPaymentStatus(currentStatus);
      } else {
        fetchPaymentStatus();
      }
    }
  }, [orderId, currentStatus, open]);

  const handleSubmit = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const result = await updatePaymentStatus(orderId, paymentStatus);
      if (!result.success) {
        toast.error(result.error || "Failed to update payment status");
        return;
      }

      toast.success("Payment status updated successfully");
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error("An error occurred while updating payment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
          <DialogDescription>Change the payment status of this order</DialogDescription>
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
              <Label htmlFor="paymentStatus">New Status</Label>
              <Select
                value={paymentStatus}
                onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
              >
                <SelectTrigger id="paymentStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentStatus.PENDING}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value={PaymentStatus.SUCCESS}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Success
                    </div>
                  </SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Failed
                    </div>
                  </SelectItem>
                  <SelectItem value={PaymentStatus.REFUNDED}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      Refunded
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
