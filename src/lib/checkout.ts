// Checkout form rules shared by the checkout form and the placeOrder Server
// Action. No database access here, so client components can import it.

import type { DeliverySpeed, PaymentMethod } from '@/generated/prisma/enums';

/** Orders ship within India only. */
export const SHIPPING_COUNTRY = 'India';

/** States and union territories, for the address form. */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

/** Six digits, not starting with 0. */
export const PIN_CODE_PATTERN = '[1-9][0-9]{5}';

/** The simulated card that is always declined, as in Stripe's test mode. */
export const DECLINED_TEST_CARD = '4000000000000002';

export type CheckoutField =
  | 'addressId'
  | 'fullName'
  | 'street'
  | 'city'
  | 'state'
  | 'zipCode'
  | 'phone'
  | 'paymentMethod'
  | 'cardNumber'
  | 'cardExpiry'
  | 'cardCvc'
  | 'cardName';

export type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

export type NewAddress = {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  /** Normalised, e.g. "+91 98765 43210". */
  phone: string;
};

export type CheckoutInput = {
  address:
    | { kind: 'saved'; id: string }
    | { kind: 'new'; value: NewAddress; save: boolean };
  payment:
    | { method: Extract<PaymentMethod, 'CARD'>; cardNumber: string }
    | { method: Extract<PaymentMethod, 'CASH_ON_DELIVERY'> };
  /** The speed picked for each store's parcel, by store id. */
  speeds: Map<string, DeliverySpeed>;
  /** The total the shopper saw, in paise, so a changed bag isn't charged silently. */
  expectedTotalPaise: number;
};

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? '').trim();

/**
 * A 10-digit Indian mobile number, which always starts with 6, 7, 8 or 9.
 * A +91, 91 or 0 in front of the 10 digits is dropped.
 */
export function normalizePhone(value: string) {
  const digits = value
    .replace(/[\s()-]/g, '')
    .replace(/^(?:\+?91|0)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** The Luhn checksum every real card number passes. */
function passesLuhn(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** True when an "MM / YY" (or "MM/YY", "MMYY") expiry is this month or later. */
function isFutureExpiry(value: string, now: Date) {
  const match = /^(\d{2})\s*\/?\s*(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth() + 1)
  );
}

function parseAddress(
  formData: FormData,
  errors: CheckoutFieldErrors,
): CheckoutInput['address'] | null {
  const addressId = text(formData, 'addressId');
  if (addressId && addressId !== 'new') return { kind: 'saved', id: addressId };

  const value = {
    fullName: text(formData, 'fullName'),
    street: text(formData, 'street'),
    city: text(formData, 'city'),
    state: text(formData, 'state'),
    zipCode: text(formData, 'zipCode'),
  };
  if (!value.fullName) errors.fullName = 'Enter the name of who receives it.';
  else if (value.fullName.length > 100)
    errors.fullName = 'Use 100 characters or fewer.';
  if (!value.street) errors.street = 'Enter a house number and street.';
  else if (value.street.length > 200)
    errors.street = 'Use 200 characters or fewer.';
  if (!value.city) errors.city = 'Enter a city.';
  else if (value.city.length > 100)
    errors.city = 'Use 100 characters or fewer.';
  if (!(INDIAN_STATES as readonly string[]).includes(value.state))
    errors.state = 'Choose a state.';
  if (!new RegExp(`^${PIN_CODE_PATTERN}$`).test(value.zipCode))
    errors.zipCode = 'Enter a 6-digit PIN code, like 560001.';
  const phone = normalizePhone(text(formData, 'phone'));
  if (!phone)
    errors.phone = 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';

  if (!phone) return null;
  return {
    kind: 'new',
    value: { ...value, phone },
    save: formData.get('saveAddress') === 'on',
  };
}

function parsePayment(
  formData: FormData,
  errors: CheckoutFieldErrors,
  now: Date,
): CheckoutInput['payment'] | null {
  const method = text(formData, 'paymentMethod');
  if (method === 'CASH_ON_DELIVERY') return { method };
  if (method !== 'CARD') {
    errors.paymentMethod = 'Choose how to pay.';
    return null;
  }

  // Simulated payments: the card is checked for shape, never charged or stored.
  const cardNumber = text(formData, 'cardNumber').replace(/[\s-]/g, '');
  if (!/^\d{12,19}$/.test(cardNumber) || !passesLuhn(cardNumber))
    errors.cardNumber = 'Enter a valid card number.';
  if (!isFutureExpiry(text(formData, 'cardExpiry'), now))
    errors.cardExpiry = 'Enter a future expiry date as MM / YY.';
  if (!/^\d{3,4}$/.test(text(formData, 'cardCvc')))
    errors.cardCvc = 'Enter the 3- or 4-digit code.';
  if (!text(formData, 'cardName'))
    errors.cardName = 'Enter the name on the card.';

  return errors.cardNumber ? null : { method, cardNumber };
}

/** Reads and validates the checkout form. Returns field errors, or the input. */
export function parseCheckoutForm(
  formData: FormData,
  now = new Date(),
): { fieldErrors: CheckoutFieldErrors } | { input: CheckoutInput } {
  const fieldErrors: CheckoutFieldErrors = {};
  const address = parseAddress(formData, fieldErrors);
  const payment = parsePayment(formData, fieldErrors, now);

  const speeds = new Map<string, DeliverySpeed>();
  for (const [name, value] of formData) {
    if (!name.startsWith('speed:')) continue;
    speeds.set(name.slice(6), value === 'EXPRESS' ? 'EXPRESS' : 'STANDARD');
  }

  const expectedTotalPaise = Math.round(
    Number(text(formData, 'expectedTotal')) * 100,
  );

  if (Object.keys(fieldErrors).length > 0 || !address || !payment) {
    return { fieldErrors };
  }
  return { input: { address, payment, speeds, expectedTotalPaise } };
}
