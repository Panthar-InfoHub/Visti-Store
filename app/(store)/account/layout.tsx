import type React from "react";
import { AccountNav } from "@/components/store/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen py-8 sm:py-12 bg-[#F8F6F2]">
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
