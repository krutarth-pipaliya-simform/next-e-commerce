import Link from 'next/link';
import { InputField } from '@/components/ui/input-field';
import { PlusIcon } from '@/components/ui/icons';
import { RadioCard } from '@/components/ui/radio-card';
import { SelectField } from '@/components/ui/select-field';
import {
  type CheckoutFieldErrors,
  INDIAN_STATES,
  PIN_CODE_PATTERN,
  SHIPPING_COUNTRY,
} from '@/lib/checkout';
import { CheckoutSection } from './checkout-section';
import type { SavedAddress } from './checkout-form.types';

type AddressSectionProps = {
  addresses: SavedAddress[];
  /** The picked saved address's id, or 'new'. */
  addressId: string;
  onAddressChange: (id: string) => void;
  errors: CheckoutFieldErrors;
};

/** Step 1: a saved address, or a new one (saved for next time by default). */
export function AddressSection({
  addresses,
  addressId,
  onAddressChange,
  errors,
}: AddressSectionProps) {
  return (
    <CheckoutSection
      id="address"
      number={1}
      title="Shipping address"
      action={
        addresses.length > 0 && (
          <Link
            href="/dashboard/settings"
            className="inline-flex h-11 items-center text-sm font-medium text-accent hover:underline"
          >
            Manage addresses
          </Link>
        )
      }
    >
      {addresses.length > 0 && (
        <fieldset
          aria-describedby={errors.addressId ? 'addressId-error' : undefined}
        >
          <legend className="sr-only">Ship to</legend>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-3">
            {addresses.map((address) => (
              <RadioCard
                key={address.id}
                name="addressId"
                value={address.id}
                checked={addressId === address.id}
                onChange={() => onAddressChange(address.id)}
                className="min-h-[140px] p-4.5"
              >
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  {address.label ?? 'Saved address'}
                  {address.isDefault && (
                    <span className="inline-flex h-5.5 items-center rounded-chip bg-sunken px-2 text-xs font-semibold text-body">
                      Default
                    </span>
                  )}
                </span>
                <span>
                  {address.fullName}
                  <br />
                  {address.street}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                  <br />
                  {address.phone}
                </span>
              </RadioCard>
            ))}
            <RadioCard
              name="addressId"
              value="new"
              checked={addressId === 'new'}
              onChange={() => onAddressChange('new')}
              aria-controls="new-address"
              className="min-h-[140px] p-4.5"
            >
              <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <PlusIcon width={16} height={16} />
                Add new address
              </span>
              Ship somewhere else, and save it for next time.
            </RadioCard>
          </div>
          {errors.addressId && (
            <p id="addressId-error" className="mt-2 text-[13px] text-sale">
              {errors.addressId}
            </p>
          )}
        </fieldset>
      )}

      {addressId === 'new' && (
        <div
          id="new-address"
          className="grid gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-y-6"
        >
          <div className="sm:col-span-2">
            <InputField
              id="fullName"
              label="Full name"
              autoComplete="name"
              placeholder="Who receives the parcel"
              required
              maxLength={100}
              error={errors.fullName}
            />
          </div>
          <div className="sm:col-span-2">
            <InputField
              id="street"
              label="Street address"
              autoComplete="street-address"
              placeholder="Flat or house number, street, area"
              required
              maxLength={200}
              error={errors.street}
            />
          </div>
          <InputField
            id="city"
            label="City"
            autoComplete="address-level2"
            placeholder="Bengaluru"
            required
            maxLength={100}
            error={errors.city}
          />
          <SelectField
            id="state"
            label="State"
            autoComplete="address-level1"
            required
            defaultValue=""
            error={errors.state}
          >
            <option value="" disabled>
              Choose a state
            </option>
            {INDIAN_STATES.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </SelectField>
          <InputField
            id="zipCode"
            label="PIN code"
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="560001"
            required
            maxLength={6}
            pattern={PIN_CODE_PATTERN}
            hint={`Delivering within ${SHIPPING_COUNTRY} only.`}
            error={errors.zipCode}
          />
          <InputField
            id="phone"
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            required
            maxLength={16}
            hint="10 digits, starting with 6, 7, 8 or 9. Only shared with the stores and couriers delivering your parcels."
            error={errors.phone}
          />
          <label className="flex min-h-11 items-center gap-3 text-sm text-body sm:col-span-2">
            <input
              type="checkbox"
              name="saveAddress"
              defaultChecked
              className="size-5 shrink-0 accent-ink"
            />
            Save to my addresses
          </label>
        </div>
      )}
    </CheckoutSection>
  );
}
