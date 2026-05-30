/**
 * Example: Product Card Component
 * Shows how to use the simplified cart and wishlist system
 */

"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart-db";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

interface ProductCardExampleProps {
  product: {
    id: string;
    name: string;
    slug: string;
    variants: Array<{
      weight: string;
      price: number;
      inStock: boolean;
    }>;
  };
}

export function ProductCardExample({ product }: ProductCardExampleProps) {
  const [selectedWeight, setSelectedWeight] = useState(product.variants[0]?.weight || "");

  // Cart hooks
  const { isInCart, addItem, getTotalItems } = useCart();
  const totalCartItems = getTotalItems();

  // Wishlist hooks
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  // Check if this specific variant is in cart
  const inCart = isInCart(product.id, selectedWeight);

  // Handle add to cart
  const handleAddToCart = async () => {
    await addItem(product.id, product.name, 1, selectedWeight);
    // Toast is handled inside the hook
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    const result = await toggleItem(product.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error || "Failed to update wishlist");
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Product Info */}
      <div>
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-sm text-muted-foreground">Total items in cart: {totalCartItems}</p>
      </div>

      {/* Variant Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Weight:</label>
        <div className="flex gap-2">
          {product.variants.map((variant) => (
            <Button
              key={variant.weight}
              variant={selectedWeight === variant.weight ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedWeight(variant.weight)}
              disabled={!variant.inStock}
            >
              {variant.weight}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        {inCart && (
          <Badge variant="secondary" className="gap-1">
            <Check className="h-3 w-3" />
            In Cart
          </Badge>
        )}
        {inWishlist && (
          <Badge variant="secondary" className="gap-1">
            <Heart className="h-3 w-3 fill-current" />
            Wishlisted
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleAddToCart} disabled={inCart || !selectedWeight} className="flex-1">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {inCart ? "In Cart" : "Add to Cart"}
        </Button>

        <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

/**
 * Example: Header Cart Count
 */
export function HeaderCartCountExample() {
  const { getTotalItems } = useCart();
  const count = getTotalItems();

  return (
    <button className="relative">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Example: Wishlist Count
 */
export function HeaderWishlistCountExample() {
  const { items } = useWishlist();
  const count = items.length;

  return (
    <button className="relative">
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Example: Quick Wishlist Button (Just Icon)
 */
export function QuickWishlistButtonExample({ productId }: { productId: string }) {
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card click if inside a link
    e.stopPropagation();

    const result = await toggleItem(productId);
    if (result.success) {
      toast.success(result.message);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </button>
  );
}

/**
 * Example: Check Multiple Items
 */
export function BulkCartCheckExample({
  items,
}: {
  items: Array<{ productId: string; weight: string }>;
}) {
  const { isInCart } = useCart();

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Cart Status:</h3>
      {items.map((item) => {
        const inCart = isInCart(item.productId, item.weight);
        return (
          <div key={`${item.productId}-${item.weight}`} className="flex justify-between">
            <span>
              {item.productId} - {item.weight}
            </span>
            <Badge variant={inCart ? "default" : "outline"}>
              {inCart ? "In Cart" : "Not in Cart"}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
