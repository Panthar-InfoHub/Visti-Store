"use server";

import { getSiteConfig } from "@/actions/admin/site-config.actions";

export async function getShippingConfig() {
  const configResult = await getSiteConfig();

  if (!configResult.success || !configResult.data) {
    // Return null values if config fetch fails - no defaults
    return {
      shippingCharge: null,
      freeShippingMinOrder: null,
    };
  }

  // Return actual values from database (can be null)
  // Null means the feature is not configured, not that we should use a default
  return {
    shippingCharge: configResult.data.shippingCharge ?? null,
    freeShippingMinOrder: configResult.data.freeShippingMinOrder ?? null,
  };
}
