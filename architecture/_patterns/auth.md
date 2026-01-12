# Authentication Pattern

> Session-based auth with progressive enhancement.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| Session setup | [#session-management](#session-management) | 3 min |
| Auth plugs | [#auth-plugs](#auth-plugs) | 2 min |
| LiveView gates | [#liveview-auth-gates](#liveview-auth-gates) | 2 min |
| Password handling | [#password-handling](#password-handling) | 2 min |
| Login flow | [#login-flow](#login-flow) | 3 min |

---

## Session Management

### Strategy: Database Sessions

```elixir
# Why database sessions over Phoenix.Token?
# - Can invalidate sessions server-side (logout all devices)
# - Can track session metadata (device, IP, last seen)
# - Works with "remember me" naturally
# - Survives server restarts

defmodule MyApp.Accounts.Session do
  use Ash.Resource,
    domain: MyApp.Accounts,
    data_layer: AshPostgres.DataLayer

  attributes do
    uuid_primary_key :id
    attribute :token, :string, allow_nil?: false
    attribute :user_agent, :string
    attribute :ip_address, :string
    attribute :last_seen_at, :utc_datetime
    attribute :expires_at, :utc_datetime

    timestamps()
  end

  relationships do
    belongs_to :user, MyApp.Accounts.User, allow_nil?: false
  end

  actions do
    create :create do
      change set_attribute(:token, &generate_token/0)
      change set_attribute(:expires_at, &default_expiry/0)
    end

    read :get_by_token do
      argument :token, :string, allow_nil?: false
      filter expr(token == ^arg(:token) and expires_at > now())
    end

    update :touch do
      change set_attribute(:last_seen_at, &DateTime.utc_now/0)
    end

    destroy :logout
  end

  defp generate_token, do: :crypto.strong_rand_bytes(32) |> Base.url_encode64()
  defp default_expiry, do: DateTime.add(DateTime.utc_now(), 30, :day)
end
```

### Cookie Configuration

```elixir
# config/config.exs
config :my_app, MyAppWeb.Endpoint,
  session_cookie: [
    key: "_my_app_key",
    signing_salt: "your_signing_salt",
    same_site: "Lax",        # CSRF protection
    secure: true,             # HTTPS only in prod
    http_only: true,          # No JS access
    max_age: 60 * 60 * 24 * 30  # 30 days
  ]
```

---

## Auth Plugs

### fetch_current_user

```elixir
defmodule MyAppWeb.Plugs.FetchCurrentUser do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    session_token = get_session(conn, :session_token)

    user =
      if session_token do
        case MyApp.Accounts.get_user_by_session_token(session_token) do
          {:ok, user} -> user
          _ -> nil
        end
      end

    assign(conn, :current_user, user)
  end
end
```

### require_authenticated_user

```elixir
defmodule MyAppWeb.Plugs.RequireAuth do
  import Plug.Conn
  import Phoenix.Controller

  def init(opts), do: opts

  def call(conn, _opts) do
    if conn.assigns[:current_user] do
      conn
    else
      conn
      |> put_flash(:error, "Please sign in to continue")
      |> redirect(to: ~p"/login")
      |> halt()
    end
  end
end
```

---

## LiveView Auth Gates

### on_mount Hooks

```elixir
defmodule MyAppWeb.AuthHooks do
  import Phoenix.LiveView
  import Phoenix.Component

  def on_mount(:ensure_authenticated, _params, session, socket) do
    socket = assign_current_user(socket, session)

    if socket.assigns.current_user do
      {:cont, socket}
    else
      {:halt, redirect(socket, to: ~p"/login")}
    end
  end

  def on_mount(:redirect_if_authenticated, _params, session, socket) do
    socket = assign_current_user(socket, session)

    if socket.assigns.current_user do
      {:halt, redirect(socket, to: ~p"/dashboard")}
    else
      {:cont, socket}
    end
  end

  defp assign_current_user(socket, session) do
    case session["session_token"] do
      nil ->
        assign(socket, :current_user, nil)

      token ->
        case MyApp.Accounts.get_user_by_session_token(token) do
          {:ok, user} -> assign(socket, :current_user, user)
          _ -> assign(socket, :current_user, nil)
        end
    end
  end
end
```

### Protected Routes

```elixir
# router.ex
live_session :authenticated,
  on_mount: [{MyAppWeb.AuthHooks, :ensure_authenticated}] do

  live "/dashboard", DashboardLive
  live "/settings", SettingsLive
end

live_session :unauthenticated,
  on_mount: [{MyAppWeb.AuthHooks, :redirect_if_authenticated}] do

  live "/login", Auth.LoginLive
end
```

---

## Password Handling

### Hashing (bcrypt)

```elixir
defmodule MyApp.Accounts.Password do
  @hash_rounds 12

  def hash(password) when is_binary(password) do
    Bcrypt.hash_pwd_salt(password, log_rounds: @hash_rounds)
  end

  def verify(password, hashed) when is_binary(password) and is_binary(hashed) do
    Bcrypt.verify_pass(password, hashed)
  end

  # Always run verification to prevent timing attacks
  def verify(_, _) do
    Bcrypt.no_user_verify()
    false
  end
end
```

### User Resource

```elixir
defmodule MyApp.Accounts.User do
  use Ash.Resource,
    domain: MyApp.Accounts,
    data_layer: AshPostgres.DataLayer

  attributes do
    uuid_primary_key :id
    attribute :email, :ci_string, allow_nil?: false
    attribute :hashed_password, :string, allow_nil?: false, sensitive?: true

    timestamps()
  end

  identities do
    identity :unique_email, [:email]
  end

  actions do
    create :register do
      accept [:email]
      argument :password, :string, allow_nil?: false, sensitive?: true

      change fn changeset, _ ->
        password = Ash.Changeset.get_argument(changeset, :password)
        hashed = MyApp.Accounts.Password.hash(password)
        Ash.Changeset.force_change_attribute(changeset, :hashed_password, hashed)
      end
    end
  end
end
```

---

## Login Flow

### Domain API

```elixir
defmodule MyApp.Accounts do
  use Ash.Domain

  def authenticate(email, password) do
    with {:ok, user} <- get_user_by_email(email),
         true <- Password.verify(password, user.hashed_password) do
      {:ok, user}
    else
      {:error, %Ash.Error.Query.NotFound{}} ->
        Password.verify("dummy", "$2b$12$dummy")
        {:error, :invalid_credentials}

      false ->
        {:error, :invalid_credentials}
    end
  end

  def create_session(user, metadata \\ %{}) do
    Session
    |> Ash.Changeset.for_create(:create, %{
      user_id: user.id,
      user_agent: metadata[:user_agent],
      ip_address: metadata[:ip_address]
    })
    |> Ash.create()
  end
end
```

### LoginLive

```elixir
defmodule MyAppWeb.Auth.LoginLive do
  use MyAppWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok, assign(socket, loading: false, error: nil)}
  end

  def render(assigns) do
    ~H"""
    <.svelte
      name="LoginForm"
      props={%{loading: @loading, error: @error}}
      socket={@socket}
    />
    """
  end

  def handle_event("login", %{"email" => email, "password" => password}, socket) do
    case MyApp.Accounts.authenticate(email, password) do
      {:ok, user} ->
        {:ok, session} = MyApp.Accounts.create_session(user)

        socket
        |> put_session(:session_token, session.token)
        |> push_navigate(to: ~p"/dashboard")
        |> then(&{:noreply, &1})

      {:error, :invalid_credentials} ->
        {:noreply, assign(socket, error: "Wrong email or password")}
    end
  end
end
```

---

## Svelte Logout

```svelte
<script>
  function handleLogout() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout';

    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_csrf_token';
    csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.content || '';
    form.appendChild(csrfInput);

    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'DELETE';
    form.appendChild(methodInput);

    document.body.appendChild(form);
    form.submit();
  }
</script>

<Button variant="ghost" onclick={handleLogout}>Sign out</Button>
```

---

## Security Checklist

- [ ] Passwords hashed with bcrypt (cost factor 12+)
- [ ] Session tokens are cryptographically random (32+ bytes)
- [ ] Cookies are HttpOnly, Secure, SameSite=Lax
- [ ] Timing attack protection on login
- [ ] Session invalidation on logout
- [ ] CSRF protection on logout form

---

## Related Docs

- [backend-ash.md](../_guides/backend-ash.md) - Ash resources
- [errors.md](./errors.md) - Error handling

