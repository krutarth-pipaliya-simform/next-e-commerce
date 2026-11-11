# Third-party skills

Skills in `skills/` that were copied from other repositories, with their source commit and license. Skills not listed here (`create-component`, `git-workflow`, `scaffold-api`, `server-action`) belong to this project.

## Vendored skills from mattpocock/skills

Source: https://github.com/mattpocock/skills at commit `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` (2026-10-31).

Skills: tdd, diagnosing-bugs, code-review, pr, codebase-design, domain-modeling, grilling, grill-with-docs, improve-codebase-architecture, prototype, research, writing-for-agents.

Copied unmodified except that the Codex-only `agents/openai.yaml` files were removed.

```
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Vendored skills from vercel-labs/agent-skills

Source: https://github.com/vercel-labs/agent-skills at commit `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` (2026-10-27).

Skills (copied unmodified; each directory is named after the skill's `name`):

- `vercel-react-best-practices` (from `skills/react-best-practices`)
- `vercel-composition-patterns` (from `skills/composition-patterns`)
- `web-design-guidelines` (from `skills/web-design-guidelines`). **Modified:** "check accessibility" was removed from its `description` so it does not compete with the `accessibility` skill.

License: MIT, as declared in the source repository's README and in each skill's frontmatter. The repository ships no separate LICENSE file.

## Vendored accessibility skill

`accessibility`: from https://github.com/addyosmani/web-quality-skills (`skills/accessibility`) at commit `afa8da942115f2961fdbfa80807ea0b232ff6c00`. Copied unmodified; MIT licensed.

## Vendored skills from everything-claude-code (ECC)

Source: https://github.com/affaan-m/everything-claude-code (now `affaan-m/ECC`) at commit `b38be6a7f6350964d59328b52f0624e1d1d552d1`.
MIT License, Copyright (c) 2026 Affaan Mustafa.

Skills (copied unmodified): `prisma-patterns`, `database-migrations`. (`nextjs-turbopack` was removed: its "`proxy.ts` at the project root" advice is wrong for a `src/` app, and OpenNext Cloudflare does not support Node.js proxy.)
