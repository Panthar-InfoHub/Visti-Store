"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { Address } from "@/prisma/generated/prisma";

// Lazy load CheckoutForm (heavy component with Razorpay)
const CheckoutForm = dynamic(
  () =>
    import("@/components/store/checkout/checkout-form").then((mod) => ({
      default: mod.CheckoutForm,
    })),
  {
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    ),
    ssr: false,
  }
);

interface CheckoutClientProps {
  userEmail?: string;
  savedAddresses: Address[];
  initialCartItems: any[];
  initialShippingConfig: {
    shippingCharge: number | null;
    freeShippingMinOrder: number | null;
    cgstRate: number;
    sgstRate: number;
  } | null;
}

export function CheckoutClient({
  userEmail,
  savedAddresses,
  initialCartItems,
  initialShippingConfig,
}: CheckoutClientProps) {
  return (
    <CheckoutForm
      userEmail={userEmail}
      savedAddresses={savedAddresses}
      initialCartItems={initialCartItems}
      initialShippingConfig={initialShippingConfig}
    />
  );
}
