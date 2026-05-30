"use client";

import { useCartSync } from "@/hooks/use-cart-db";
import { useWishlistSync } from "@/hooks/use-wishlist";

/**
 * Client component that handles cart and wishlist synchronization
 * Separated from layout to keep layout as server component
 */
export function StoreSync() {
  useCartSync();
  useWishlistSync();
  return null;
}
