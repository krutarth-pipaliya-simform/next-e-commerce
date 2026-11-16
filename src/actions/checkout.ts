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

/**
 * Thrown inside the transaction when the bag lines being bought are gone
 * or changed: another submit already bought them, or a quantity changed
 * in another tab. Rolls the order back.
 */
class BagChangedError extends Error {}

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

    // A missing or edited total: the page didn't send what it showed.
    if (expectedTotalPaise === null) {
      return {
        error: 'Something went wrong with this page. Reload it and try again.',
      };
    }
    // The bag changed (a price, a line, a store) since the page loaded.
    if (totalPaise !== expectedTotalPaise) {
      revalidatePath('/checkout');
      return {
        error:
          'Your bag changed since you opened checkout. Check the new total, then place your order again.',
      };
    }

    // Prices were checked against the bag read just above, outside the
    // transaction. A seller editing a price in the few milliseconds before
    // the commit would still get the price the shopper saw; that's accepted.
    const lines = bag.groups.flatMap((group) => group.lines);
    // Always take variant rows in the same order, so two orders sharing
    // variants can't each hold one lock and wait on the other (deadlock).
    const stockLines = lines
      .filter((line) => line.variantId !== null)
      .sort((a, b) => (a.variantId! < b.variantId! ? -1 : 1));

    const order = await db.$transaction(
      async (tx) => {
        // Claim the bag lines first. A second submit of the same bag waits
        // on these rows until this one commits, then finds them gone and
        // rolls back, so a double submit can't place two orders. Matching
        // the quantity also catches a line changed in another tab.
        const claimed = await tx.cartItem.deleteMany({
          where: {
            cart: { userId: user.id },
            OR: lines.map((line) => ({ id: line.id, quantity: line.quantity })),
          },
        });
        if (claimed.count !== lines.length) throw new BagChangedError();

        // Decrement only while enough is left, so a race can't oversell.
        // Products sold without variants have no stock count, so they're
        // never limited here (the same as in the bag).
        for (const line of stockLines) {
          const { count } = await tx.productVariant.updateMany({
            where: { id: line.variantId!, stock: { gte: line.quantity } },
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

        return created;
      },
      // The database is remote, so allow for a few round trips.
      { maxWait: 5000, timeout: 15000 },
    );
    orderId = order.id;
  } catch (err) {
    if (err instanceof SoldOutError) {
      revalidatePath('/checkout');
      return {
        error: `${err.productName} sold out while you were checking out. Nothing was charged. Update your bag, then try again.`,
      };
    }
    if (err instanceof BagChangedError) {
      // No revalidate: an emptied bag would bounce the page to /cart before
      // this message shows, and the usual cause is a second click that
      // lost to an order already placed.
      return {
        error:
          'Your bag changed while you were checking out, or this order was already placed. Check your orders and your bag before trying again.',
      };
    }
    console.error('placeOrder Error:', err);
    return {
      error: 'We couldn’t place your order. Nothing was charged. Try again.',
    };
  }

  // The header's bag badge, the bag and the order pages all change.
  revalidatePath('/', 'layout');
  redirect(`/checkout/success?order=${orderId}`);
}
