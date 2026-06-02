"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { WishlistItemCard } from "@/components/store/account/wishlist-item-card";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/site.config";

export default function WishlistPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { items, clearWishlistItems, isLoading } = useWishlist();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/account/wishlist");
    }
  }, [session, isPending, router]);

  const handleClearWishlist = async () => {
    if (!confirm("Are you sure you want to clear your entire wishlist?")) {
      return;
    }

    setIsClearing(true);
    await clearWishlistItems();
    setIsClearing(false);
  };

  if (isPending || isLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: siteConfig.colors.bgColor }}>
              <Heart className="h-5 w-5" style={{ color: siteConfig.colors.primary }} />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <Skeleton className="aspect-square w-full rounded-lg mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-10 w-full mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">My Wishlist</h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {items.length} {items.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>

          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              disabled={isClearing}
              className="shrink-0"
            >
              {isClearing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Wishlist
                </>
              )}
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4" style={{ color: siteConfig.colors.primary }} />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Save items you love to your wishlist and shop them later
            </p>
            <Link href="/products">
              <Button style={{ backgroundColor: siteConfig.colors.primary }} className="text-white hover:opacity-90 transition-opacity">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <WishlistItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
