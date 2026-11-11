import { CheckIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { checkPassword } from '@/lib/password';

export type PasswordStrengthProps = {
  /** Id prefix. The meter is `${id}-strength`, the rules `${id}-rules`. */
  id: string;
  /** The password being typed. */
  password: string;
};

const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

/** Four-segment strength meter and the live password rules checklist. */
export function PasswordStrength({ id, password }: PasswordStrengthProps) {
  const rules = checkPassword(password);
  const met = password ? rules.filter((rule) => rule.ok).length : 0;
  const label = password ? labels[met] : 'Not set';
  const tone = !password
    ? 'bg-muted'
    : met <= 1
      ? 'bg-sale'
      : met === rules.length
        ? 'bg-stock'
        : 'bg-ink';

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex flex-1 gap-1.5">
          {rules.map((rule, index) => (
            <span
              key={rule.id}
              className={cn(
                'h-1 flex-1 rounded-full',
                index < met ? tone : 'bg-ink/10',
              )}
            />
          ))}
        </div>
        <span
          id={`${id}-strength`}
          aria-live="polite"
          className="min-w-16 text-right text-[13px] font-medium text-body"
        >
          <span className="sr-only">Password strength: </span>
          {label}
        </span>
      </div>
      <ul
        id={`${id}-rules`}
        aria-label="Password requirements"
        className="grid gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-2"
      >
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2',
              rule.ok ? 'text-ink' : 'text-muted',
            )}
          >
            {rule.ok ? (
              <CheckIcon width={16} height={16} className="text-stock" />
            ) : (
              <span
                aria-hidden="true"
                className="mx-[5px] size-1.5 rounded-full bg-current"
              />
            )}
            <span>
              {rule.label}
              <span className="sr-only">, {rule.ok ? 'done' : 'not yet'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
