'use client';

import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type CheckoutState, placeOrder } from '@/actions/checkout';
import type { DeliverySpeed, PaymentMethod } from '@/generated/prisma/enums';
import { AlertCircleIcon } from '@/components/ui/icons';
import { parcelFee } from '@/lib/cart-rules';
import type { CheckoutField } from '@/lib/checkout';
import { cn, formatPrice } from '@/lib/utils';
import { AddressSection } from './address-section';
import {
  CheckoutSummary,
  type Parcel,
  PlaceOrderLabel,
  placeOrderClasses,
} from './checkout-summary';
import type { CheckoutFormProps } from './checkout-form.types';
import { DeliverySection } from './delivery-section';
import { PaymentSection } from './payment-section';

const initialState: CheckoutState = {};

/** Names for the error summary, which links to each field. */
const fieldLabels: Record<CheckoutField, string> = {
  addressId: 'Shipping address',
  fullName: 'Full name',
  street: 'Street address',
  city: 'City',
  state: 'State',
  zipCode: 'PIN code',
  phone: 'Mobile number',
  paymentMethod: 'Payment method',
  cardNumber: 'Card number',
  cardExpiry: 'Expiry',
  cardCvc: 'Security code',
  cardName: 'Name on card',
};

/** Where an error summary link jumps: the field, or its section for a radio group. */
const fieldTarget = (field: CheckoutField) =>
  field === 'addressId'
    ? '#address'
    : field === 'paymentMethod'
      ? '#payment'
      : `#${field}`;

const toPaise = (rupees: number) => Math.round(rupees * 100);

/**
 * The checkout form: address, a delivery speed per store parcel, payment,
 * and the summary with Place order. The summary's total follows the speeds
 * picked. Submits to `placeOrder`, which redirects to the confirmation.
 */
export function CheckoutForm({
  addresses,
  groups,
  itemCount,
  subtotal,
  deliveryWindows,
}: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const [addressId, setAddressId] = useState(
    () => (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? 'new',
  );
  const [speeds, setSpeeds] = useState<Record<string, DeliverySpeed>>({});
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const alertRef = useRef<HTMLDivElement>(null);

  const parcels: Parcel[] = groups.map((group) => {
    const speed = speeds[group.store.id] ?? 'STANDARD';
    return { group, speed, fee: parcelFee(subtotal, speed) };
  });
  const shippingPaise = parcels.reduce((sum, p) => sum + toPaise(p.fee), 0);
  const shipping = shippingPaise / 100;
  const total = (toPaise(subtotal) + shippingPaise) / 100;

  const errors = state.fieldErrors ?? {};
  const errorFields = Object.keys(errors) as CheckoutField[];
  const hasErrors = Boolean(state.error) || errorFields.length > 0;

  // Move focus to the summary of what went wrong, so it's read out and in view.
  useEffect(() => {
    if (state !== initialState) alertRef.current?.focus();
  }, [state]);

  // Submitting through a transition, instead of the form's own action,
  // keeps what was typed when the server sends errors back (React resets a
  // form after its action runs).
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]"
    >
      <input type="hidden" name="expectedTotal" value={total.toFixed(2)} />

      <div className="flex min-w-0 flex-col gap-5">
        {hasErrors && !pending && (
          <div
            ref={alertRef}
            role="alert"
            tabIndex={-1}
            className="flex items-start gap-3 rounded-card bg-surface px-5 py-4 shadow-[inset_0_0_0_1px_var(--color-sale)]"
          >
            <AlertCircleIcon className="mt-0.5 flex-none text-sale" />
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-semibold text-sale">
                {state.error ??
                  (errorFields.length === 1
                    ? 'One thing to fix before you can place your order'
                    : `${errorFields.length} things to fix before you can place your order`)}
              </p>
              {errorFields.length > 0 && (
                <ul className="flex flex-col">
                  {errorFields.map((field) => (
                    <li key={field}>
                      <a
                        href={fieldTarget(field)}
                        className="inline-flex min-h-8 items-center text-sm text-body underline-offset-3 hover:underline"
                      >
                        {fieldLabels[field]}: {errors[field]}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <AddressSection
          addresses={addresses}
          addressId={addressId}
          onAddressChange={setAddressId}
          errors={errors}
        />
        <DeliverySection
          groups={groups}
          subtotal={subtotal}
          speeds={Object.fromEntries(
            parcels.map((p) => [p.group.store.id, p.speed]),
          )}
          onSpeedChange={(storeId, speed) =>
            setSpeeds((current) => ({ ...current, [storeId]: speed }))
          }
          deliveryWindows={deliveryWindows}
        />
        <PaymentSection
          method={method}
          onMethodChange={setMethod}
          storeShares={parcels.map((p) => ({
            storeName: p.group.store.name,
            amount: (toPaise(p.group.subtotal) + toPaise(p.fee)) / 100,
          }))}
          errors={errors}
        />
      </div>

      <CheckoutSummary
        parcels={parcels}
        itemCount={itemCount}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        deliveryWindows={deliveryWindows}
        pending={pending}
      />

      {/* Phones: the total and Place order stay in reach while the form scrolls. */}
      <div className="glass-chrome sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-control py-2 pr-2 pl-4 sm:hidden">
        <span className="flex flex-col tabular-nums">
          <span className="text-xs text-body">
            Total · {parcels.length}{' '}
            {parcels.length === 1 ? 'parcel' : 'parcels'}
          </span>
          <span className="text-lg font-semibold">{formatPrice(total)}</span>
        </span>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className={cn(placeOrderClasses, 'h-12 px-5')}
        >
          <PlaceOrderLabel pending={pending} />
        </button>
      </div>
    </form>
  );
}
