"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogOutIcon } from "lucide-react";
import { Button } from "../ui/button";

const SignOut = ({
  className,
  type = "default",
}: {
  className?: string;
  type?: "default" | "icon";
}) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: () => {
          setIsPending(false);
          toast.error("Failed to sign out. Please try again.");
        },
      },
    });
  };
  return (
    <Button
      onClick={handleSignOut}
      variant={"destructive"}
      className={cn("w-full text-white", className)}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="animate-spin text-white" />
      ) : (
        <span className="flex items-center gap-2">
          {" "}
          <LogOutIcon className="text-white" /> {type === "default" && "Sign Out"}
        </span>
      )}
    </Button>
  );
};

export default SignOut;
