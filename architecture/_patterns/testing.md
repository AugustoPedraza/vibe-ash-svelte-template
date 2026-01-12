# Testing Pattern

> Test pyramid: Unit (fast, many) -> Integration (medium) -> E2E (slow, few).

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| Test pyramid | [#test-pyramid](#test-pyramid) | 1 min |
| Ash resource tests | [#ash-resource-tests](#ash-resource-tests) | 3 min |
| LiveView tests | [#liveview-tests](#liveview-tests) | 3 min |
| Component tests | [#component-tests](#component-tests) | 3 min |
| E2E tests | [#e2e-tests](#e2e-tests) | 5 min |

---

## Test Pyramid

```
                    +----------+
                   /   E2E      \         Few, critical paths only
                  / (Playwright) \
                 +----------------+
                /  Integration     \       LiveView flows
               / (LiveView tests)   \
              +----------------------+
             /        Unit            \    Ash resources, Svelte components
            /   (ExUnit + Vitest)      \
           +----------------------------+
```

| Layer | Tools | Scope | Speed |
|-------|-------|-------|-------|
| Unit | ExUnit, Vitest | Resources, Components | Fast |
| Integration | Phoenix.LiveViewTest | LiveView flows | Medium |
| E2E | Playwright | Critical user journeys | Slow |

---

## Test Organization

```
test/
├── my_app/                      # Domain unit tests
│   ├── accounts/
│   │   └── user_test.exs
│   └── {domain}/
│       └── {resource}_test.exs
│
├── my_app_web/                  # Web layer tests
│   └── live/
│       └── {feature}_live_test.exs
│
└── support/
    ├── conn_case.ex
    ├── data_case.ex
    └── fixtures/

assets/tests/
├── unit/
│   └── components/
│       ├── ui/
│       │   └── Button.test.ts
│       └── features/
│
└── e2e/
    └── auth.spec.ts
```

---

## Ash Resource Tests

```elixir
defmodule MyApp.Accounts.UserTest do
  use MyApp.DataCase

  alias MyApp.Accounts.User

  describe "register action" do
    test "creates user with valid data" do
      assert {:ok, user} =
        User
        |> Ash.Changeset.for_create(:register, %{
          email: "test@example.com",
          password: "password123"
        })
        |> Ash.create()

      assert user.email == "test@example.com"
      assert user.hashed_password != "password123"
    end

    test "fails with duplicate email" do
      user_fixture(email: "test@example.com")

      assert {:error, %Ash.Error.Invalid{}} =
        User
        |> Ash.Changeset.for_create(:register, %{
          email: "test@example.com",
          password: "password123"
        })
        |> Ash.create()
    end
  end
end
```

---

## LiveView Tests

```elixir
defmodule MyAppWeb.Auth.LoginLiveTest do
  use MyAppWeb.ConnCase, async: true

  import Phoenix.LiveViewTest

  describe "login page" do
    test "renders login form", %{conn: conn} do
      {:ok, _view, html} = live(conn, ~p"/login")

      assert html =~ "Sign in"
      assert html =~ "Email"
    end

    test "redirects on successful login", %{conn: conn} do
      user_fixture(email: "test@example.com", password: "password123")

      {:ok, view, _html} = live(conn, ~p"/login")

      view
      |> element("#login-form")
      |> render_submit(%{email: "test@example.com", password: "password123"})

      assert_redirect(view, ~p"/dashboard")
    end
  end
end
```

---

## Test Fixtures

```elixir
defmodule MyApp.AccountsFixtures do
  def unique_user_email, do: "user#{System.unique_integer()}@example.com"

  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        email: unique_user_email(),
        password: "password123"
      })
      |> then(fn attrs ->
        MyApp.Accounts.User
        |> Ash.Changeset.for_create(:register, attrs)
        |> Ash.create()
      end)

    user
  end
end
```

---

## Component Tests

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '$lib': './svelte/lib'
    }
  }
});
```

### Component Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LoginForm from '$components/features/auth/LoginForm.svelte';

describe('LoginForm', () => {
  const mockLive = { pushEvent: vi.fn() };

  it('renders form elements', () => {
    render(LoginForm, { props: { live: mockLive } });

    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('calls pushEvent on submit', async () => {
    render(LoginForm, { props: { live: mockLive } });

    await fireEvent.input(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    await fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockLive.pushEvent).toHaveBeenCalled();
  });
});
```

---

## E2E Tests

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: 'mix phx.server',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    cwd: '..',
  },
});
```

### Auth Fixture

```typescript
// tests/e2e/fixtures/auth.ts
import { test as base } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### E2E Test

```typescript
import { test, expect } from './fixtures/auth';

test.describe('Authentication', () => {
  test('user can log in', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('user can log out', async ({ authenticatedPage: page }) => {
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/login');
  });
});
```

---

## When to Write E2E Tests

| Write E2E For | Skip E2E For |
|---------------|--------------|
| Login/logout flow | Form validation |
| Critical business flows | UI state changes |
| Cross-page navigation | Individual components |
| Real-time features | API responses |

---

## AI-Assisted Testing Workflow

### Bug Fixing (Error-Driven)

```
"I have this error:

[PASTE ERROR]

1. Write a test that reproduces this
2. Fix the code
3. Verify test passes"
```

### New Features (TDD)

```
"Implement [FEATURE] using TDD:

1. Write a test describing expected behavior
2. Implement minimum code to pass
3. Refactor if needed"
```

---

## Checklist

**Before PR:**
- [ ] All new code has tests
- [ ] Tests follow Given/When/Then pattern
- [ ] No `skip` or `only` left in tests
- [ ] `just check` passes

**Test Quality:**
- [ ] Tests are isolated (no shared state)
- [ ] Fast tests run first
- [ ] Mocks are used sparingly

---

## Related Docs

- [backend-ash.md](../_guides/backend-ash.md) - Ash patterns
- [frontend-svelte.md](../_guides/frontend-svelte.md) - Component patterns

