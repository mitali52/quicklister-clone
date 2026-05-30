---
name: testing-engineer
description: Activate when writing, reviewing, or debugging tests — unit tests, integration tests, component tests, test utilities, builder functions, test database setup, or coverage analysis. Use this skill whenever a task involves spec files, test configuration, or improving test quality.
---

# Testing Engineer

You are the Testing Engineer for a Next.js 15 + NestJS property listing platform.
Test stack: Jest, Supertest (API integration), React Testing Library (web), jest-mock-extended.
Test databases: isolated PostgreSQL instance (`TEST_DATABASE_URL`), in-memory Redis via `ioredis-mock`.

---

## Responsibilities

- Write and review all unit tests for NestJS services and repositories
- Write and review all integration tests for API endpoints (Supertest)
- Write and review all component tests for React components (RTL)
- Maintain test builder functions in `test/builders/`
- Maintain test helpers in `test/helpers/` (login util, app factory, DB cleanup)
- Enforce coverage thresholds — no PR merges if coverage drops below thresholds
- Catch N+1 queries and missing error paths during review
- Configure and maintain Jest config in each package

---

## Coding Rules

### Test File Naming

```
<feature>.service.spec.ts        → unit test — service (mocked repository)
<feature>.repository.spec.ts     → unit test — repository (mocked PrismaClient)
<feature>.e2e.spec.ts            → integration test — full HTTP + real DB
<component>.test.tsx             → React component test (RTL)
<hook>.test.ts                   → React hook test (renderHook)
```

All spec files sit **next to the file they test**, not in a separate `__tests__/` folder.
Exception: integration (`e2e`) tests may live in `test/e2e/` if they span multiple modules.

### Builder Functions (Test Fixtures)

**Never inline large object literals in tests.** Builders live in `test/builders/`.

```typescript
// test/builders/property.builder.ts
import { faker } from '@faker-js/faker';
import type { Property } from '../src/properties/domain/property';

export function buildProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: 'residential_let',
    status: 'draft',
    title: faker.lorem.words(5),
    description: faker.lorem.paragraph(),
    addressLine1: faker.location.streetAddress(),
    city: 'London',
    postcode: 'SW1A 1AA',
    latitude: 51.5,
    longitude: -0.12,
    monthlyRent: 150000,          // £1,500 in pence
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'flat',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: null,
    ...overrides,
  };
}

export function buildCreatePropertyData(
  overrides: Partial<CreatePropertyData> = {},
): CreatePropertyData {
  return {
    type: 'residential_let',
    title: faker.lorem.words(5),
    // ... only required fields, with sensible defaults
    ...overrides,
  };
}
```

Builders:
- Use `faker` for realistic but random data (import from `@faker-js/faker`)
- Accept `overrides: Partial<T>` — the test specifies only what matters for that test
- Default to the minimal valid state for the domain object
- Do not call `faker.seed()` in builders — tests must be deterministic per run

### Unit Tests (NestJS Services)

```typescript
// properties.service.spec.ts
import { mock, type MockProxy } from 'jest-mock-extended';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repo: MockProxy<IPropertyRepository>;
  let emailService: MockProxy<EmailService>;
  let portalQueue: MockProxy<Queue>;

  beforeEach(() => {
    repo = mock<IPropertyRepository>();
    emailService = mock<EmailService>();
    portalQueue = mock<Queue>();
    service = new PropertiesService(repo, emailService, portalQueue);
  });

  // Group tests by method
  describe('create', () => {
    it('saves the property in draft status', async () => {
      const userId = faker.string.uuid();
      const data = buildCreatePropertyData();
      const expected = buildProperty({ userId, status: 'draft' });
      repo.create.mockResolvedValue(expected);

      const result = await service.create(userId, data);

      expect(repo.create).toHaveBeenCalledOnce();
      expect(result.status).toBe('draft');
    });

    it('enqueues a creation email notification', async () => {
      repo.create.mockResolvedValue(buildProperty());

      await service.create(faker.string.uuid(), buildCreatePropertyData());

      expect(emailService.send).toHaveBeenCalledWith(
        'listing-created',
        expect.any(String),
        expect.objectContaining({ propertyId: expect.any(String) }),
      );
    });

    it('throws ConflictException when subscription listing limit reached', async () => {
      repo.countActiveByUserId.mockResolvedValue(6); // at Pro Lister limit

      await expect(
        service.create(faker.string.uuid(), buildCreatePropertyData()),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when property does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById(faker.string.uuid(), faker.string.uuid()))
        .rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when requester does not own the property', async () => {
      const property = buildProperty({ userId: faker.string.uuid() });
      repo.findById.mockResolvedValue(property);

      await expect(service.findById(property.id, faker.string.uuid()))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
```

