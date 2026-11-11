import {
  controlClasses,
  describedBy,
  FieldShell,
} from '@/components/ui/field-shell';
import { cn } from '@/lib/utils';
import type { InputFieldProps } from './input-field.types';

/** Labelled text input with optional hint or error text below it. */
export function InputField({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: InputFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          controlClasses,
          error ? 'border-sale' : 'border-divider',
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}
