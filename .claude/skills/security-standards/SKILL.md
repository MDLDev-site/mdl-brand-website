---
name: security-standards
description: Team-wide security standards covering secrets management, input validation, XSS/CSRF prevention, authentication patterns, payment security, and incident response. Auto-triggers on any security review, auth work, or code handling sensitive data.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# MDL Security Standards

**Purpose:** Security standards and patterns applicable across all MDL projects (Lambda backend, React frontends, Astro brand site)

## Core Security Principles

1. **Never trust user input** — validate and sanitise all data
2. **Defence in depth** — multiple layers of security
3. **Least privilege** — minimum necessary permissions
4. **Fail securely** — errors should not expose sensitive information
5. **Keep secrets secret** — never commit credentials or sensitive data

---

## Configuration & Secrets Management

### CRITICAL: Never Commit Secrets

**What NOT to commit:**
- API keys (except public ones like Stripe publishable key)
- Private tokens
- AWS credentials
- Database passwords
- Encryption keys
- User data or PII
- `.env` files

**Patterns by project type:**

```javascript
// Frontend — use environment variables via build tool
const API_URL = import.meta.env.VITE_API_URL;

// Lambda backend — use AWS Secrets Manager or SSM Parameter Store
const secret = await secretsManager.getSecretValue({ SecretId: 'my-secret' }).promise();

// Astro — use environment variables
const apiKey = import.meta.env.PUBLIC_API_KEY; // client-safe
const secret = import.meta.env.SECRET_KEY;     // server-only
```

### Pre-Commit Security Checklist

When adding configuration values, ask:
- [ ] Is this value safe to expose in client-side code?
- [ ] Could this value be used maliciously if discovered?
- [ ] Does this contain credentials or access tokens?
- [ ] Should this be environment-specific?

---

## Authentication & Authorisation

### AWS Cognito (MDL Auth)

**Multi-tenant pattern:** Each channel has its own Cognito user pool. Auth tokens are scoped per-tenant.

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Token Handling:**

```javascript
// ✅ DO — use Authorization header
headers: {
  Authorization: `Bearer ${token}`,
}

// ❌ DON'T — tokens in URL params
fetch(`/api/user?token=${token}`);

// ❌ DON'T — log tokens
console.log('Token:', token);

// ❌ DON'T — store in global variables
window.userToken = token;
```

### Lambda Handler Security Checklist

Every Lambda handler MUST:
1. Validate the `Authorization` header
2. Extract and verify the JWT token
3. Scope data access by `channel_id` (multi-tenant isolation)
4. Return generic error messages (never expose internals)
5. Log securely (no tokens, no PII in CloudWatch)

```javascript
// ✅ MDL Lambda pattern
export const handler = async (event) => {
  const token = event.headers?.authorization?.replace('Bearer ', '');
  if (!token) return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };

  // Verify token, extract channel_id
  const claims = await verifyToken(token);
  const channelId = claims['custom:channel_id'];

  // All queries scoped to channel
  const result = await docClient.query({
    TableName: 'my-table',
    KeyConditionExpression: 'channel_id = :cid',
    ExpressionAttributeValues: { ':cid': channelId },
  }).promise();
};
```

---

## Payment Security (Stripe)

### PCI Compliance

**NEVER:**
```javascript
// ❌ NEVER log payment information
console.log('Card number:', cardNumber);
console.log('Payment intent:', paymentIntent); // May contain sensitive data

// ❌ NEVER store raw card data
localStorage.setItem('cardNumber', cardNumber);

// ❌ NEVER send card data directly to your API
fetch('/api/payment', { body: { cardNumber, cvv } });
```

**ALWAYS:**
- Use Stripe Elements for all card input (frontend)
- Use Stripe webhooks for payment confirmation (backend)
- Verify webhook signatures in Lambda handlers

**Safe to log:**
- Payment intent IDs (`pi_xxx`)
- Setup intent IDs (`seti_xxx`)
- Customer IDs (`cus_xxx`)
- Payment status/state

**NEVER log:**
- Card numbers, CVV/CVC codes
- Bank account numbers
- Full card details

---

