"use client";

import { useMemo, useState } from "react";
import { ProductImageGallery } from "@/components/store/products/product-image-gallery";
import { ProductInfo } from "@/components/store/products/product-info";
import { BaseVariant, getPrimaryVariant } from "@/lib/variant-helpers";

interface ProductMainClientProps {
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
}

export function ProductMainClient({ product }: ProductMainClientProps) {
  const activeVariants = useMemo(() => product.variants.filter((v) => v.isActive), [product.variants]);
  const defaultVariant = useMemo(() => getPrimaryVariant(activeVariants), [activeVariants]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(defaultVariant?.id || "");

  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) || defaultVariant || null;
  const selectedVariantImages =
    selectedVariant && selectedVariant.images.length > 0
      ? selectedVariant.images
      : ["/placeholder.svg"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
      <ProductImageGallery images={selectedVariantImages} title={product.title} productId={product.id} />
      <ProductInfo
        product={product}
        selectedVariantId={selectedVariant?.id || ""}
        onVariantChange={setSelectedVariantId}
      />
    </div>
  );
}

