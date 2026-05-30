import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CheckoutClient } from "./checkout-client";
import { Suspense } from "react";
import { CheckoutSkeleton } from "./checkout-skeleton";
import { prisma } from "@/prisma/db";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Fetch addresses, site config, and cart in parallel
  const [savedAddresses, siteConfig, cart] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
    prisma.siteConfig.findFirst(),
    prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                isActive: true,
              },
            },
            variant: true,
          },
        },
      },
    }),
  ]);

  // Map cart items for client
  const initialCartItems =
    cart?.items
      .filter((item) => item.product.isActive && item.variant.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.product.id,
        variantId: item.variant.id,
        variantName: item.variant.name,
        name: item.product.title,
        slug: item.product.slug,
        image: item.variant.images[0] || "/images/placeholder.png",
        price: item.variant.sellingPrice,
        mrp: item.variant.mrp,
        quantity: item.quantity,
        inStock: item.variant.stock > 0,
        stockQuantity: item.variant.stock,
      })) || [];

  return (
    <div className="min-h-screen py-8 lg:py-12 bg-[#F8F6F2]">
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutClient
            userEmail={session.user.email}
            savedAddresses={savedAddresses as any}
            initialCartItems={initialCartItems as any}
            initialShippingConfig={
              siteConfig
                ? {
                  shippingCharge: siteConfig.shippingCharge,
                  freeShippingMinOrder: siteConfig.freeShippingMinOrder,
                  cgstRate: siteConfig.cgstRate ?? 9,
                  sgstRate: siteConfig.sgstRate ?? 9,
                }
                : null
            }
          />
        </Suspense>
      </div>
    </div>
  );
}
