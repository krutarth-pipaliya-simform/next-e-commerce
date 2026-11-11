'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authorizeAction } from '@/lib/authz';
import { getBag } from '@/lib/cart';
import { parcelFee } from '@/lib/cart-rules';
import {
  type CheckoutFieldErrors,
  DECLINED_TEST_CARD,
  parseCheckoutForm,
  SHIPPING_COUNTRY,
} from '@/lib/checkout';
import { db } from '@/lib/db';

export type CheckoutState = {
  /** A message for the whole form. */
  error?: string;
  /** Per-field messages, keyed by the field's name. */
  fieldErrors?: CheckoutFieldErrors;
};

/** Thrown inside the transaction when a variant sold out, to roll it back. */
class SoldOutError extends Error {
  constructor(readonly productName: string) {
    super(`${productName} sold out`);
  }
}

const toPaise = (rupees: number) => Math.round(rupees * 100);

/**
 * Places an order for everything buyable in the bag, for use with
 * useActionState. One Order is split into a StoreOrder per store, with
 * name, price and variant snapshots on each OrderItem. Stock is taken in
 * the same transaction, so two shoppers can't buy the last one. Payment is
 * simulated: a valid card is marked PAID, pay on delivery stays PENDING.
 * On success it redirects to /checkout/success.
 */
export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const { user, error } = await authorizeAction();
  if (!user) {
    return {
      error:
        error === 'Unauthorized'
          ? 'Your session ended. Sign in again to place your order.'
          : error,
    };
  }

  const parsed = parseCheckoutForm(formData);
  if ('fieldErrors' in parsed) return { fieldErrors: parsed.fieldErrors };
  const { address, payment, speeds, expectedTotalPaise } = parsed.input;

  if (payment.method === 'CARD' && payment.cardNumber === DECLINED_TEST_CARD) {
    return {
      fieldErrors: {
        cardNumber: 'Your card was declined. Try another card.',
      },
    };
  }

  let orderId: string;
  try {
    const bag = await getBag(user.id);
    if (bag.groups.length === 0) {
      return { error: 'Your bag is empty. Add something to check out.' };
    }
    if (!bag.canCheckout) {
      return {
        error:
          'Some items in your bag have less stock than you asked for. Lower them in your bag, then check out.',
      };
    }

    let shipTo: {
      fullName: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
    };
    if (address.kind === 'saved') {
      const saved = await db.address.findFirst({
        where: { id: address.id, userId: user.id },
      });
      if (!saved) {
        return {
          fieldErrors: { addressId: 'Choose an address to ship to.' },
        };
      }
      shipTo = saved;
    } else {
      shipTo = { ...address.value, country: SHIPPING_COUNTRY };
    }

    const parcels = bag.groups.map((group) => {
      const speed = speeds.get(group.store.id) ?? 'STANDARD';
      return { group, speed, fee: parcelFee(bag.subtotal, speed) };
    });
    const subtotalPaise = toPaise(bag.subtotal);
    const shippingPaise = parcels.reduce((sum, p) => sum + toPaise(p.fee), 0);
    const totalPaise = subtotalPaise + shippingPaise;

    // The bag changed (a price, a line, a store) since the page loaded.
    if (totalPaise !== expectedTotalPaise) {
      revalidatePath('/checkout');
      return {
        error:
          'Your bag changed since you opened checkout. Check the new total, then place your order again.',
      };
    }

    const lines = bag.groups.flatMap((group) => group.lines);
    const order = await db.$transaction(
      async (tx) => {
        // Decrement only while enough is left, so a race can't oversell.
        for (const line of lines) {
          if (!line.variantId) continue;
          const { count } = await tx.productVariant.updateMany({
            where: { id: line.variantId, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (count === 0) throw new SoldOutError(line.name);
        }

        if (address.kind === 'new' && address.save) {
          const hasAddresses = await tx.address.count({
            where: { userId: user.id },
          });
          await tx.address.create({
            data: {
              userId: user.id,
              ...address.value,
              country: SHIPPING_COUNTRY,
              isDefault: hasAddresses === 0,
            },
          });
        }

        const created = await tx.order.create({
          data: {
            userId: user.id,
            subTotal: subtotalPaise / 100,
            shippingTotal: shippingPaise / 100,
            totalAmount: totalPaise / 100,
            paymentMethod: payment.method,
            paymentStatus: payment.method === 'CARD' ? 'PAID' : 'PENDING',
            cardLast4:
              payment.method === 'CARD' ? payment.cardNumber.slice(-4) : null,
            shippingName: shipTo.fullName,
            shippingStreet: shipTo.street,
            shippingCity: shipTo.city,
            shippingState: shipTo.state,
            shippingZipCode: shipTo.zipCode,
            shippingCountry: shipTo.country,
            shippingPhone: shipTo.phone,
            storeOrders: {
              create: parcels.map(({ group, speed, fee }) => ({
                storeId: group.store.id,
                subTotal: group.subtotal,
                deliverySpeed: speed,
                shippingFee: fee,
                items: {
                  create: group.lines.map((line) => ({
                    productId: line.productId,
                    productVariantId: line.variantId,
                    name: line.name,
                    price: line.unitPrice,
                    quantity: line.quantity,
                    size: line.size,
                    color: line.color,
                    sku: line.sku,
                  })),
                },
              })),
            },
          },
          select: { id: true },
        });

        // Only what was bought leaves the bag; unavailable lines stay.
        await tx.cartItem.deleteMany({
          where: {
            id: { in: lines.map((line) => line.id) },
            cart: { userId: user.id },
          },
        });

        return created;
      },
      // The database is remote, so allow for a few round trips.
      { maxWait: 5000, timeout: 15000 },
    );
    orderId = order.id;
  } catch (error) {
    if (error instanceof SoldOutError) {
      revalidatePath('/checkout');
      return {
        error: `${error.productName} sold out while you were checking out. Nothing was charged. Update your bag, then try again.`,
      };
    }
    console.error('placeOrder Error:', error);
    return {
      error: 'We couldn’t place your order. Nothing was charged. Try again.',
    };
  }

  // The header's bag badge, the bag and the order pages all change.
  revalidatePath('/', 'layout');
  redirect(`/checkout/success?order=${orderId}`);
}
