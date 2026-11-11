import type { InputHTMLAttributes } from 'react';
import type { FieldBaseProps } from '@/components/ui/field-shell';

/** Field props plus any native `<input>` attribute (`type`, `required`, ...). */
export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
  FieldBaseProps & {
    /**
     * Marks the control invalid without error text under it, e.g. when a
     * form-level message covers several fields. `error` implies it.
     * @default false
     */
    invalid?: boolean;
  };
