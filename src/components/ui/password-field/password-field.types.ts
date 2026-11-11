import type { InputHTMLAttributes } from 'react';
import type { FieldBaseProps } from '@/components/ui/field-shell';

/**
 * Field props plus any native `<input>` attribute except `type`, which the
 * show/hide toggle controls. Set `autoComplete` to `current-password` on
 * sign-in forms and `new-password` on sign-up forms.
 */
export type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> &
  FieldBaseProps & {
    /**
     * Marks the control invalid without error text under it, e.g. when a
     * form-level message covers several fields. `error` implies it.
     * @default false
     */
    invalid?: boolean;
  };
