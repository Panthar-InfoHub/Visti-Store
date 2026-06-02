import type React from "react";
import { AccountNav } from "@/components/store/account/account-nav";
import { siteConfig } from "@/site.config";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen py-8 sm:py-12" style={{ backgroundColor: siteConfig.colors.bgColor }}>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[220px_1fr] gap-4 lg:gap-10">
          <AccountNav />
          {/* Main Content */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}

