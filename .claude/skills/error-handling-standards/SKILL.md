---
name: error-handling-standards
description: Team-wide error handling standards covering user-friendly messages, logging patterns, retry strategies, and error response conventions. Auto-triggers on error handling work, API error design, or logging discussions.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# MDL Error Handling Standards

**Purpose:** Error handling patterns and best practices applicable across all MDL projects

## Core Error Handling Principles

1. **User-friendly messages** — never expose technical details to users
2. **Graceful degradation** — app should never completely break
3. **Consistent patterns** — same error handling conventions across projects
4. **Actionable feedback** — tell users what they can do next
5. **Structured logging** — errors logged with context for debugging

---

## User-Friendly Error Messages

### Guidelines

**DO:**
- Explain what went wrong in simple terms
- Tell users what they can do next
- Provide support contact for persistent issues
- Use empathetic language ("We're sorry...")

**DON'T:**
- Show stack traces or technical details
- Use jargon (HTTP 500, null pointer, etc.)
- Blame the user ("You did X wrong")
- Leave users with no next action

### Standard Error Messages

```javascript
const errorMessages = {
  // Network errors
  networkError: "Unable to connect. Please check your internet connection and try again.",

  // Authentication errors
  invalidCredentials: "Email or password is incorrect. Please try again.",
  sessionExpired: "Your session has expired. Please log in again.",

  // Payment errors
  paymentFailed: "Payment could not be processed. Please check your payment details and try again.",
  cardDeclined: "Your card was declined. Please use a different payment method or contact your bank.",

  // Resource errors
  notFound: "The content you're looking for is no longer available.",
  accessDenied: "You don't have access to this content. Please check your subscription.",

  // General errors
  genericError: "Something went wrong. Please try again later or contact support if the problem persists.",
};
```

**NEVER show these to users:**
```
"Error: Cannot read property 'data' of undefined"
"HTTP 500 Internal Server Error"
"Uncaught TypeError at line 42"
"null is not an object"
"Failed to fetch"
```

---

## HTTP Status Code Handling

### Standard Response Pattern

Use consistent status codes across all MDL APIs:

| Status | Meaning | User Message |
|--------|---------|-------------|
| 400 | Invalid request | "Invalid request. Please check your input." |
| 401 | Unauthenticated | "Session expired. Please log in again." |
| 403 | Forbidden | "You do not have permission to perform this action." |
| 404 | Not found | "The requested resource was not found." |
| 409 | Conflict | "This action conflicts with existing data." |
| 429 | Rate limited | "Too many requests. Please try again later." |
| 500/502/503 | Server error | "Server error. Please try again later." |

### Frontend Pattern

```javascript
switch (status) {
  case 401:
    // Clear tokens and redirect to login
    clearSession();
    redirectToLogin();
    break;
  case 403:
    showError('You do not have permission to perform this action.');
    break;
  case 429:
    showError('Too many requests. Please try again later.');
    break;
  default:
    showError('An unexpected error occurred. Please try again.');
}
```

### Lambda Response Pattern

```javascript
// ✅ Standard Lambda error response
function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ message }),
  };
}

// Usage
if (!body.email) return errorResponse(400, 'Email is required');
if (!authorized) return errorResponse(403, 'Access denied');
```

---

## Logging Patterns

### What to Log

```javascript
// ✅ Error context for debugging
console.error('Failed to fetch data', {
  endpoint: '/api/endpoint',
  userId: user.id,
  error: error.message,
  timestamp: new Date().toISOString(),
});

// ✅ Structured logging in Lambda
console.log(JSON.stringify({
  level: 'ERROR',
  message: 'Payment processing failed',
  paymentIntentId: 'pi_xxx',
  channelId,
  errorCode: error.code,
}));
```

### What NOT to Log

```javascript
// ❌ Sensitive data
console.log('User password:', password);
console.log('Credit card:', cardNumber);
console.log('Auth token:', token);

// ❌ Entire error objects in production
console.log(error); // May contain sensitive data

// ❌ Unstructured debug logs in production
console.log('Debug info');
```

### Logging Levels

| Level | When to Use | Example |
|-------|------------|---------|
| `ERROR` | Unexpected failures requiring attention | API call failed, unhandled exception |
| `WARN` | Degraded but functioning | Retry succeeded, fallback used |
| `INFO` | Business events | User signed up, payment processed |
| `DEBUG` | Development only | Variable values, flow tracing |

---

## Async Error Handling

### Always Catch Promise Rejections

```javascript
// ✅ try-catch with async/await
async function loadData() {
  try {
    const data = await fetchData();
    return processData(data);
  } catch (error) {
    console.error('Failed to load data:', error.message);
    throw new Error('Unable to load data');
  }
}

// ❌ Unhandled rejection
async function loadData() {
  const data = await fetchData(); // Can throw!
  return processData(data);
}
```

### Event Handler Errors

```javascript
// ✅ Wrap event handlers
const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    await submitForm(data);
    onSuccess();
  } catch (error) {
    console.error('Form submission failed:', error.message);
    setError('Failed to submit. Please try again.');
  }
};
```

---

## Retry & Fallback Strategies

### Retry with Exponential Backoff

```javascript
async function fetchWithRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
}
```

### When to Retry

| Scenario | Retry? | Strategy |
|----------|--------|----------|
| Network timeout | Yes | Exponential backoff, 3 attempts |
| 429 Rate limited | Yes | Respect Retry-After header |
| 500 Server error | Yes | Exponential backoff, 3 attempts |
| 400 Bad request | No | Fix the request |
| 401 Unauthorized | No | Refresh token, then retry once |
| 403 Forbidden | No | Show access denied |
| 404 Not found | No | Show not found |

---

## Error Handling Checklist

Before deploying:
- [ ] User-friendly error messages (no technical details)
- [ ] All async operations have error handling
- [ ] Form validation with field-level errors
- [ ] Loading states for all data fetching
- [ ] Empty states for zero-data scenarios
- [ ] Retry logic for transient failures
- [ ] Error logging configured (CloudWatch / Sentry)
- [ ] 401/403 errors handled appropriately
- [ ] No sensitive data in error logs
- [ ] Error scenarios covered in tests
- [ ] Support contact provided for persistent errors

---

## Common Mistakes

### 1. Exposing Technical Details
```javascript
// ❌ Shows internals
<div>{error.stack}</div>

// ✅ User-friendly
<div>An unexpected error occurred. Please try again.</div>
```

### 2. Swallowing Errors
```javascript
// ❌ Silent failure
try { await riskyOp(); } catch (e) { /* nothing */ }

// ✅ Log and notify
try {
  await riskyOp();
} catch (error) {
  console.error('Operation failed:', error.message);
  setError('Unable to complete operation');
}
```

### 3. No Retry for Transient Failures
```javascript
// ❌ Single attempt, fails permanently on network blip
const data = await fetchData();

// ✅ Retry with backoff
const data = await fetchWithRetry(() => fetchData());
```

---

## Skill Collaboration

- **`security-standards`** — error messages must not expose internals
- **`observability-engineer`** — CloudWatch structured logging, Sentry integration
- **`backend-distributed-systems-engineer`** — Lambda error response patterns
- **`api-platform-engineer`** — standard HTTP error response shapes
