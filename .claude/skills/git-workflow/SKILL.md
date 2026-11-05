---
name: git-workflow
description: >
  Use this skill whenever the user asks about git commits, branching, pull requests, or any git workflow task.
  Triggers include: "create a branch", "commit this", "what should my commit message be", "how do I push",
  "open a PR", "merge", "git workflow", or any mention of git operations. Always enforce: pull before commit,
  no local merges, PRs only for merging. Use this even for quick one-liner git questions.
---

# Git Workflow Skill

Enforce these rules on every git interaction, no exceptions.

---

## Rules (Always Apply)

1. **Only act when asked**: commit, push, create branches or open PRs only when the user asks for that action. Other skills never trigger a commit on their own.
2. **Pull before committing**: if the branch exists on `origin`, `git pull origin <branch>` before committing.
3. **No local merges**: never run `git merge`. Merging happens only via Pull Request.
4. **Branch from `main`**: never commit directly to `main`.
5. **Stage files by name**: `git add <file> <file>`, never `git add .` or `git add -A`. Check `git status` first so untracked or unrelated files aren't swept in.
6. **Don't bypass hooks**: the husky pre-commit runs `npx lint-staged` and `npm run type-check`. If it fails, fix the cause; never use `--no-verify`.
7. **One PR per feature/fix**: keep PRs small and focused. For the PR description, use the `pr` skill.

---

## Branch Naming Convention

```
<type>/<short-description>
```

| Type        | When to use                          |
| ----------- | ------------------------------------ |
| `feat/`     | New feature                          |
| `fix/`      | Bug fix                              |
| `chore/`    | Config, deps, tooling                |
| `docs/`     | Documentation only                   |
| `refactor/` | Code restructure, no behavior change |
| `test/`     | Adding or fixing tests               |
| `hotfix/`   | Urgent production fix                |

**Examples (from this repo):**

```
feat/cart-management
feat/auth-and-restructure
chore/add-agent-skills
fix/cart-quantity-zero
```

---

## Commit Message Convention (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**

| Type       | When to use             |
| ---------- | ----------------------- |
| `feat`     | New feature             |
| `fix`      | Bug fix                 |
| `chore`    | Tooling, config, deps   |
| `docs`     | Docs only               |
| `refactor` | No behavior change      |
| `style`    | Formatting, whitespace  |
| `test`     | Tests                   |
| `perf`     | Performance improvement |
| `revert`   | Reverting a commit      |

**Rules:**

- Subject line: lowercase, no period, max 72 chars
- Use imperative mood: "add", not "added" or "adds"
- Scope is optional but recommended (module name: `cart`, `auth`, `db`, `core`, ...)

**Examples (from this repo):**

```
feat(cart): implement server actions for cart management
feat(core): setup NextAuth and restructure to src directory
docs(db): add DATABASE_SCHEMA.md and enforce sync rule
fix(cart): remove item when quantity is set to zero
```

---

## Workflow (Step by Step)

### Starting new work

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### Committing

```bash
git status                                   # review what changed
git pull origin <current-branch>             # only if the branch already exists on origin
git add src/actions/cart.ts README.md        # stage named files only
git commit -m "feat(scope): description"     # husky runs lint-staged + type-check
```

### Pushing (only when the user asks)

```bash
git push -u origin feat/your-feature-name    # first push of a new branch
git push                                     # later pushes
```

### Merging: via PR only

- Push your branch
- Open a PR against `main` (`.github/PULL_REQUEST_TEMPLATE.md` applies)
- Get review/approval
- Merge via the GitHub UI
- **Never run `git merge` locally**

Merging to `main` deploys to Cloudflare (`.github/workflows/deploy.yml`).

---

## What NOT to Do

| ❌ Don't                        | ✅ Do instead                       |
| ------------------------------- | ----------------------------------- |
| `git merge feat/x` into `main`  | Open a PR                           |
| Commit directly to `main`       | Create a branch                     |
| Commit without pulling          | `git pull` first (if branch exists) |
| `git add .` / `git add -A`      | Stage named files                   |
| `git commit --no-verify`        | Fix the lint/type error             |
| Vague messages like `fix stuff` | `fix(cart): ...`                    |
| Long-lived branches             | Keep PRs small, merge often         |
