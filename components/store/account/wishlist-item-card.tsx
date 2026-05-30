"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/utils/format";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart-db";
import { toast } from "sonner";
import { useState } from "react";

interface WishlistItemCardProps {
  item: {
    id: string;
    productId: string;
    product: {
      id: string;
      title: string;
      slug: string;
      images: string[];
      sellingPrice: number;
      mrp: number;
      stock: number;
      primaryVariantId?: string | null;
      shortDescription?: string | null;
      category: {
        id: string;
        name: string;
        slug: string;
      } | null;
    };
  };
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const { toggleItem } = useWishlist();
  const { addItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const product = item.product;
  const discount =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const result = await toggleItem(product.id);
      if (result.success) {
        toast.success("Removed from wishlist");
      } else {
        toast.error(result.error || "Failed to remove from wishlist");
      }
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0 || !product.primaryVariantId) {
      toast.error("Product is out of stock");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem(product.id, product.title, 1, product.primaryVariantId);
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-gray-50">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.title}
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
        {discount > 0 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary mb-1 inline-block"
          >
            {product.category.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] hover:text-primary transition-colors mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        {product.shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAddingToCart}
            className="flex-1"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
          <Button onClick={handleRemove} disabled={isRemoving} variant="outline" size="sm">
            {isRemoving ? (
              <Trash2 className="h-4 w-4 animate-pulse" />
            ) : (
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
