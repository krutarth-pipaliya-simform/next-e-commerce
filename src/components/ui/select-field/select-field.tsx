import { ChevronDownIcon } from '@/components/ui/icons';
import {
  controlClasses,
  describedBy,
  FieldShell,
} from '@/components/ui/field-shell';
import { cn } from '@/lib/utils';
import type { SelectFieldProps } from './select-field.types';

/** Labelled native select with a chevron, plus optional hint or error text. */
export function SelectField({
  id,
  label,
  hint,
  error,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          name={props.name ?? id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            controlClasses,
            'appearance-none pr-10',
            error ? 'border-sale' : 'border-divider',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted" />
      </div>
    </FieldShell>
  );
}
