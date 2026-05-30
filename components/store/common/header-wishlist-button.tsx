"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";

export function HeaderWishlistButton({ isMobile = false }: { isMobile?: boolean }) {
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;

  if (isMobile) {
    // Mobile version for hamburger menu
    return (
      <Button variant="ghost" className="justify-start gap-3 h-10 px-2 relative" asChild>
        <Link href="/account/wishlist">
          <Heart className="h-5 w-5" />
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {wishlistCount}
            </span>
          )}
        </Link>
      </Button>
    );
  }

  // Desktop version
  return (
    <Button variant="ghost" size="icon" className="relative " asChild>
      <Link href="/account/wishlist">
        <Heart className="h-5 w-5 " />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold ">
            {wishlistCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
