"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Get or create cart ID for logged-in user only
async function getCartId() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return null; // No cart for guests
  }

  // Logged-in user
  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
    });
  }

  return cart.id;
}

// Get cart with full product details - OPTIMIZED
export async function getCart() {
  try {
    const cartId = await getCartId();

    // No cart for guests
    if (!cartId) {
      return { success: true, data: { items: [] }, requiresLogin: true };
    }

    // Single optimized query with join
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: true, data: { items: [] } };
    }

    // Map cart items with full product details - filter inactive products
    const enrichedItems = cart.items
      .filter((item) => item.product.isActive && item.variant?.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.product.id,
        variantId: item.variant.id,
        name: item.product.title,
        variantName: item.variant.name,
        slug: item.product.slug,
        image: item.variant.images[0] || "/images/placeholder.png",
        price: item.variant.sellingPrice,
        mrp: item.variant.mrp,
        quantity: item.quantity,
        inStock: item.variant.stock > 0,
        stockQuantity: item.variant.stock,
      }));

    return { success: true, data: { items: enrichedItems } };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, error: "Failed to fetch cart" };
  }
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  variantId: string
) {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to add items to cart", requiresLogin: true };
    }

    // Use upsert for better performance - single query instead of find + create/update
    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId,
        productId,
        variantId,
        quantity,
      },
    });

    revalidatePath("/");
    return { success: true, message: "Item added to cart" };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to update cart", requiresLogin: true };
    }

    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    revalidatePath("/");
    return { success: true, message: "Cart updated" };
  } catch (error) {
    console.error("Error updating cart:", error);
    return { success: false, error: "Failed to update cart" };
  }
}

// Remove item from cart
export async function removeFromCart(itemId: string) {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to remove items", requiresLogin: true };
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    revalidatePath("/");
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: "Failed to remove item from cart" };
  }
}

// Clear entire cart
export async function clearCart() {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to clear cart", requiresLogin: true };
    }

    await prisma.cartItem.deleteMany({
      where: { cartId },
    });

    revalidatePath("/");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}
