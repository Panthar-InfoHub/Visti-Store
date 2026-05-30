"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CartDrawer } from "@/components/store/cart/cart-drawer";
import { useCart } from "@/hooks/use-cart-db";

export function HeaderCartButton({ isMobile = false }: { isMobile?: boolean }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={isMobile ? "lg:hidden relative " : "relative "}
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold ">
            {cartCount}
          </span>
        )}
      </Button>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
