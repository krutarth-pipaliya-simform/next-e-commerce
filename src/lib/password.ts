/**
 * Password requirements, shared by the sign-up form (live checklist) and
 * the signUp Server Action (enforcement). Pure, so it runs on both sides.
 */
export const passwordRules = [
  {
    id: 'length',
    label: '8 or more characters',
    test: (pw: string) => pw.length >= 8,
  },
  {
    id: 'case',
    label: 'Upper and lower case',
    test: (pw: string) => /[a-z]/.test(pw) && /[A-Z]/.test(pw),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (pw: string) => /[0-9]/.test(pw),
  },
  {
    id: 'symbol',
    label: 'A symbol, like ! or #',
    test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
  },
] as const;

export type PasswordRuleId = (typeof passwordRules)[number]['id'];

/** Each rule with whether `password` meets it. */
export function checkPassword(password: string) {
  return passwordRules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    ok: rule.test(password),
  }));
}

/** True when `password` meets every rule. */
export function isPasswordValid(password: string) {
  return passwordRules.every((rule) => rule.test(password));
}
