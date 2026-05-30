"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart-db";
import { CartItem } from "@/components/store/cart/cart-item";
import { formatPrice } from "@/utils/format";
import { ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();
  const { items, getSubtotal, getShipping, getTotal } = useCart();

  const handleCheckout = () => {
    onOpenChange(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} >
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-background">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Shopping Cart ({items.length})
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="rounded-full bg-muted p-6 mb-4">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add some Product
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push("/products");
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Summary */}
        {items.length > 0 && (
          <div className="border-t bg-background px-6 py-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {getShipping() === 0 ? "FREE" : formatPrice(getShipping())}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full  h-12 text-base font-semibold"
              size="lg"
            >
              Proceed to Checkout
            </Button>

            <Button
              onClick={() => {
                onOpenChange(false);
                router.push("/products");
              }}
              variant="outline"
               className="w-full  h-12 text-base font-semibold"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
