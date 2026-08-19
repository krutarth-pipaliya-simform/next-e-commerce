'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const session = await auth();
  return session?.user?.id;
}

export async function getCart() {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  try {
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                store: { select: { name: true } },
              },
            },
            variant: true,
          },
        },
      },
    });
    return { success: true, cart };
  } catch (error) {
    console.error('getCart Error:', error);
    return { error: 'Failed to fetch cart' };
  }
}

export async function addToCart(
  productId: string,
  productVariantId: string | null = null,
  quantity: number = 1,
) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  if (quantity <= 0) return { error: 'Invalid quantity' };

  try {
    // Ensure cart exists
    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    // Check if item already exists (findFirst because productVariantId can be null)
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        productVariantId,
      },
    });

    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          productVariantId,
          quantity,
        },
      });
    }

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('addToCart Error:', error);
    return { error: 'Failed to add item to cart' };
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
) {
  const userId = await getUserId();
  if (!userId) return { error: 'Unauthorized' };

  try {
    // Security check: Verify the cart item belongs to the authenticated user's cart
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return { error: 'Item not found or unauthorized' };
    }

    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await db.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('updateCartItemQuantity Error:', error);
    return { error: 'Failed to update item quantity' };
  }
}

export async function removeFromCart(cartItemId: string) {
  return updateCartItemQuantity(cartItemId, 0);
}
