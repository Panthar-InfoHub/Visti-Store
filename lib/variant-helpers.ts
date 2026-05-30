

export type BaseVariant = {
  id: string;
  name: string;
  sku: string | null;
  images: string[];
  mrp: number;
  sellingPrice: number;
  stock: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

/**
 * Gets the primary variant from a list of variants.
 * Primary is defined as the first active variant sorted by sortOrder asc, then createdAt asc.
 * If no variants are active, it falls back to the first inactive variant by the same sorting.
 */
export function getPrimaryVariant<T extends BaseVariant>(variants: T[] | undefined | null): T | null {
  if (!variants || variants.length === 0) return null;
  
  const sortedVariants = [...variants].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const activeVariants = sortedVariants.filter(v => v.isActive);
  if (activeVariants.length > 0) {
    return activeVariants[0];
  }

  return sortedVariants[0];
}

/**
 * Derives common display fields from a variant.
 * Provides safe fallbacks if the variant is null.
 */
export function getVariantDisplayDetails(variant: BaseVariant | null) {
  if (!variant) {
    return {
      price: 0,
      mrp: 0,
      stock: 0,
      image: "/placeholder.svg",
      images: [] as string[],
      inStock: false,
      hasVariant: false,
    };
  }

  return {
    price: variant.sellingPrice,
    mrp: variant.mrp,
    stock: variant.stock,
    image: variant.images.length > 0 ? variant.images[0] : "/placeholder.svg",
    images: variant.images,
    inStock: variant.stock > 0,
    hasVariant: true,
  };
}
