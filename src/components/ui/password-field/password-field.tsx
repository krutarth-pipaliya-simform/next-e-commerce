'use client';

import { useState } from 'react';
import {
  controlClasses,
  describedBy,
  FieldShell,
} from '@/components/ui/field-shell';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { PasswordFieldProps } from './password-field.types';

/** Labelled password input with a show/hide toggle. */
export function PasswordField({
  id,
  label,
  hint,
  error,
  invalid = false,
  className,
  ...props
}: PasswordFieldProps) {
  const [shown, setShown] = useState(false);
  const isInvalid = invalid || Boolean(error);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          name={props.name ?? id}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            controlClasses,
            'pr-14',
            isInvalid ? 'border-sale' : 'border-divider',
            className,
          )}
          {...props}
          type={shown ? 'text' : 'password'}
        />
        <button
          type="button"
          onClick={() => setShown((value) => !value)}
          aria-label="Show password"
          aria-pressed={shown}
          aria-controls={id}
          className="absolute top-0.5 right-0.5 grid size-11 place-items-center rounded-[10px] text-body hover:bg-sunken"
        >
          {shown ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </FieldShell>
  );
}
