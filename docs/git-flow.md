# Git Flow

## Branch Strategy

```
main    ────────────────── production releases
         ↖ release/v1.0 ↗
        /
develop ─────────────────── integration branch
         ↖ feature/xxx ↗ ↖ feature/yyy ↗
```

## Branch Types

| Branch | Pattern | Purpose | Merges Into |
|--------|---------|---------|-------------|
| Feature | `feature/<ticket>-<description>` | New functionality | develop |
| Bugfix | `bugfix/<ticket>-<description>` | Bug fixes | develop |
| Hotfix | `hotfix/<ticket>-<description>` | Production fixes | main + develop |
| Release | `release/v<major>.<minor>` | Release preparation | main |

## Workflow

### 1. Start a Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/XXX-123-add-journal-api
```

### 2. Commit Changes

```bash
git add .
git commit -m "feat(journal): add journal CRUD endpoints"
```

Commit message format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 3. Keep Updated

```bash
git fetch origin
git rebase origin/develop
```

### 4. Push & Create PR

```bash
git push -u origin feature/XXX-123-add-journal-api
```

Create PR → `develop` ← `feature/XXX-123-add-journal-api`

### 5. After Merge

```bash
git checkout develop
git pull origin develop
```

## Naming Conventions

- Branch names: `kebab-case`
- Tickets: Use issue tracker IDs (e.g., `feature/S01-01-backend-setup`)
- Description: Short, lowercase, hyphenated

## Protected Branches

- `main` — requires PR, no direct pushes
- `develop` — requires PR, no direct pushes

## Pull Request Checklist

- [ ] Tests pass
- [ ] TypeScript compiles
- [ ] No merge conflicts
- [ ] PR description links to ticket
- [ ] At least 1 reviewer (for team projects)
