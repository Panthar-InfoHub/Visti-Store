"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { SearchDialog } from "./search-dialog";
import { AdminPanelLink } from "@/components/shared/admin-panel-link";
import { HeaderCartButton } from "./header-cart-button";
import { HeaderWishlistButton } from "./header-wishlist-button";
import { MobileMenu } from "./mobile-menu";
import { siteConfig } from "@/site.config";
import { Skeleton } from "@/components/ui/skeleton";

// Loading fallback for interactive buttons
function HeaderButtonsSkeleton() {
  return (
    <>
      <Skeleton className="h-10 w-10 rounded-md bg-white/20" />
      <Skeleton className="h-10 w-10 rounded-md bg-white/20 lg:hidden" />
      <Skeleton className="h-10 w-10 rounded-md bg-white/20 lg:hidden" />
    </>
  );
}

const navigationLinks = [
  {
    href: "/",
    label: "Home",
  },
  {
    label: "All Categories",
    href: "/categories",
  },
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Bulk Order",
    href: "/bulk-order",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

export function Header() {
  const pathname = usePathname();
  return (
    <nav className="bg-background text-foreground border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-1 relative">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <div className="rounded-lg relative w-12 h-12 md:w-14 md:h-14">
              <Image
                src={siteConfig.logo.path}
                alt={siteConfig.logo.alt}
                fill
                className="rounded-lg object-contain"
                priority
              />
            </div>
            {/* <span className="text-xl font-semibold  sm:inline">{siteConfig.name}</span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-6">
            {navigationLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap relative py-1"
                  style={{
                    color: isActive ? siteConfig.colors.primary : siteConfig.colors.secondary,
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{
                        backgroundColor: siteConfig.colors.secondary,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Admin Link */}
            <div className="hidden lg:block">
              <AdminPanelLink />
            </div>

            {/* Search - Mobile Only */}
            <div className="lg:hidden">
              <SearchDialog />
            </div>

            {/* Interactive Buttons with Suspense */}
            <Suspense fallback={<HeaderButtonsSkeleton />}>
              {/* Mobile Visible Icons - Cart & Account */}
              <HeaderCartButton isMobile />
              <Button variant="ghost" size="icon" className="lg:hidden " asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <SearchDialog />
                <HeaderCartButton />
                <HeaderWishlistButton />
                <Button variant="ghost" size="icon" className="" asChild>
                  <Link href="/account">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Mobile Menu - Right */}
              <MobileMenu navigationLinks={navigationLinks} />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}
