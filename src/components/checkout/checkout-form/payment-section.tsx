import type { PaymentMethod } from '@/generated/prisma/enums';
import { CardIcon, CashIcon, InfoIcon } from '@/components/ui/icons';
import { InputField } from '@/components/ui/input-field';
import { RadioCard } from '@/components/ui/radio-card';
import type { CheckoutFieldErrors } from '@/lib/checkout';
import { formatPrice } from '@/lib/utils';
import { CheckoutSection } from './checkout-section';

type PaymentSectionProps = {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  /** What each store's courier collects on delivery, in rupees. */
  storeShares: { storeName: string; amount: number }[];
  errors: CheckoutFieldErrors;
};

const noteClasses =
  'flex items-start gap-2.5 rounded-control bg-sunken px-4 py-3.5 text-[13px] leading-normal text-body';

/** Step 3: a simulated card payment, or pay each courier on delivery. */
export function PaymentSection({
  method,
  onMethodChange,
  storeShares,
  errors,
}: PaymentSectionProps) {
  const shares = storeShares
    .map((share) => `${formatPrice(share.amount)} for ${share.storeName}`)
    .join(', ');

  return (
    <CheckoutSection
      id="payment"
      number={3}
      title="Payment"
      action={
        <span className="inline-flex h-6.5 items-center gap-1.5 rounded-chip bg-sunken px-2.5 text-xs font-semibold text-body">
          <InfoIcon width={14} height={14} />
          Test mode, no real charge
        </span>
      }
    >
      <fieldset
        aria-describedby={
          errors.paymentMethod ? 'paymentMethod-error' : undefined
        }
      >
        <legend className="sr-only">Payment method</legend>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3">
          <RadioCard
            name="paymentMethod"
            value="CARD"
            checked={method === 'CARD'}
            onChange={() => onMethodChange('CARD')}
            aside={<CardIcon className="text-muted" />}
          >
            <span className="text-[15px] font-semibold text-ink">
              Credit or debit card
            </span>
            <span className="text-[13px]">Visa, Mastercard, RuPay, Amex</span>
          </RadioCard>
          <RadioCard
            name="paymentMethod"
            value="CASH_ON_DELIVERY"
            checked={method === 'CASH_ON_DELIVERY'}
            onChange={() => onMethodChange('CASH_ON_DELIVERY')}
            aside={<CashIcon className="text-muted" />}
          >
            <span className="text-[15px] font-semibold text-ink">
              Pay on delivery
            </span>
            <span className="text-[13px]">Cash or UPI to each courier</span>
          </RadioCard>
        </div>
        {errors.paymentMethod && (
          <p id="paymentMethod-error" className="mt-2 text-[13px] text-sale">
            {errors.paymentMethod}
          </p>
        )}
      </fieldset>

      {method === 'CARD' ? (
        <>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-y-6">
            <div className="sm:col-span-2">
              <InputField
                id="cardNumber"
                label="Card number"
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                required
                maxLength={23}
                error={errors.cardNumber}
              />
            </div>
            <InputField
              id="cardExpiry"
              label="Expiry"
              autoComplete="cc-exp"
              inputMode="numeric"
              placeholder="MM / YY"
              required
              maxLength={7}
              error={errors.cardExpiry}
            />
            <InputField
              id="cardCvc"
              label="Security code"
              autoComplete="cc-csc"
              inputMode="numeric"
              placeholder="CVC"
              required
              maxLength={4}
              hint="3 digits on the back, 4 on the front for Amex."
              error={errors.cardCvc}
            />
            <div className="sm:col-span-2">
              <InputField
                id="cardName"
                label="Name on card"
                autoComplete="cc-name"
                required
                maxLength={100}
                error={errors.cardName}
              />
            </div>
          </div>
          <p className={noteClasses}>
            <InfoIcon width={18} height={18} className="mt-px flex-none" />
            <span>
              <span className="font-semibold text-ink">
                Payments are simulated.
              </span>{' '}
              Use 4242 4242 4242 4242 with any future date and any 3-digit code.
              4000 0000 0000 0002 is always declined. Only the last 4 digits are
              kept.
            </span>
          </p>
        </>
      ) : (
        <p className={noteClasses}>
          <InfoIcon width={18} height={18} className="mt-px flex-none" />
          <span>
            Each store’s courier collects its share when the parcel arrives:{' '}
            <span className="font-semibold text-ink tabular-nums">
              {shares}
            </span>
            , GST included.
          </span>
        </p>
      )}
    </CheckoutSection>
  );
}