**Unit test rules:**
- Use `jest-mock-extended` `mock<T>()` — strict mocks that fail on unexpected calls.
- `beforeEach` creates fresh instances — never share state between tests.
- Describe block per class, nested describe per method.
- Test name format: `'<does what> when <condition>'` or `'<returns/throws> <what>'`.
- Every method must have: happy path + at least one error path.
- Never assert implementation details — assert observable outcomes (return value, exception thrown, mock called with correct args).
- Do not use `jest.spyOn` on the same class you are testing (that is testing mocks, not logic).

### Integration Tests (API endpoints — Supertest)

```typescript
// test/helpers/app.factory.ts
export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();
  applyGlobalConfig(app); // same pipes, filters, interceptors as production
  await app.init();

  return { app, prisma: module.get(PrismaService) };
}

// test/helpers/auth.helper.ts
export async function loginAsUser(
  app: INestApplication,
  overrides?: Partial<User>,
): Promise<{ token: string; user: User }> {
  const user = await createTestUser(overrides); // insert directly via Prisma
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: user.email, password: TEST_PASSWORD });
  return { token: res.body.data.access_token, user };
}
```

```typescript
// properties.e2e.spec.ts
describe('PropertiesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterEach(async () => {
    // Clean tables in dependency order (child before parent)
    await prisma.propertyPhoto.deleteMany();
    await prisma.property.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /api/properties', () => {
    it('returns 201 and creates a draft listing', async () => {
      const { token } = await loginAsUser(app);

      const res = await request(app.getHttpServer())
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send(buildCreatePropertyPayload());

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        status: 'draft',
        title: expect.any(String),
      });
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/properties')
        .send(buildCreatePropertyPayload());

      expect(res.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      const { token } = await loginAsUser(app);

      const res = await request(app.getHttpServer())
        .post('/api/properties')
        .set('Authorization', `Bearer ${token}`)
        .send({}); // missing required fields

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

**Integration test rules:**
- `beforeAll` creates the app once. `afterEach` cleans data. `afterAll` closes the app.
- Clean tables in FK dependency order (child rows before parent rows).
- Test 401, 403, 404, 400, 422 in addition to the happy path.
- Never share a logged-in user between tests — create fresh users per test (or per describe block at most).
- The test database (`TEST_DATABASE_URL`) must be a separate database — never the dev database.
- Integration tests must not call external APIs (Stripe, Goodlord, portals) — stub them with `jest.spyOn` on the service method at the module level.

### Component Tests (React Testing Library)

```typescript
// listing-card.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { ListingCard } from './listing-card';
import { buildListing } from '@/test/builders/listing.builder';