## Input Validation & Sanitisation

### Validate at All Boundaries

1. **Client-side** — for UX and immediate feedback
2. **API Gateway** — request validation
3. **Lambda handler** — for security (never trust client)

### Common Validations

```javascript
// Email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number
function validatePhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// URL (only allow http/https)
function isValidURL(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### XSS Prevention

```javascript
// ✅ React auto-escapes by default
<div>{userInput}</div>

// ✅ Sanitise HTML content
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(userHTML);

// ❌ NEVER use dangerouslySetInnerHTML without sanitisation
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ NEVER use eval or Function constructor
eval(userInput);
new Function(userInput)();
```

### Lambda Input Validation

```javascript
// ✅ Validate and sanitise in every handler
const body = JSON.parse(event.body || '{}');

if (!body.email || !EMAIL_REGEX.test(body.email)) {
  return { statusCode: 400, body: JSON.stringify({ message: 'Invalid email' }) };
}

// Sanitise strings
const name = body.name?.trim().substring(0, 100);
```

---

## API Security

### Request Headers

```javascript
// ✅ Always include
headers: {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
}
```

### Error Response Security

```javascript
// ✅ Generic error messages to users
catch (error) {
  // Log full error server-side for debugging
  console.error('Internal error:', error);

  return {
    statusCode: 500,
    body: JSON.stringify({ message: 'An error occurred. Please try again.' }),
  };
}

// ❌ NEVER expose internal errors
catch (error) {
  return {
    statusCode: 500,
    body: JSON.stringify({ message: error.message, stack: error.stack }),
  };
}
```

### CORS (Lambda Pattern)

```javascript
// ✅ MDL CORS headers pattern
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};
```

---

## Session Management

### Storage Rules

**Safe to store client-side:**
- Access tokens (with proper expiry handling)
- User ID (not sensitive)
- Preferences

**NEVER store client-side:**
- Passwords (even hashed)
- Credit card numbers
- Social security numbers
- Full authentication responses

### Logout Security

Complete logout must:
1. Clear all tokens from storage
2. Clear user data
3. Invalidate session on server
4. Redirect to login

---

## Sentry / Error Monitoring

### PII Scrubbing

Configure Sentry to scrub PII:
- Strip email addresses from breadcrumbs
- Redact auth tokens from request headers
- Never send user passwords or payment data
- Use `beforeSend` hooks to filter sensitive data

---

## Security Testing

### Every PR Must Verify:
1. No hardcoded secrets or credentials
2. Authentication flows tested
3. Input validation tested with:
   - SQL injection attempts
   - XSS payloads
   - Oversized inputs
   - Special characters
4. Error handling doesn't leak info

### Dependency Auditing

```bash
# Run before every release
npm audit

# Fix vulnerabilities
npm audit fix

# Review and update dependencies monthly
npm outdated
```

---

## Incident Response

### If Security Issue Discovered:

1. **Immediate Actions:**
   - Document the vulnerability
   - Assess severity and impact
   - Notify team lead immediately

2. **Critical Issues (passwords, payment data exposed):**
   - Rotate all affected credentials immediately
   - Notify affected users
   - Prepare incident report

3. **Post-Incident:**
   - Create Linear tickets to prevent similar issues
   - Update security standards
   - Conduct security review

---

## Quick Security Checklist

Before committing code:
- [ ] No secrets in code or config files
- [ ] Input validation implemented
- [ ] Authentication checked for protected features
- [ ] No sensitive data in logs
- [ ] Error messages are generic to users
- [ ] Tokens stored and used securely
- [ ] External URLs validated
- [ ] SQL/XSS injection prevented
- [ ] Dependencies have no known vulnerabilities
- [ ] Tests cover security scenarios
- [ ] Multi-tenant data isolation verified (channel_id scoping)

---

## Skill Collaboration

- **`security-sentinel`** — deep security audits (Cognito, Stripe, DRM, Secrets Manager)
- **`backend-distributed-systems-engineer`** — Lambda handler security patterns
- **`api-platform-engineer`** — CORS Lambda pattern, API security headers
- **`git-workflow`** — pre-commit security checklist
