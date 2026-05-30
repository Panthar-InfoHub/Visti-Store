"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/utils/format";
import { Heart, Minus, Plus, Share2, ShoppingCart, Star, Copy, Check, Loader2, Truck, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart-db";
import { getPrimaryVariant, getVariantDisplayDetails, BaseVariant } from "@/lib/variant-helpers";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";
import { siteConfig } from "@/site.config";

interface ProductInfoProps {
  product: {
    id: string;
    title: string;
    shortDescription: string | null;
    variants: BaseVariant[];
    tags: string[];
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
    avgRating?: number;
    reviewCount?: number;
  };
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
}

export function ProductInfo({ product, selectedVariantId, onVariantChange }: ProductInfoProps) {
  const activeVariants = product.variants?.filter(v => v.isActive) || [];
  const initialVariant = getPrimaryVariant(product.variants) as BaseVariant | undefined;

  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) || initialVariant;
  const [quantity, setQuantity] = useState(1);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addItem, isProductLoading, isInCart } = useCart();
  const { isInWishlist, toggleItem, isProductLoading: isWishlistLoading } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const inCart = selectedVariant ? isInCart(product.id, selectedVariant.id) : false;
  const loadingKey = selectedVariant ? `${product.id}:${selectedVariant.id}` : product.id;
  const isAddingToCart = isProductLoading(loadingKey);
  const isTogglingWishlist = isWishlistLoading(product.id);

  const displayDetails = selectedVariant ? getVariantDisplayDetails(selectedVariant) : { mrp: 0, price: 0, stock: 0, image: '' };
  const currentStock = displayDetails.stock;
  const discount = Math.round(((displayDetails.mrp - displayDetails.price) / displayDetails.mrp) * 100);
  const isOutOfStock = currentStock === 0;

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= currentStock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      if (inCart) {
        // Remove from cart if already in cart
        const cartItem = selectedVariant
          ? useCart.getState().items.find((item) => item.productId === product.id && item.variantId === selectedVariant.id)
          : undefined;
        if (cartItem) {
          await useCart.getState().removeItem(cartItem.id);
        }
      } else {
        // Add to cart
        if (selectedVariant) {
          await addItem(product.id, product.title, quantity, selectedVariant.id);
        } else {
          toast.error("Please select a variant first");
        }
      }
    } catch (error) {
      // Error toast is handled in the hook
    }
  };

  const handleWishlistToggle = async () => {
    try {
      await toggleItem(product.id);
    } catch (error) {
      // Error is already handled in the hook with optimistic revert
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback: Could not copy text", err);
        }

        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  // Find a suitable category name from tags or default to DECOR ITEMS
  const categoryLabel = product.tags?.[0]?.toUpperCase() || "DECOR ITEMS";

  return (
    <div className="flex flex-col h-full justify-start pt-2 lg:pt-4 space-y-2">
      {/* Category / Subtitle */}
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c48b6c] mb-1">
        {categoryLabel}
      </span>

      {/* Product Title */}
      <h1 className="text-4xl md:text-[44px] font-bold text-gray-900 leading-tight tracking-tight mb-2">
        {product.title}
      </h1>

      {/* Price & Rating Section */}
      <div className="flex items-center gap-4 mb-6">
        <span 
          className="text-2xl md:text-3xl font-extrabold"
          style={{ color: siteConfig.colors.secondary }}
        >
          {formatPrice(displayDetails.price)}
        </span>
        {discount > 0 && (
          <span className="text-base text-gray-400 line-through font-medium">
            {formatPrice(displayDetails.mrp)}
          </span>
        )}
        {product.avgRating !== undefined && product.avgRating > 0 && (
          <div className="flex items-center gap-1 bg-[#f4f4f4] px-2.5 py-1 rounded-full border border-gray-100">
            <Star className="w-3.5 h-3.5 fill-[#234338] text-[#234338]" />
            <span className="font-bold text-xs text-gray-800">
              {product.avgRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-sm md:text-[15px] text-gray-500 leading-relaxed font-normal mb-8 max-w-lg">
          {product.shortDescription}
        </p>
      )}

      {/* Custom Option Card Container */}
      <div className="bg-white border border-gray-100/80 rounded-[32px] p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] max-w-lg">
        {/* Row 1: Select Variant & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-6">
          {/* Select Variant */}
          {activeVariants.length > 0 ? (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Select Variant
              </label>
              <Select
                value={selectedVariant?.id || ""}
                onValueChange={(variantId) => {
                  onVariantChange(variantId);
                  setQuantity(1);
                }}
                disabled={activeVariants.length <= 1}
              >
                <SelectTrigger className="w-full !h-14 bg-[#f4f4f4] border-0 !rounded-full px-5 text-sm font-semibold text-gray-800 shadow-none focus:ring-0 focus:ring-offset-0 disabled:opacity-85">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-lg">
                  {activeVariants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id} className="rounded-lg py-2.5">
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                Select Variant
              </label>
              <div className="w-full h-14 bg-[#f4f4f4] rounded-full px-5 flex items-center text-sm font-semibold text-gray-400">
                Default Variant
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
              Quantity
            </label>
            <div className="flex items-center justify-between bg-[#f4f4f4] rounded-full h-14 px-3 w-full">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200/50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-gray-700 font-bold"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-bold text-sm text-gray-800 select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= currentStock || isOutOfStock}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200/50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all text-gray-700 font-bold"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Add to Cart Button */}
        {isOutOfStock ? (
          <div className="bg-red-50/50 border border-red-100 rounded-[20px] p-4 text-center mb-6">
            <p className="text-red-600 font-bold text-sm">Currently Out of Stock</p>
            <p className="text-red-500 text-xs mt-0.5">We'll notify you when it's back!</p>
          </div>
        ) : (
          <Button
            className={`w-full h-14 rounded-full text-sm font-bold shadow-none transition-all duration-200 uppercase tracking-wider mb-6 ${
              inCart
                ? "bg-transparent border-2 border-gray-200 text-gray-800 hover:bg-gray-50"
                : "text-white hover:opacity-90"
            }`}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            variant={inCart ? "outline" : "default"}
            style={!inCart ? { backgroundColor: siteConfig.colors.secondary } : undefined}
          >
            {isAddingToCart ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : inCart ? (
              "Remove from Cart"
            ) : (
              "Add to Cart"
            )}
          </Button>
        )}

        {/* Row 3: Trust Badges */}
        <div className="flex justify-center items-center gap-6 pt-4 border-t border-gray-100/60">
          <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            <Truck className="w-4 h-4 text-gray-400" />
            Express Delivery
          </span>
          <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            Quality Guaranteed
          </span>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Product</DialogTitle>
            <DialogDescription>Copy the link below to share this product</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="bg-gray-50 cursor-pointer h-10"
                onClick={(e) => {
                  e.currentTarget.select();
                }}
                onFocus={(e) => {
                  e.currentTarget.blur();
                }}
              />
            </div>
            <Button
              type="button"
              size="lg"
              className="px-4 bg-gray-900 hover:bg-black h-10"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
