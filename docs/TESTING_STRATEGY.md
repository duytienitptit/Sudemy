# Testing Strategy

---

## Backend Testing

### Stack
- **Jest** — Test runner + assertions
- **Supertest** — HTTP endpoint testing
- **mongodb-memory-server** — In-memory MongoDB for isolated tests

### Test Structure
```
server/src/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── AuthService.test.ts
│   │   │   ├── CourseService.test.ts
│   │   │   ├── PromptService.test.ts
│   │   │   ├── PaymentService.test.ts
│   │   │   └── CouponService.test.ts
│   │   └── utils/
│   │       ├── slugify.test.ts
│   │       └── youtube.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── courses.test.ts
│   │   ├── prompts.test.ts
│   │   ├── orders.test.ts
│   │   └── settings.test.ts
│   └── helpers/
│       ├── setup.ts          # DB setup/teardown
│       ├── factories.ts      # Test data factories
│       └── mocks.ts          # Service mocks
```

### Test Naming Convention
```typescript
describe('CourseService', () => {
  describe('create', () => {
    it('should create a course with auto-generated slug', async () => { ... });
    it('should append suffix when slug already exists', async () => { ... });
    it('should throw validation error for missing title', async () => { ... });
  });
});
```

### Mock Strategy

| Service | Mock Approach |
|---|---|
| Firebase Admin | Mock `admin.auth().verifyIdToken()` → return fake decoded token |
| PayOS | Mock `payos.createPaymentLink()` → return fake checkout URL |
| Resend | Mock `resend.emails.send()` → return success, track calls |
| MongoDB | Use `mongodb-memory-server` for real DB operations |

### Factory Functions
```typescript
// server/src/__tests__/helpers/factories.ts
export const createTestUser = (overrides?: Partial<IUser>) => ({
  firebaseUid: `test-uid-${Date.now()}`,
  fullName: 'Test User',
  email: `test-${Date.now()}@example.com`,
  role: 'user' as const,
  purchasedCourses: [],
  ...overrides,
});

export const createTestCourse = (overrides?: Partial<ICourse>) => ({
  title: `Test Course ${Date.now()}`,
  description: 'A test course description that is long enough',
  thumbnail: 'https://example.com/thumb.jpg',
  price: 299000,
  instructor: 'Test Instructor',
  status: 'published' as const,
  ...overrides,
});
```

---

## Frontend Testing

### Stack
- **Vitest** — Test runner (Vite-native, Jest-compatible API)
- **React Testing Library** — Component testing
- **MSW (Mock Service Worker)** — API mocking

### Test Structure
```
client/src/
├── __tests__/
│   ├── components/
│   │   ├── CourseCard.test.tsx
│   │   ├── PromptCard.test.tsx
│   │   ├── CopyButton.test.tsx
│   │   └── SearchBar.test.tsx
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useCourses.test.ts
│   ├── pages/
│   │   └── PromptsPage.test.tsx
│   └── helpers/
│       ├── setup.ts
│       ├── renderWithProviders.tsx
│       └── handlers.ts       # MSW request handlers
```

### Testing Priorities
1. **Custom hooks** — useAuth, useCourses, usePrompts (TanStack Query wrappers)
2. **Shared components** — CourseCard, PromptCard, CopyButton, Pagination
3. **Form components** — Login, Register, CouponForm (validation behavior)
4. **Page-level** — Key user flows (prompt copy, quiz submission)

---

## Coverage Targets

| Layer | Target | Critical Paths |
|---|---|---|
| Backend Services | >80% | Auth, Payment, Progress |
| Backend Controllers | >70% | All endpoints |
| Frontend Hooks | >80% | useAuth, data hooks |
| Frontend Components | >60% | Shared components |

---

## E2E Testing (Post-MVP)

- **Playwright** for critical user flows:
  1. Register → Login → Browse courses
  2. View prompt → Copy to clipboard
  3. Purchase course → Complete lesson → Get certificate
  4. Admin: Create course → Add lessons → Publish

---

## Running Tests

```bash
# Backend
cd server && npm test              # Run all tests
cd server && npm test -- --watch   # Watch mode
cd server && npm run test:coverage # Coverage report

# Frontend
cd client && npm test              # Run all tests
cd client && npm test -- --watch   # Watch mode
cd client && npm run test:coverage # Coverage report
```
