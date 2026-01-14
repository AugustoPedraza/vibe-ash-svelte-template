# Environment Variables Guide

> Unified system for managing environment variables across development, CI/CD, and production.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENV MANAGEMENT LAYERS                         │
│                                                                   │
│  .env.example          docs/ENVIRONMENT.md      PR Template      │
│  ┌─────────────┐      ┌─────────────────┐      ┌─────────────┐  │
│  │ Source of   │      │ Detailed docs   │      │ Change      │  │
│  │ Truth       │─────▶│ per variable    │─────▶│ Tracking    │  │
│  └─────────────┘      └─────────────────┘      └─────────────┘  │
│         │                     │                       │          │
│         ▼                     ▼                       ▼          │
│  ┌─────────────┐      ┌─────────────────┐      ┌─────────────┐  │
│  │ Developer   │      │ CI/CD           │      │ Code        │  │
│  │ Setup       │      │ Secrets         │      │ Review      │  │
│  └─────────────┘      └─────────────────┘      └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Responsibilities

| File | Purpose | Audience |
|------|---------|----------|
| `.env.example` | Copy-paste template, all vars listed | Developers |
| `docs/ENVIRONMENT.md` | Detailed docs, where to get values | Developers + Ops |
| PR template checklist | Forces documentation on changes | Reviewers |
| CI validation (optional) | Automated sync check | Automation |

---

## .env.example Pattern

**Location:** Project root

**Purpose:** Single source of truth for all environment variables

### Structure

```bash
# =============================================================================
# REQUIRED - Application will not start without these
# =============================================================================

# Database connection (PostgreSQL)
# Format: postgres://user:password@host:port/database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/myapp_dev

# Phoenix session encryption (generate with: mix phx.gen.secret)
SECRET_KEY_BASE=your-secret-key-here-generate-with-mix-phx-gen-secret

# Application host (your domain in production)
PHX_HOST=localhost

# =============================================================================
# OPTIONAL - Defaults provided, override as needed
# =============================================================================

# HTTP port (default: 4000)
PORT=4000

# Database connection pool size (default: 10)
POOL_SIZE=10

# Enable IPv6 for database connection (default: false)
# ECTO_IPV6=true

# =============================================================================
# SERVICES - Third-party integrations
# =============================================================================

# Sentry error tracking (optional, recommended for staging/prod)
# Get from: https://sentry.io/settings/projects/{project}/keys/
# SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456

# Email provider (configure when email features added)
# MAILGUN_API_KEY=key-xxx
# MAILGUN_DOMAIN=mg.yourdomain.com

# =============================================================================
# DEVELOPMENT ONLY - Do not set in production
# =============================================================================

# Override default postgres port (useful for Docker conflicts)
# POSTGRES_PORT=5433

# =============================================================================
# CI/CD ONLY - Set automatically by CI systems
# =============================================================================

# CI environment flag (set by GitHub Actions, etc.)
# CI=true

# Test partitioning for parallel tests
# MIX_TEST_PARTITION=1
```

### Rules

1. **Group by requirement level** - Required, Optional, Services, Dev-only, CI-only
2. **Include comments** - Explain purpose and where to get values
3. **Show format** - Example values that illustrate the expected format
4. **Never commit secrets** - Use placeholder values only
5. **Keep sorted** - Within each group, alphabetical

---

## docs/ENVIRONMENT.md Pattern

**Location:** `docs/ENVIRONMENT.md`

**Purpose:** Detailed documentation for each variable

### Structure

```markdown
# Environment Variables

> Complete reference for all environment variables used in this project.

## Quick Start (Development)

\`\`\`bash
cp .env.example .env
# Edit .env with your values
\`\`\`

## Required Variables

### DATABASE_URL

| Property | Value |
|----------|-------|
| Required | Yes (production) |
| Default | None |
| Format | `postgres://user:password@host:port/database` |

**Description:** PostgreSQL connection string.

**Development:** Use local postgres or Docker:
\`\`\`bash
# Local postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/myapp_dev

# Docker (if using docker-compose)
DATABASE_URL=postgres://postgres:postgres@db:5432/myapp_dev
\`\`\`

**Production:** Set in deployment secrets (Fly.io, Railway, etc.)

---

### SECRET_KEY_BASE

| Property | Value |
|----------|-------|
| Required | Yes |
| Default | None |
| Format | 64+ character string |

**Description:** Used to sign/encrypt cookies and sessions.

**Generate:**
\`\`\`bash
mix phx.gen.secret
\`\`\`

**Production:** Generate unique value, store in deployment secrets.

---

## Optional Variables

### SENTRY_DSN

| Property | Value |
|----------|-------|
| Required | No (recommended for staging/prod) |
| Default | None (Sentry disabled) |
| Format | `https://xxx@o123.ingest.sentry.io/456` |

