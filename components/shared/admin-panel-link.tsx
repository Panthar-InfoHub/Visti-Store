"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, Shield } from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminPanelLinkProps {
  variant?: "icon" | "full";
}

export function AdminPanelLink({ variant = "icon" }: AdminPanelLinkProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  // Don't show if already on admin page
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (variant === "full") {
    // Full button for mobile menu
    return (
      <Button variant="ghost" className="justify-start gap-3 h-12 w-full" asChild>
        <Link href="/admin">
          <Shield className="h-5 w-5" />
          <span>Admin Panel</span>
        </Link>
      </Button>
    );
  }

  // Icon button for desktop
  return (
    <Button variant={"ghost"} asChild size="icon" className="gap-2">
      <Link href="/admin">
        <Settings className="h-4 w-4 " />
      </Link>
    </Button>
  );
}
