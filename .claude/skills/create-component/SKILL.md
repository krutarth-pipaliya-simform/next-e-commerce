---
name: create-component
description: >
  Use when creating a new React component under src/components: a reusable UI
  piece (button, badge, card, field) or a section for one page or feature.
---

# Create a component

## 1. Settle scope before writing code

Ask the user whatever their request leaves open, and wait for the answers:

1. **Scope**: core (reusable anywhere) or feature-scoped (one page or feature)?
2. **Props**: what data and callbacks does it take?
3. **Variants**: does it need sizes, variants or states (disabled, loading, error)?
4. **Composition**: which existing components should it build on?

Done when every question has an answer, from the request or from the user.

## 2. Find what to build on

Read `src/components/` before writing anything. Reuse what exists:
`Button`/`buttonClasses`, `InputField`/`SelectField`, `Container`, `StatusBadge`,
`ProductCard`, the icons in `icons.tsx`, and `cn()` from `@/lib/utils`. Extend
an existing component with a prop or variant when that covers the need, instead
of making a near-duplicate.

## 3. Place it by scope

| Scope | Location | Data |
| --- | --- | --- |
| Core | `src/components/ui/<name>/` | Props only. No database, Server Action or `fetch` calls, no page-specific logic. |
| Feature-scoped | `src/components/<feature>/<name>/` (e.g. `home`, `product`, `layout`) | May fetch through `src/lib/` and hold feature logic. Built from core components. |

`src/app/` stays routing only, so components never live there.

## 4. One folder per component

File and folder names are kebab-case, matching the rest of the repo:

```
src/components/ui/status-pill/
  status-pill.tsx          # the component
  status-pill.types.ts     # props and variant types, when they're more than a few lines
  status-pill.stories.tsx  # Storybook story, core components only
  index.ts                 # re-exports the component and its public types
```

Imports go through the folder: `import { StatusPill } from '@/components/ui/status-pill'`.

Storybook isn't installed yet. Skip the `.stories.tsx` file until it is, and
ask the user before adding Storybook to the project.

Every exported component gets its own folder; two components never share a
file. Private helpers used by one component (a sub-part, a data list) stay in
that component's folder.

## 5. Write it

- **Colours**: use the theme tokens defined in `@theme` in
  `src/app/(frontend)/globals.css` (`bg-surface`, `text-ink`, `text-muted`,
  `border-hairline`, `text-accent`, `rounded-control`, ...) and the glass
  utilities documented there. A colour the theme lacks gets added to `@theme`
  first, then used as a token.
- **Props**: one exported `<Name>Props` type. Give every prop a JSDoc comment,
  with `@default` where it has one:

  ```ts
  export type StatusPillProps = {
    /** Order status shown in the pill. */
    status: 'pending' | 'shipped' | 'delivered';
    /**
     * Visual size.
     * @default 'md'
     */
    size?: 'sm' | 'md';
  };
  ```

- **Variants**: map each variant to a class string in a `Record`, and join with `cn()`.

## 6. Check

Done when all of these hold:

- [ ] Scope questions answered and the component sits in the folder its scope calls for.
- [ ] It reuses existing components and icons wherever one fits.
- [ ] Every colour comes from a theme token.
- [ ] Every prop has a JSDoc comment.
- [ ] Every clickable part is a native control the global cursor rule covers (see Conventions in `CLAUDE.md`), and disabled or pending states set `disabled:cursor-not-allowed` or `cursor-progress`.
- [ ] `index.ts` exports the component and its public types.
- [ ] `npm run type-check` and `npx eslint <folder>` pass.
