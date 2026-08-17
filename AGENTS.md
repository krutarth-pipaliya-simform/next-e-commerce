<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project specific Agent Rules

When working on this project (whether you are Claude Code, Cursor, Antigravity, or Copilot), strictly adhere to the following:

1. **Git Workflow**: Review `.gemini/skills/git-workflow/SKILL.md` BEFORE making any commits, branches, or PRs. You must use conventional commits and follow the branching strategy.
2. **Project Plan**: Review `ecommerce_plan.md` and `development_guide.md` to understand the architecture, design choices, and features currently being built.

## Project Commands

- **Dev Server**: `npm run dev`
- **Type Check**: `npm run type-check` (Must pass before committing)
- **Format & Lint**: `npx lint-staged` or `npx prettier --write "app/**/*.{ts,tsx}"`
- **Deploy**: `npm run deploy` (Deploys to Cloudflare Workers via OpenNext)
