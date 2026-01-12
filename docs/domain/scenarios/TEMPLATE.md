# Scenario: Scenario Name

> Brief description of the user journey.

## Context

What situation is the user in?

---

## Actors

- **Primary**: User type performing the action
- **Secondary**: Other users affected

---

## Preconditions

- User is authenticated
- Required data exists

---

## Flow

### Main Success Scenario

1. User initiates action
2. System processes request
3. User sees result

### Alternative Flows

**2a. Validation fails:**
1. System shows error
2. User corrects input
3. Continue from step 2

**3a. Network error:**
1. Action queued offline
2. Syncs when connected

---

## Postconditions

- State after successful completion
- Notifications sent
- Data updated

---

## UI Mockup Reference

Link to design or describe key screens.

---

## Test Cases

| # | Input | Expected Output |
|---|-------|-----------------|
| 1 | Valid data | Success |
| 2 | Invalid data | Error message |
| 3 | Offline | Queued for sync |

