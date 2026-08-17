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

1. **Pull before committing** — always `git pull origin <branch>` before staging/committing.
2. **No local merges** — never run `git merge`. Merging happens only via Pull Request.
3. **Branch from `main` (or `dev`)** — never commit directly to `main` or `dev`.
4. **One PR per feature/fix** — keep PRs small and focused.

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

**Examples:**

```
feat/competitor-analysis-panel
fix/rtk-auth-slice-reset
chore/update-tailwind-config
refactor/dashboard-layout-cleanup
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
- Scope is optional but recommended (component/module name)

**Examples:**

```
feat(competitor-panel): add real-time competitor tracking
fix(auth): resolve token expiry on page refresh
chore(deps): upgrade shadcn to latest
refactor(dashboard): extract layout into separate component
docs(readme): add setup instructions for rivalyze
style(sidebar): fix inconsistent padding across breakpoints
```

---

## Workflow (Step by Step)

### Starting new work

```bash
git checkout main           # or dev
git pull origin main        # always pull first
git checkout -b feat/your-feature-name
```

### Before committing

```bash
git pull origin <current-branch>   # pull latest on your own branch too
git add .                          # or specific files
git commit -m "feat(scope): description"
git push origin feat/your-feature-name
```

### Merging — via PR only

- Push your branch
- Open a PR against `main` (or `dev`)
- Get review/approval
- Merge via GitHub/GitLab UI
- **Never run `git merge` locally**

---

## What NOT to Do

| ❌ Don't                        | ✅ Do instead                     |
| ------------------------------- | --------------------------------- |
| `git merge feat/x into main`    | Open a PR                         |
| Commit directly to `main`       | Create a branch                   |
| Commit without pulling          | `git pull` first                  |
| Vague messages like `fix stuff` | `fix(auth): resolve token expiry` |
| Long-lived branches             | Keep PRs small, merge often       |