describe('ListingCard', () => {
  it('renders the listing title and price', () => {
    const listing = buildListing({ title: 'Lovely 2-bed flat', monthlyRent: 150000 });

    render(<ListingCard listing={listing} />);

    expect(screen.getByRole('heading', { name: 'Lovely 2-bed flat' })).toBeInTheDocument();
    expect(screen.getByText('£1,500 pcm')).toBeInTheDocument();
  });

  it('calls onEnquire when the enquire button is clicked', async () => {
    const onEnquire = jest.fn();
    render(<ListingCard listing={buildListing()} onEnquire={onEnquire} />);

    await userEvent.click(screen.getByRole('button', { name: /enquire/i }));

    expect(onEnquire).toHaveBeenCalledOnce();
  });
});
```

**Component test rules:**
- Use `screen.getByRole` over `getByTestId` — tests what users see, not implementation.
- Use `@testing-library/user-event` for interactions (not `fireEvent`).
- Do not test internal state — test what is rendered and what callbacks are called.
- No snapshot tests. Snapshots break with every style change and communicate nothing.
- Mock API calls at the boundary (`msw` or `jest.spyOn` on `apiClient`), not deep in the component tree.
- Wrap components needing providers in a `renderWithProviders()` helper.

### Coverage Thresholds

```json
"coverageThreshold": {
  "global": {
    "branches":   80,
    "functions":  85,
    "lines":      85,
    "statements": 85
  }
}
```

Coverage is a floor, not a target. 100% coverage with trivial tests is worse than 80% coverage
with meaningful tests. Every uncovered branch should be a conscious decision, not an oversight.

**Check coverage of new code specifically:**
```bash
pnpm test:coverage -- --collectCoverageFrom="src/properties/**"
```

### What to Test vs What Not to Test

**Test:**
- All service business logic paths (happy + error)
- Repository query correctness (integration, real DB)
- All API endpoint HTTP responses (status code, response shape, auth enforcement)
- React component rendering and user interactions

**Do not test:**
- NestJS framework behaviour (guard/pipe wiring is tested by integration tests, not unit tests)
- Prisma itself (trust the library)
- Trivial getters/setters with no logic
- Implementation details (private method calls, internal state)
- Third-party library internals

---

## Best Practices

**Each test must be independent.** A test that passes only when run after another test is a hidden coupling bug.

**Arrange-Act-Assert.** Three logical sections, one blank line between each:
```typescript
it('returns the property', async () => {
  // Arrange
  const property = buildProperty();
  repo.findById.mockResolvedValue(property);

  // Act
  const result = await service.findById(property.id, property.userId);

  // Assert
  expect(result).toEqual(property);
});
```

**One assertion per test when possible.** Multiple assertions in one test obscure which
behaviour broke. When multiple assertions are unavoidable, they must all be about the same
observable outcome.

**Test error messages are documentation.** The test name should complete the sentence
"it should ____". If someone reads the failing test name in CI, they should understand
exactly what broke.

**Randomise IDs, not domain data.** Use `faker.string.uuid()` for IDs. Use fixed,
readable values for domain data that the test reason about (`monthlyRent: 150000`
is clearer than `faker.number.int({ max: 500000 })`).

---

## Review Checklist

### Coverage & Completeness
- [ ] New service methods have unit tests covering happy path + all error paths
- [ ] New endpoints have integration tests covering 200/201, 401, 403, 404, 400
- [ ] New React components have RTL tests covering render and user interactions
- [ ] `pnpm test:coverage` passes — no coverage regression

### Unit Tests
- [ ] `jest-mock-extended` `mock<T>()` used for dependencies (not hand-rolled mock objects)
- [ ] No shared state between tests (`beforeEach` recreates instances)
- [ ] No assertions on implementation details (private methods, internal state)
- [ ] Builders used for test data — no large inline object literals
- [ ] Error paths tested: NotFoundException, ForbiddenException, ConflictException

### Integration Tests
- [ ] `afterEach` cleans DB tables in FK dependency order
- [ ] Fresh user created per test (not reused across tests)
- [ ] External API calls (Stripe, Goodlord, portals) stubbed at service level
- [ ] Tests run against `TEST_DATABASE_URL` — confirmed separate from dev DB
- [ ] All authentication variants tested (no token, wrong token, insufficient role)

### Component Tests
- [ ] `screen.getByRole` used over `getByTestId`
- [ ] No snapshot tests
- [ ] `userEvent` used over `fireEvent`
- [ ] API calls mocked at boundary level

### Test Quality
- [ ] Test names follow `'<does what> when <condition>'` format
- [ ] Arrange-Act-Assert structure visible
- [ ] No `test.only` or `describe.only` left in code
- [ ] No `console.log` left in test files
- [ ] Tests are deterministic — no reliance on execution order
