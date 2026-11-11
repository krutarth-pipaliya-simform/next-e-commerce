import type { InputHTMLAttributes } from 'react';
import type { FieldBaseProps } from '@/components/ui/field-shell';

/** Field props plus any native `<input>` attribute (`type`, `required`, ...). */
export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
  FieldBaseProps;
