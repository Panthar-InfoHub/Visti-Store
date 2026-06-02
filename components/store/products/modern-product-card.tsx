"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart-db";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";
import { Loader2, Heart, Star, ShoppingCart } from "lucide-react";
import { getPrimaryVariant, getVariantDisplayDetails, BaseVariant } from "@/lib/variant-helpers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { siteConfig } from "@/site.config";

interface ModernProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    variants: BaseVariant[];
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
    avgRating?: number;
  };
}

export function ModernProductCard({ product }: ModernProductCardProps) {
  const { addItem, isProductLoading, isInCart } = useCart();
  const { isInWishlist, toggleItem, isProductLoading: isWishlistLoading } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const activeVariants = product.variants.filter((v) => v.isActive);
  const primaryVariant = getPrimaryVariant(activeVariants);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(primaryVariant?.id || "");

  const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId) || primaryVariant || null;

  const loadingKey = selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id;
  const isAddingToCart = isProductLoading(loadingKey);
  const inCart = selectedVariant ? isInCart(product.id, selectedVariant.id) : false;
  const displayDetails = getVariantDisplayDetails(selectedVariant);

  const discount = Math.round(((displayDetails.mrp - displayDetails.price) / displayDetails.mrp) * 100);
  const isOutOfStock = displayDetails.stock === 0;

  const inWishlist = isInWishlist(product.id);
  const isTogglingWishlist = isWishlistLoading(product.id);

  // Find images for active variants
  const allImages = Array.from(new Set(activeVariants.flatMap((v) => v.images)));
  const hasSecondImage = allImages.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      if (inCart) {
        const cartItem = selectedVariant
          ? useCart.getState().items.find((item) => item.productId === product.id && item.variantId === selectedVariant.id)
          : undefined;
        if (cartItem) {
          await useCart.getState().removeItem(cartItem.id);
        }
      } else {
        if (selectedVariant) {
          await addItem(product.id, product.title, 1, selectedVariant.id);
        } else {
          toast.error("No valid variant available");
        }
      }
    } catch (error) {
      // Handled in hook
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleItem(product.id);
    } catch (error) {
      // Handled in hook
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-[32px] border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-[#f4f4f4] rounded-[24px] overflow-hidden mb-4 shrink-0">
          {/* Wishlist Overlay Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 bg-white hover:bg-gray-50 active:scale-95 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group/btn border border-gray-100/50 disabled:opacity-50"
          >
            {isTogglingWishlist ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <Heart
                className={`w-4.5 h-4.5 transition-all duration-250 ${inWishlist
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-[#555555] group-hover/btn:text-red-500"
                  }`}
              />
            )}
          </button>

          {/* Rating Overlay Badge */}
          {product.avgRating !== undefined && product.avgRating > 0 && (
            <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100/50 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-[#234338] text-[#234338]" />
              <span className="font-bold text-[10px] text-gray-800 leading-none">
                {product.avgRating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Product Image */}
          <div className="relative w-full h-full p-0">
            <Image
              src={
                isHovered && hasSecondImage && !selectedVariantId
                  ? allImages[1]
                  : displayDetails.image || "/placeholder.svg"
              }
              alt={product.title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-xs z-10">
              <span className="bg-gray-950/90 text-white px-4 py-2 rounded-full font-medium text-xs tracking-wider uppercase">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
          {/* Title & Pricing Side-by-Side */}
          <div className="flex justify-between items-start gap-3 mb-3">
            <h3 className="font-bold text-[15px] text-gray-900 leading-snug tracking-tight line-clamp-2">
              {product.title}
            </h3>
            <div className="flex flex-col items-end shrink-0 pt-0.5">
              <span
                className="text-base font-extrabold leading-none"
                style={{ color: siteConfig.colors.tertiary }}
              >
                {formatPrice(displayDetails.price)}
              </span>
              {discount > 0 && (
                <span className="text-[11px] text-gray-400 line-through font-semibold leading-none mt-1">
                  {formatPrice(displayDetails.mrp)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.shortDescription && (
            <p className="text-xs text-gray-500 font-normal leading-relaxed line-clamp-2 mb-4">
              {product.shortDescription}
            </p>
          )}

          {/* Variant Selector */}
          {activeVariants.length > 0 && (
            <div
              className="flex flex-col gap-1.5 mb-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Variant
              </label>
              <Select
                value={selectedVariantId}
                onValueChange={(val) => {
                  setSelectedVariantId(val);
                }}
                disabled={activeVariants.length <= 1}
              >
                <SelectTrigger className="w-full !h-10 bg-[#f4f4f4] border-0 !rounded-full px-4 text-xs font-semibold text-gray-800 shadow-none focus:ring-0 focus:ring-offset-0 disabled:opacity-85">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-lg">
                  {activeVariants.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="rounded-lg py-2 text-xs">
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Add to Cart CTA Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={`w-full h-12 text-xs font-bold transition-all duration-200 uppercase tracking-wider !rounded-full shadow-none mt-auto flex items-center justify-center gap-1.5 ${inCart
                ? "bg-transparent border-2 border-gray-200 text-gray-800 hover:bg-gray-50"
                : "text-white hover:opacity-90"
              }`}
            variant={inCart ? "outline" : "default"}
            style={!inCart ? { backgroundColor: siteConfig.colors.tertiary } : undefined}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : inCart ? (
              "Remove from Cart"
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
