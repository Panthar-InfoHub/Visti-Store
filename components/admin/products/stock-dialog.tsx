"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { updateProductStock } from "@/actions/admin/product.actions";
import { Package, Loader2 } from "lucide-react";

interface StockDialogProps {
  product: {
    id: string;
    title: string;
    stock: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StockDialog({ product, open, onOpenChange, onSuccess }: StockDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stockQuantity, setStockQuantity] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setStockQuantity(product.stock);
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProductStock(product.id, stockQuantity);

      if (result.success) {
        toast.success("Stock updated successfully");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Update Stock</DialogTitle>
              <DialogDescription className="text-sm mt-1">{product?.title}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {product ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Stock Display */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Stock</span>
                  <span className="text-2xl font-bold">{product.stock} units</span>
                </div>
              </CardContent>
            </Card>

            {/* Stock Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">New Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                placeholder="Enter stock quantity"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Change from {product.stock} to {stockQuantity} units
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stock"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No product selected</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
