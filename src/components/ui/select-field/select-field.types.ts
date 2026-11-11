import type { SelectHTMLAttributes } from 'react';
import type { FieldBaseProps } from '@/components/ui/field-shell';

/** Field props plus any native `<select>` attribute; pass `<option>`s as children. */
export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> &
  FieldBaseProps;
