# Domain Glossary

> Shared vocabulary for the application domain.

## How to Use This File

Define domain terms to ensure consistent language across code, docs, and UI.

---

## Terms

### User

A person with an account in the system.

**Attributes**: email, name, role
**Related**: Session, Profile

### Session

An authenticated user session.

**Attributes**: token, expires_at, last_seen_at
**Related**: User

---

## Template

Use this format for new terms:

```markdown
### TermName

Brief definition (1-2 sentences).

**Attributes**: key properties
**Related**: linked terms
**Code**: `MyApp.Domain.Term`
```

---

## Guidelines

1. **One definition per term** - Avoid ambiguity
2. **Use in code** - Name resources/types after glossary terms
3. **Use in UI** - Labels should match glossary
4. **Keep updated** - Add terms as domain evolves

