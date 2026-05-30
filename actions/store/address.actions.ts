"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Get all addresses for user
export async function getAddresses() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

// Add new address
export async function addAddress(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  isDefault?: boolean;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // If this is set as default, unset all other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: session.user.id,
        isDefault: data.isDefault || false,
      },
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, data: address };
  } catch (error) {
    console.error("Error adding address:", error);
    return { success: false, error: "Failed to add address" };
  }
}

// Update address
export async function updateAddress(
  addressId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    address?: string;
    apartment?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
    isDefault?: boolean;
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!existing) {
      return { success: false, error: "Address not found" };
    }

    // If this is set as default, unset all other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data,
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, data: address };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Failed to update address" };
  }
}

// Delete address
export async function deleteAddress(addressId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!existing) {
      return { success: false, error: "Address not found" };
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, message: "Address deleted successfully" };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

// Set address as default
export async function setDefaultAddress(addressId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify address belongs to user
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!existing) {
      return { success: false, error: "Address not found" };
    }

    // Unset all defaults
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, message: "Default address updated" };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Failed to set default address" };
  }
}
