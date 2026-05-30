"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdminDashboardSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== "ADMIN")) {
      toast.error("Unauthorized");
    }
  }, [session, isPending]);

  if (isPending) {
    return <AdminDashboardSkeleton />;
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="p-4">Unauthorized - 404</div>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  return <>{children}</>;
}