**Description:** Sentry error tracking DSN.

**Get from:** Sentry Dashboard → Settings → Projects → {project} → Client Keys

**Environments:** Only set for staging and production.

---

## Environment Matrix

| Variable | Development | Test | Staging | Production |
|----------|-------------|------|---------|------------|
| DATABASE_URL | Local | CI provides | Required | Required |
| SECRET_KEY_BASE | Any value | Any value | Required | Required |
| PHX_HOST | localhost | localhost | Required | Required |
| SENTRY_DSN | Optional | Skip | Required | Required |
| PORT | 4000 | 4002 | Auto | Auto |

---

## Adding New Variables

When adding a new environment variable:

1. Add to `.env.example` with comment
2. Add to this doc with full details
3. Add to Environment Matrix above
4. Update PR checklist (ENV section)
5. Notify team in PR description
```

---

## PR Template Checklist

Add to `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Environment Variables

> Fill out if this PR adds, removes, or modifies environment variables.

- [ ] No ENV changes in this PR

**If ENV changes:**
- [ ] `.env.example` updated
- [ ] `docs/ENVIRONMENT.md` updated
- [ ] Environment Matrix updated
- [ ] Team notified (tag in PR description)
- [ ] CI/CD secrets updated (if applicable)
- [ ] Deployment docs updated (if applicable)
```

---

## Developer Role Checklist

Add to developer role file:

```markdown
## Environment Variables Checklist

When adding/modifying features that use ENV vars:

- [ ] Check if new ENV var is needed
- [ ] Use `System.get_env/2` with default where appropriate
- [ ] Add to `.env.example` with documentation
- [ ] Add to `docs/ENVIRONMENT.md`
- [ ] PR description mentions ENV changes
- [ ] Notify ops/devops if production secret needed
```

---

## Best Practices

### Naming

| Pattern | Example | Use For |
|---------|---------|---------|
| `SERVICE_KEY` | `SENTRY_DSN` | Third-party service credentials |
| `FEATURE_SETTING` | `POOL_SIZE` | Configurable settings |
| `APP_MODE` | `PHX_SERVER` | Application behavior flags |

### Defaults

```elixir
# GOOD: Sensible default for optional config
pool_size = String.to_integer(System.get_env("POOL_SIZE", "10"))

# GOOD: Explicit error for required config
database_url = System.get_env("DATABASE_URL") ||
  raise "DATABASE_URL environment variable is missing"

# BAD: Silent nil for required config
database_url = System.get_env("DATABASE_URL")  # nil in prod = crash later
```

### Security

| DO | DON'T |
|----|-------|
| Use placeholder values in `.env.example` | Commit real secrets |
| Document where to get credentials | Share secrets in Slack/email |
| Rotate secrets after exposure | Reuse secrets across environments |
| Use secret managers in prod | Store prod secrets in `.env` |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  SECRET_KEY_BASE: ${{ secrets.SECRET_KEY_BASE }}
  SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

### Fly.io Example

```bash
# Set secrets
fly secrets set DATABASE_URL="postgres://..." SECRET_KEY_BASE="..."

# List secrets (names only)
fly secrets list
```

---

## Validation (Optional)

### CI Job to Check Sync

```yaml
# .github/workflows/ci.yml
env-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Check .env.example documented
      run: |
        # Extract vars from .env.example
        grep -E "^[A-Z_]+=" .env.example | cut -d= -f1 | sort > /tmp/env-vars.txt

        # Check each is documented
        while read var; do
          if ! grep -q "$var" docs/ENVIRONMENT.md; then
            echo "ERROR: $var not documented in docs/ENVIRONMENT.md"
            exit 1
          fi
        done < /tmp/env-vars.txt

        echo "All environment variables documented!"
```

---

## Implementation Checklist

When setting up ENV management for a new project:

- [ ] Create `.env.example` with all current vars
- [ ] Create `docs/ENVIRONMENT.md` with detailed docs
- [ ] Add ENV section to PR template
- [ ] Add ENV checklist to developer workflow
- [ ] Document CI/CD secret setup
- [ ] (Optional) Add CI validation job

---

## Related Docs

- [Deployment Checklist](_checklists/deployment.md) - Pre-deploy ENV verification
- [User Messaging Guide](_guides/user-messaging.md) - SENTRY_DSN setup
