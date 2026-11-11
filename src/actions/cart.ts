'use server';

import { authorizeAction } from '@/lib/authz';
import { MAX_QUANTITY } from '@/lib/cart-rules';
import { visibleProduct } from '@/lib/catalog';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Any signed-in role can shop.
async function getUserId() {
  const { user } = await authorizeAction();
  return user?.id;
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

  if (!Number.isInteger(quantity) || quantity <= 0)
    return { error: 'Invalid quantity' };

  try {
    // Only products shoppers can see, and only a variant of that product.
    // A product with variants needs one picked.
    const product = await db.product.findFirst({
      where: { id: productId, ...visibleProduct },
      select: { variants: { select: { id: true, stock: true } } },
    });
    if (!product) return { error: 'This product is no longer available' };
    const variant = productVariantId
      ? product.variants.find((v) => v.id === productVariantId)
      : undefined;
    if (productVariantId) {
      if (!variant) return { error: 'That option is not available' };
    } else if (product.variants.length > 0) {
      return { error: 'Choose an option first' };
    }

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

    // What's already in the bag counts towards the stock and the per-item limit.
    const inBag = existingItem?.quantity ?? 0;
    const already = inBag ? ` (${inBag} already in your bag)` : '';
    if (variant && inBag + quantity > variant.stock) {
      return {
        error:
          variant.stock > 0
            ? `Only ${variant.stock} left${already}`
            : 'Sold out',
      };
    }
    if (inBag + quantity > MAX_QUANTITY) {
      return {
        error: `You can have up to ${MAX_QUANTITY} of an item${already}`,
      };
    }

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

  if (!Number.isInteger(quantity)) return { error: 'Invalid quantity' };

  try {
    // Security check: Verify the cart item belongs to the authenticated user's cart
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, variant: { select: { stock: true } } },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return { error: 'Item not found or unauthorized' };
    }

    // Only raising the quantity is checked, so a line that's over the
    // stock or the limit can still be stepped down.
    if (quantity > cartItem.quantity) {
      const stock = cartItem.variant?.stock;
      if (stock !== undefined && quantity > stock)
        return { error: stock > 0 ? `Only ${stock} left` : 'Sold out' };
      if (quantity > MAX_QUANTITY)
        return { error: `You can have up to ${MAX_QUANTITY} of an item` };
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
