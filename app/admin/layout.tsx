import React from "react";
import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import "./globals.css";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AdminSidebar } from "@/components/admin/shared/admin-sidebar";
import SignOut from "@/components/shared/sign-out";
import ThemeToggle from "@/components/admin/shared/theme-toggle";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AdminAuthGuard } from "@/components/admin/shared/admin-auth-guard";
import { AdminBreadcrumbs } from "@/components/admin/shared/admin-breadcrumbs";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <AdminAuthGuard>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-16 w-full items-center justify-between gap-2 border-b px-4">
              <div className="flex items-center gap-2 min-w-0">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <AdminBreadcrumbs />
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="flex items-center">
                  <SignOut className="h-9 px-3 py-0 text-sm" />
                </div>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </AdminAuthGuard>
    </ThemeProvider>
  );
}
