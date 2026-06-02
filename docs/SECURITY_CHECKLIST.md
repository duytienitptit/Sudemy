# Security Checklist

> Consolidated from Project Brief V1 Section 5.
> All items must be implemented before production deployment.

---

## Input Validation

- [ ] **Zod** installed and used for ALL API endpoint validation (server + client shared schemas)
- [ ] Full Name: Letters + spaces only (Vietnamese Unicode supported), 2-50 chars
- [ ] Email: Valid format, lowercase normalized, verified via Firebase
- [ ] Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- [ ] Coupon Code: Alphanumeric only, auto-uppercased
- [ ] Course Price: Positive number, max value limit enforced
- [ ] YouTube URL: Validated format (youtube.com/watch?v= or youtu.be/)
- [ ] HTML Content: Sanitized before storage AND display
- [ ] No raw `req.body` used — always through Zod validation middleware

## XSS Prevention

- [ ] **DOMPurify** installed on frontend
- [ ] All user-generated HTML content sanitized before rendering
- [ ] Rich text editor output sanitized on both save and display
- [ ] No `dangerouslySetInnerHTML` without DOMPurify processing
- [ ] CSP headers configured via Helmet

## NoSQL Injection Prevention

- [ ] **mongo-sanitize** middleware installed and applied globally
- [ ] No string concatenation in MongoDB queries
- [ ] All query parameters validated with Zod before use
- [ ] `$where`, `$expr` not used with user input

## HTTP Security

- [ ] **helmet** middleware installed and configured
- [ ] CORS configured with explicit `CLIENT_URL` origin (not `*`)
- [ ] `X-Content-Type-Options: nosniff` set
- [ ] `X-Frame-Options: DENY` set
- [ ] `Strict-Transport-Security` enabled in production
- [ ] Request body size limited (`express.json({ limit: '10mb' })`)

## Rate Limiting

- [ ] **express-rate-limit** installed
- [ ] Global rate limit: 100 requests per 15 minutes per IP
- [ ] Auth endpoints: 10 requests per 15 minutes per IP
- [ ] Payment endpoints: 5 requests per 15 minutes per user
- [ ] Prompt copy: 30 requests per 15 minutes per IP

## Authentication & Authorization

- [ ] Firebase Admin SDK verifies ALL protected routes
- [ ] JWT tokens have reasonable expiry (7 days)
- [ ] Role-based access control enforced at middleware level
- [ ] Super Admin routes inaccessible to Editor/Moderator
- [ ] Token refresh flow implemented correctly
- [ ] Logout invalidates token on client side

## Payment Security

- [ ] PayOS webhook signature verified using checksum key
- [ ] Idempotency keys generated for every order
- [ ] Duplicate webhook calls handled gracefully (idempotent processing)
- [ ] Payment amounts validated server-side (never trust client price)
- [ ] All payment transactions logged for auditing
- [ ] Order status transitions: pending → completed/failed (no backward transitions)

## Data Protection

- [ ] Passwords never stored in MongoDB (Firebase handles auth)
- [ ] Sensitive data (API keys, secrets) only in `.env`, never in code
- [ ] `.env` in `.gitignore`
- [ ] User data returned without sensitive fields (`password`, `firebaseUid` excluded from public APIs)
- [ ] MongoDB connection uses TLS in production
- [ ] Database user has minimal required permissions

## Error Handling

- [ ] Custom `AppError` class used for all known errors
- [ ] Centralized error handler catches all errors
- [ ] Raw MongoDB/Mongoose errors NEVER sent to client
- [ ] Stack traces hidden in production (`NODE_ENV=production`)
- [ ] All errors logged with structured logger (Winston)
- [ ] Correlation ID attached to all logs and error responses

## Environment

- [ ] `.env.example` documents ALL required variables
- [ ] Server validates required env vars on startup (fail fast)
- [ ] No secrets hardcoded anywhere in codebase
- [ ] Different configs for development/production
