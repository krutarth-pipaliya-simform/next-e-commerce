import type { FieldShellProps } from './field-shell.types';

/** Shared look for text inputs, selects and similar controls. */
export const controlClasses =
  'h-12 w-full rounded-control border bg-surface px-3.5 text-[15px] text-ink';

/** The id of the text that describes a field: its error, else its hint. */
export function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

/**
 * Label above a form control, with an error or hint below it. Building
 * block for InputField and SelectField; use those in pages.
 */
export function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-sale">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
