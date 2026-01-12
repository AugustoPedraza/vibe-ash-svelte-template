# Forms Pattern

> Svelte-only forms with instant validation and LiveView submission.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| Basic form | [#basic-form](#basic-form) | 2 min |
| Validation | [#client-validation](#client-validation) | 3 min |
| Server errors | [#server-errors](#server-errors) | 2 min |
| Multi-step forms | [#multi-step](#multi-step-forms) | 3 min |

---

## Core Principle

> **All forms are pure Svelte. No `phx-change` on inputs.**

This avoids round-trip latency on every keystroke.

---

## Basic Form

```svelte
<script lang="ts">
  import { FormField, Input, Button } from '$lib/components/ui';

  let { live } = $props();

  let name = $state('');
  let email = $state('');
  let loading = $state(false);
  let errors = $state<Record<string, string>>({});

  async function handleSubmit() {
    if (!validate()) return;

    loading = true;
    try {
      await live?.pushEventAsync('create', { name, email });
    } catch (e) {
      // Handle error
    } finally {
      loading = false;
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Required';
    if (!email.includes('@')) newErrors.email = 'Check your email';

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <FormField label="Name" error={errors.name} required>
    <Input bind:value={name} invalid={!!errors.name} />
  </FormField>

  <FormField label="Email" error={errors.email} required>
    <Input type="email" bind:value={email} invalid={!!errors.email} />
  </FormField>

  <Button type="submit" variant="primary" {loading}>
    Submit
  </Button>
</form>
```

---

## Client Validation

### Validate on Blur

```svelte
<script lang="ts">
  let email = $state('');
  let errors = $state<Record<string, string>>({});

  const emailValid = $derived(
    email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  function validateOnBlur(field: string) {
    if (field === 'email' && email && !emailValid) {
      errors = { ...errors, email: 'Check your email address' };
    } else {
      const { [field]: _, ...rest } = errors;
      errors = rest;
    }
  }
</script>

<Input
  type="email"
  bind:value={email}
  onblur={() => validateOnBlur('email')}
  invalid={!!errors.email}
/>
```

### Validation Rules

| Field Type | Rule | Message |
|------------|------|---------|
| Email | Contains @ and domain | "Check your email" |
| Password | 6+ characters | "Use 6 or more characters" |
| Required | Not empty | "Required" |
| Phone | Valid format | "Check your phone number" |

---

## Server Errors

### Receiving Errors from LiveView

```elixir
# In LiveView
def handle_event("create", params, socket) do
  case MyApp.create(params) do
    {:ok, _} ->
      {:noreply, push_navigate(socket, to: ~p"/success")}

    {:error, %Ash.Error.Invalid{} = error} ->
      field_errors = format_ash_errors(error)
      {:noreply, push_event(socket, "form:errors", %{errors: field_errors})}
  end
end
```

### Handling in Svelte

```svelte
<script lang="ts">
  let { live } = $props();
  let errors = $state<Record<string, string>>({});

  $effect(() => {
    if (live) {
      live.handleEvent('form:errors', (data) => {
        errors = data.errors;
      });
    }
  });
</script>
```

---

## Multi-Step Forms

```svelte
<script lang="ts">
  let step = $state(1);
  let formData = $state({
    name: '',
    email: '',
    address: '',
    payment: ''
  });

  function nextStep() {
    if (validateStep(step)) {
      step++;
    }
  }

  function prevStep() {
    step--;
  }

  function validateStep(s: number): boolean {
    // Validate fields for current step
    return true;
  }
</script>

{#if step === 1}
  <Step1 bind:name={formData.name} bind:email={formData.email} />
{:else if step === 2}
  <Step2 bind:address={formData.address} />
{:else if step === 3}
  <Step3 bind:payment={formData.payment} />
{/if}

<div class="flex justify-between">
  {#if step > 1}
    <Button variant="secondary" onclick={prevStep}>Back</Button>
  {/if}

  {#if step < 3}
    <Button variant="primary" onclick={nextStep}>Continue</Button>
  {:else}
    <Button variant="primary" onclick={handleSubmit}>Submit</Button>
  {/if}
</div>
```

---

## Form Preservation (PWA)

Save form state to handle page refresh or offline:

```svelte
<script lang="ts">
  const STORAGE_KEY = 'form_draft';

  let formData = $state({
    name: '',
    email: ''
  });

  // Restore on mount
  $effect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      formData = JSON.parse(saved);
    }
  });

  // Save on change
  $effect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  });

  // Clear on successful submit
  function handleSuccess() {
    localStorage.removeItem(STORAGE_KEY);
  }
</script>
```

---

## UX Guidelines

| Do | Don't |
|----|-------|
| Single column layout | Multi-column forms |
| Labels above inputs | Floating labels |
| Validate on blur | Validate on every keystroke |
| Show errors inline | Show errors in modals |
| Mark required with * | Mark optional fields |

---

## Related Docs

- [frontend-svelte.md](../_guides/frontend-svelte.md) - Component patterns
- [errors.md](./errors.md) - Error handling

