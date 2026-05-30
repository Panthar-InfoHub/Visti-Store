"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getWishlist, toggleWishlist, clearWishlist } from "@/actions/store/wishlist.actions";

interface WishlistItem {
  id: string;
  productId: string;
  product: any;
  createdAt: Date;
}

interface WishlistStore {
  items: WishlistItem[];
  wishlistProductIds: Set<string>;
  isLoading: boolean;
  isInitialized: boolean;
  loadingProductIds: Set<string>;

  // Actions
  fetchWishlist: () => Promise<void>;
  toggleItem: (
    productId: string
  ) => Promise<{ success: boolean; message?: string; error?: string; isInWishlist?: boolean }>;
  clearWishlistItems: () => Promise<{ success: boolean; message?: string; error?: string }>;
  isInWishlist: (productId: string) => boolean;
  isProductLoading: (productId: string) => boolean;
  clearState: () => void;
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: [],
  wishlistProductIds: new Set(),
  isLoading: false,
  isInitialized: false,
  loadingProductIds: new Set<string>(),

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const result = await getWishlist();
      if (result.success && result.data) {
        const productIds = new Set(result.data.items.map((item) => item.productId));
        set({
          items: result.data.items,
          wishlistProductIds: productIds,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleItem: async (productId: string) => {
    // Add product to loading set
    set({ loadingProductIds: new Set([...get().loadingProductIds, productId]) });

    // Optimistic update
    const isCurrentlyInWishlist = get().wishlistProductIds.has(productId);
    const newProductIds = new Set(get().wishlistProductIds);

    if (isCurrentlyInWishlist) {
      newProductIds.delete(productId);
    } else {
      newProductIds.add(productId);
    }

    set({ wishlistProductIds: newProductIds });

    try {
      const result = await toggleWishlist(productId);
      if (result.success) {
        // Refresh wishlist to sync state
        await get().fetchWishlist();
      } else {
        // Revert optimistic update on failure
        set({ wishlistProductIds: get().wishlistProductIds });
      }
      return result;
    } catch (error) {
      // Revert optimistic update on error
      const revertedIds = new Set(get().wishlistProductIds);
      if (isCurrentlyInWishlist) {
        revertedIds.add(productId);
      } else {
        revertedIds.delete(productId);
      }
      set({ wishlistProductIds: revertedIds });
      throw error;
    } finally {
      // Remove product from loading set
      const newLoadingIds = new Set(get().loadingProductIds);
      newLoadingIds.delete(productId);
      set({ loadingProductIds: newLoadingIds });
    }
  },

  clearWishlistItems: async () => {
    const result = await clearWishlist();
    if (result.success) {
      set({ items: [], wishlistProductIds: new Set() });
    }
    return result;
  },

  isInWishlist: (productId: string) => {
    return get().wishlistProductIds.has(productId);
  },

  isProductLoading: (productId: string) => {
    return get().loadingProductIds.has(productId);
  },

  clearState: () => {
    set({ items: [], wishlistProductIds: new Set(), isInitialized: false, isLoading: false, loadingProductIds: new Set() });
  },
}));

// Hook to auto-sync wishlist with authentication state
export function useWishlistSync() {
  const { data: session } = useSession();
  const { fetchWishlist, clearState, isInitialized } = useWishlist();

  useEffect(() => {
    if (session?.user?.id && !isInitialized) {
      // User is logged in, fetch wishlist
      fetchWishlist();
    } else if (!session?.user?.id && isInitialized) {
      // User logged out, clear wishlist
      clearState();
    }
  }, [session?.user?.id, isInitialized, fetchWishlist, clearState]);
}
