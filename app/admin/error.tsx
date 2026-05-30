"use client"; // Error boundaries must be Client Components

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    toast.error(error.message);
    // if (error.message === "Unauthorized") {
    //   router.push("/login");
    // }
    console.error(error.message);
  }, []);

  return (
    <div>
      <h2>Something went wrong!</h2>
    </div>
  );
}
