import type { ReactNode } from 'react';

/** Props every labelled form field shares. */
export type FieldBaseProps = {
  /** Id of the control. Also its `name` when no `name` is passed. */
  id: string;
  /** Visible label text. */
  label: string;
  /** Help text under the control. Hidden while `error` is set. */
  hint?: string;
  /** Error text under the control. Marks the control invalid. */
  error?: string;
};

export type FieldShellProps = FieldBaseProps & {
  /** The form control: an `<input>`, `<select>` or similar. */
  children: ReactNode;
};
