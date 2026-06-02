"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Package, MapPin, Heart, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { siteConfig } from "@/site.config";

const navigation = [
  { name: "Overview", href: "/account", icon: LayoutGrid },
  { name: "Orders", href: "/account/orders", icon: Package },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.info("Session ended");
    } finally {
      try {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          if (name.includes("better-auth")) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        }
      } catch (e) {
        console.error("Cookie cleanup error:", e);
      }
      window.location.href = "/";
    }
  };

  const NavContent = () => (
    <div className="space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSheetOpen(false)}
            className={cn(
              "flex items-center gap-4 px-5 py-3.5 rounded-full transition-all text-[15px] font-semibold w-[90%]",
              !isActive && "text-gray-500 hover:text-gray-900 hover:bg-black/5"
            )}
            style={isActive ? { backgroundColor: siteConfig.colors.announcement, color: siteConfig.colors.primary } : undefined}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}

      <button
        className="flex items-center gap-4 px-5 py-3.5 rounded-full transition-all text-[15px] font-semibold text-gray-500 hover:bg-red-50 hover:text-red-700 w-[90%] mt-2"
        onClick={() => {
          handleLogout();
          setSheetOpen(false);
        }}
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden mb-4">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-6 border-r-0" style={{ backgroundColor: siteConfig.colors.bgColor }}>
          <div className="flex flex-col pt-6">
            <nav className="space-y-1">
              <NavContent />
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:block pt-2">
        <nav className="sticky top-24">
          <NavContent />
        </nav>
      </aside>
    </>
  );
}
