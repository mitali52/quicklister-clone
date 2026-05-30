# CLAUDE.md — Quicklister Clone

This file is the authoritative guide for AI agents and developers working in this repository.
Read it fully before writing any code. When in doubt, refer back here.

---

## Skills — Load Before Working

Each skill contains the full coding rules, best practices, and review checklist for its domain.
**Load the relevant skill before starting any task.** You may load multiple skills for tasks
that span layers (e.g. adding a feature end-to-end loads both frontend and backend skills).

| Skill | When to load | Command |
|---|---|---|
| **Frontend Architect** | Any task in `apps/web/` — components, pages, hooks, forms, routing, state | `/frontend-architect` |
| **Backend Architect** | Any task in `apps/api/` — modules, controllers, services, repositories, jobs, webhooks | `/backend-architect` |
| **Database Engineer** | Any schema change, migration, query optimisation, seed data, index design | `/database-engineer` |
| **Testing Engineer** | Writing or reviewing any spec file, test utility, builder, or coverage analysis | `/testing-engineer` |
| **DevOps Engineer** | CI/CD workflows, Docker, Turborepo config, Husky, env vars, deployments | `/devops-engineer` |

Skills live in `.claude/skills/`. Claude Code discovers and loads them automatically when
the task matches the skill's description. You can also invoke them explicitly by name.

**Task → Skill mapping:**

```
Adding a new listing feature (end-to-end)
  → /backend-architect + /frontend-architect + /database-engineer + /testing-engineer

Adding a new API endpoint only
  → /backend-architect + /testing-engineer

Changing the Prisma schema or writing a migration
  → /database-engineer

Writing tests for an existing service
  → /testing-engineer

Building a new React component or page
  → /frontend-architect

Modifying a GitHub Actions workflow or Dockerfile
  → /devops-engineer

Updating ESLint rules or Prettier config
  → /devops-engineer
```

---

## Project Overview

A UK property listing platform (Quicklister clone). Private sellers and landlords can list
properties directly on Rightmove, Zoopla, OnTheMarket, and PrimeLocation without estate agent
commissions. Full analysis is in `docs/`.

**Monorepo layout:**

```
apps/web/      Next.js 15 (App Router) — public marketing site + authenticated platform
apps/api/      NestJS REST API
packages/
  database/    Prisma schema + migrations
  types/       Shared Zod schemas and TypeScript types
  ui/          shadcn/ui component library
  email/       React Email templates
  config/      Shared ESLint, TypeScript, Tailwind config
```

---

## Non-Negotiable Rules

These apply everywhere. Never skip them, never ask to skip them.

1. **TypeScript strict mode is always on.** No `any`, no `as unknown as X`, no `@ts-ignore`.
   If you cannot type something cleanly, that is a design problem — fix the design.
2. **No business logic in controllers or components.** Controllers route. Components render.
   Logic lives in services (API) or hooks/server actions (web).
3. **Every public function must be testable in isolation.** If it requires a running database
   or HTTP server to test, it belongs in an integration test, not a unit test.
4. **Never commit secrets.** No API keys, tokens, or passwords in source. Use environment
   variables and `.env.example` with placeholder values.
5. **All commits must follow Conventional Commits.** Husky enforces this. Do not bypass hooks.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | latest |
| Frontend framework | Next.js (App Router) | 15 |
| Backend framework | NestJS | 10 |
| Language | TypeScript (strict) | 5 |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 5 |
| Styling | Tailwind CSS | 3 |
| UI components | shadcn/ui (Radix UI) | latest |
| Forms | React Hook Form + Zod | latest |
| Data fetching | TanStack Query | 5 |
| Global state | Zustand | 4 |
| Job queue | BullMQ + Redis | latest |
| Payments | Stripe Node SDK | latest |
| Email | Resend + React Email | latest |
| Auth | Passport.js (JWT RS256) | latest |
| Testing (API) | Jest + Supertest | latest |
| Testing (web) | Jest + React Testing Library | latest |
| Linting | ESLint (flat config) | 9 |
| Formatting | Prettier | 3 |
| Git hooks | Husky + lint-staged | latest |
| Commit linting | commitlint | latest |

---

## Architecture

### Guiding Principles

**Clean Architecture** — dependencies point inward. Domain logic never depends on
infrastructure (HTTP, database, email). Infrastructure depends on domain interfaces.

**SOLID** — applied pragmatically:
- **S** — one reason to change per class/module. A service that sends email AND writes to DB
  is two services.
- **O** — extend via new adapters/implementations, not by editing existing ones. The portal
  adapter pattern is the primary example.
- **L** — all service implementations must be swappable behind their interface contract.
- **I** — small, focused interfaces. Do not add methods to an interface because "it might be
  useful." Add them when a concrete caller needs them.
- **D** — depend on interfaces, not concrete classes. NestJS DI enforces this automatically
  when used correctly.

**Repository Pattern** — all database access goes through a repository. Services never call
Prisma directly. This makes unit testing possible (swap the repo for a mock) and keeps
queries in one place.

---

### Backend Layer Structure (per NestJS module)

```
src/<feature>/
  <feature>.module.ts          — DI wiring only, no logic
  <feature>.controller.ts      — HTTP routing, DTO parsing, delegate to service
  <feature>.service.ts         — business logic, calls repository and domain objects
  <feature>.repository.ts      — all Prisma queries for this feature
  domain/
    <entity>.ts                — pure domain object (no Prisma types)
    <value-object>.ts
  dto/
    create-<feature>.dto.ts    — inbound request shape (class-validator)
    update-<feature>.dto.ts
    <feature>-response.dto.ts  — outbound response shape
  interfaces/
    <feature>-repository.interface.ts
    <feature>-service.interface.ts
  <feature>.service.spec.ts    — unit tests (mock repository)
  <feature>.e2e.spec.ts        — integration tests (real DB, Supertest)
```

**Rules:**
- Controllers return DTOs, never Prisma model types.
- Repositories accept and return domain objects, never DTOs.
- Services orchestrate: call repository → apply domain logic → return domain object → controller maps to DTO.
- Do not import from another feature's internals. Only import from the feature's module public API.

---

### Frontend Layer Structure (per feature, inside `app/`)

```
app/(platform)/<feature>/
  page.tsx                     — Server Component, data fetching, renders feature shell
  _components/                 — feature-scoped components (not shared)
    <Feature>List.tsx
    <Feature>Card.tsx
  _hooks/
    use<Feature>.ts            — TanStack Query hooks for this feature
  _actions/
    <feature>.actions.ts       — Next.js Server Actions (mutations)
```

**Rules:**
- `page.tsx` is a Server Component by default. Add `"use client"` only when necessary
  (event handlers, browser APIs, useState). Push the boundary as far down the tree as possible.
- `_components/`, `_hooks/`, `_actions/` with a leading underscore are private to the route
  segment. Anything reused across features goes into `components/` at the root of `apps/web/`.
- Never fetch data inside a Client Component directly. Fetch in Server Components and pass
  as props, or use TanStack Query for client-side cache management.
- Forms: React Hook Form + `zodResolver`. Validation schema comes from `packages/types/`.

---

## TypeScript Configuration

`tsconfig.json` in every package extends `packages/config/typescript/base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": false
  }
}
```

**`noUncheckedIndexedAccess` is on.** Array/object index access returns `T | undefined`.
Handle it explicitly — do not assert away with `!`.

**Zod is the source of truth for runtime shapes.** Define schemas in `packages/types/`,
infer TypeScript types from them with `z.infer<typeof Schema>`. Never define a type
and a Zod schema separately.

---

## Repository Pattern — Conventions

### Interface (in `interfaces/`)

```typescript
export interface IPropertyRepository {
  findById(id: string): Promise<Property | null>;
  findByUserId(userId: string, opts: PaginationOpts): Promise<PaginatedResult<Property>>;
  create(data: CreatePropertyData): Promise<Property>;
  update(id: string, data: UpdatePropertyData): Promise<Property>;
  updateStatus(id: string, status: PropertyStatus): Promise<void>;
  delete(id: string): Promise<void>;
}

export const PROPERTY_REPOSITORY = Symbol('PROPERTY_REPOSITORY');
```

### Implementation (in the module)

```typescript
@Injectable()
export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Property | null> {
    const row = await this.prisma.property.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }
  // ...
}
```

`toDomain()` converts a Prisma model (infrastructure type) into a domain object. It lives
in the same file as the repository implementation.

### Injection

```typescript
// module
providers: [
  { provide: PROPERTY_REPOSITORY, useClass: PrismaPropertyRepository },
  PropertyService,
],

// service
constructor(
  @Inject(PROPERTY_REPOSITORY)
  private readonly repo: IPropertyRepository,
) {}
```

Unit tests inject a mock that implements `IPropertyRepository`. Integration tests inject
`PrismaPropertyRepository` against a real test database.

---

## Testing

### Philosophy

- Unit tests: fast, no I/O, mock everything external to the class under test.
- Integration tests: real database (PostgreSQL in Docker), real HTTP (Supertest), no mocks.
- No "happy-path only" tests. Every service method needs at least one error case.

### File Naming

```
<feature>.service.spec.ts        unit test for the service
<feature>.repository.spec.ts     unit test for the repository (mock Prisma client)
<feature>.e2e.spec.ts            integration test (full HTTP + real DB)
<feature>.component.test.tsx     React component test (RTL)
```

### Unit Test Structure (Jest)

```typescript
describe('PropertyService', () => {
  let service: PropertyService;
  let repo: jest.Mocked<IPropertyRepository>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      create: jest.fn(),
      // ...
    };
    service = new PropertyService(repo);
  });

  describe('create', () => {
    it('returns the created property', async () => {
      const data = buildCreatePropertyData();
      repo.create.mockResolvedValue(buildProperty());

      const result = await service.create(data);

      expect(repo.create).toHaveBeenCalledWith(data);
      expect(result).toMatchObject({ status: 'draft' });
    });

    it('throws when user has no active subscription and limit reached', async () => {
      // ...
    });
  });
});
```

**Use builder functions** (`buildProperty()`, `buildCreatePropertyData()`) for test fixtures.
Keep them in `test/builders/<entity>.builder.ts`. Never inline large object literals in tests.

### Integration Test Structure (NestJS + Supertest)

```typescript
describe('POST /api/properties', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    applyGlobalPipes(app); // same pipes as production
    await app.init();
    prisma = module.get(PrismaService);
  });

  afterEach(async () => {
    await prisma.property.deleteMany(); // clean up between tests
  });

  afterAll(() => app.close());

  it('returns 201 with the created property', async () => {
    const token = await loginAsTestUser(app);

    const res = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send(buildCreatePropertyPayload());

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('draft');
  });
});
```

Integration tests run against a dedicated `TEST_DATABASE_URL` (separate DB, wiped between
test runs). Never run integration tests against the development database.

### Coverage Thresholds

```json
"jest": {
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 85,
      "lines": 85,
      "statements": 85
    }
  }
}
```

CI fails if coverage drops below these numbers. Do not lower them.

---

## Code Style

### Prettier (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

Prettier is the formatter. ESLint is the linter. They do not overlap. Never add ESLint
rules that are purely stylistic — Prettier handles all formatting.

### ESLint (flat config `eslint.config.mjs`)

Key rules (beyond the standard recommended sets):

```javascript
rules: {
  // Correctness
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

  // Architecture
  'import/no-cycle': 'error',                          // catch circular deps
  'no-restricted-imports': ['error', {
    patterns: ['**/prisma/**', '**/@prisma/client**'],  // only repos touch Prisma
  }],

  // React (web only)
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'error',
}
```

The `no-restricted-imports` rule on `@prisma/client` enforces the repository pattern:
nothing outside a `*.repository.ts` file may import Prisma types.

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files (TS/TSX) | kebab-case | `property-service.ts`, `listing-card.tsx` |
| Classes | PascalCase | `PropertyService` |
| Interfaces | PascalCase, `I` prefix | `IPropertyRepository` |
| Injection tokens | SCREAMING_SNAKE_CASE const | `PROPERTY_REPOSITORY` |
| Zod schemas | PascalCase + `Schema` suffix | `CreatePropertySchema` |
| Inferred types | PascalCase (no suffix) | `CreateProperty` |
| React components | PascalCase | `ListingCard` |
| Hooks | camelCase, `use` prefix | `useListings` |
| Server Actions | camelCase, verb first | `createPropertyAction` |
| Database columns | snake_case (Prisma maps to camelCase) | `created_at` → `createdAt` |
| Env variables | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

---

## Git Workflow

### Branches

```
main          — always deployable, protected
feature/*     — new features (feature/add-tenant-referencing)
fix/*         — bug fixes (fix/portal-sync-retry)
chore/*       — maintenance (chore/update-prisma)
```

Never push directly to `main`. All changes via pull request.

### Conventional Commits

Format: `<type>(<scope>): <description>`

Scopes map to monorepo packages: `web`, `api`, `database`, `types`, `ui`, `email`, `infra`.

```
feat(api): add tenant referencing endpoint
fix(web): correct photo sort order after upload
chore(database): add index on properties.status
refactor(api): extract portal adapter interface
test(api): add integration tests for order creation
docs: update api-requirements with rate limit table
```

**Types:** `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `ci`, `build`

Breaking changes: add `!` after the type and a `BREAKING CHANGE:` footer.

```
feat(api)!: change order response shape to nested structure

BREAKING CHANGE: orders.add_ons is now an array of objects, not IDs.
```

Husky runs `commitlint` on every commit. Commits that do not match the format are rejected.

### Husky Hooks

```
pre-commit    lint-staged (ESLint + Prettier on changed files)
commit-msg    commitlint (Conventional Commits format check)
pre-push      pnpm turbo typecheck && pnpm turbo test:unit
```

`pre-push` runs fast (unit tests only, no integration tests). Integration tests run in CI.

---

## Environment Variables

Every environment variable must be declared in `.env.example` with a placeholder value and
a comment explaining what it is. Never commit a `.env` or `.env.local` file.

Variables used in `apps/api/`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quicklister

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_PRIVATE_KEY=           # RS256 private key (PEM, base64-encoded)
JWT_PUBLIC_KEY=            # RS256 public key (PEM, base64-encoded)
JWT_ACCESS_EXPIRES_IN=900  # seconds (15 min)
JWT_REFRESH_EXPIRES_IN=604800  # seconds (7 days)

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# S3
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_PHOTOS_BUCKET=quicklister-photos-dev
S3_DOCUMENTS_BUCKET=quicklister-documents-dev

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@quicklister.co.uk

# Goodlord
GOODLORD_API_KEY=
GOODLORD_API_URL=https://api.goodlord.co

# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

Variables used in `apps/web/` (prefix `NEXT_PUBLIC_` for client-accessible):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## Database & Prisma

### Schema Rules

- Every table has a `UUID` primary key named `id` with `@default(dbgenerated("gen_random_uuid()"))`.
- Every table has `created_at` and `updated_at` with `@default(now())` and `@updatedAt`.
- Monetary values are stored as `Int` (pence). Never `Float` for money.
- Enums are defined in the Prisma schema and map to PostgreSQL enums.
- JSONB fields (`Json` in Prisma) are used only for truly dynamic/optional data (portal lists,
  check flags). Structured data always gets its own columns.

### Migrations

```bash
# Create a migration (dev only)
pnpm db:migrate -- --name add_portal_listing_error_message

# Apply migrations (prod/CI)
pnpm db:migrate:deploy

# Never edit an existing migration file after it has been applied to any environment.
```

If you need to change a migration that was only applied to your local dev database,
roll back with `prisma migrate reset` (destroys all data) and recreate it.

### Seed Data

`packages/database/prisma/seed.ts` seeds:
- All package tiers (Saver, Exposure, Premium, Pro Lister Monthly, Pro Lister Yearly, Commercial)
- All add-ons (Rightmove, AML Check, Professional Photography)
- One admin user (`admin@quicklister.co.uk` / password from `SEED_ADMIN_PASSWORD` env var)

Run: `pnpm db:seed`

---

## Common Commands

All commands run from the repository root.

```bash
# Development
pnpm dev                     # start web (3000) + api (4000) concurrently
pnpm dev --filter=web        # web only
pnpm dev --filter=api        # api only

# Build
pnpm build                   # build all apps and packages
pnpm build --filter=web      # build web only

# Database
pnpm db:migrate              # create + apply migration (dev)
pnpm db:migrate:deploy       # apply pending migrations (prod/CI)
pnpm db:seed                 # seed database
pnpm db:studio               # open Prisma Studio (port 5555)
pnpm db:reset                # reset + re-seed (destroys all dev data)

# Testing
pnpm test                    # unit tests across all packages
pnpm test:watch              # unit tests in watch mode
pnpm test:integration        # integration tests (requires running DB + Redis)
pnpm test:coverage           # coverage report

# Code quality
pnpm lint                    # ESLint across all packages
pnpm lint:fix                # ESLint with --fix
pnpm format                  # Prettier check
pnpm format:fix              # Prettier write
pnpm typecheck               # tsc --noEmit across all packages

# All checks (runs in CI)
pnpm ci                      # lint + typecheck + test + build
```

---

## What NOT to Do

These patterns are banned. If you write them, the reviewer will reject the PR.

```typescript
// ❌ any
const data: any = response.json();

// ❌ non-null assertion
const user = users[0]!;

// ❌ @ts-ignore / @ts-expect-error (unless paired with a comment explaining why
//    the type system is provably wrong AND a link to the upstream issue)
// @ts-ignore
doSomething(badlyTypedLibraryOutput);

// ❌ Prisma in a service (goes through repository)
async createProperty(data: CreatePropertyData) {
  return this.prisma.property.create({ data }); // wrong
}

// ❌ Business logic in a controller
@Post()
async create(@Body() dto: CreatePropertyDto, @Req() req: Request) {
  if (dto.price < 0) throw new BadRequestException('Price invalid'); // belongs in service/domain
  return this.service.create(dto);
}

// ❌ Prisma type leaking out of the repository
async findById(id: string): Promise<Prisma.PropertyGetPayload<{}>> { // wrong return type
  return this.prisma.property.findUniqueOrThrow({ where: { id } });
}

// ❌ Inline object literals in tests (use builders)
const property = { id: '123', title: 'flat', price: 10000, ... }; // 20 fields of noise

// ❌ Default exports (except Next.js pages and layout.tsx which require them)
export default function PropertyService() {} // wrong — use named exports

// ❌ Skipping validation in DTOs
export class CreatePropertyDto {
  price: number; // ❌ no @IsInt(), @Min(0) decorator
}

// ❌ Monorepo cross-package deep imports
import { PrismaService } from '../../packages/database/src/prisma.service'; // use package name
import { PrismaService } from '@quicklister/database'; // correct
```

---

## Pull Request Checklist

Before opening a PR, verify every item:

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm test` passes with zero failures
- [ ] Coverage has not dropped below thresholds
- [ ] New feature has unit tests (service + repository)
- [ ] New API endpoint has an integration test
- [ ] New Prisma model has a migration and the seed script updated if needed
- [ ] No `any`, no `!`, no `@ts-ignore` added
- [ ] Environment variables added to `.env.example` with comments
- [ ] Conventional Commits format used for all commits on the branch
- [ ] PR description explains *why*, not just *what*

---

## Reference

### Skills

| Skill | Path |
|---|---|
| Frontend Architect | `.claude/skills/frontend-architect/SKILL.md` |
| Backend Architect | `.claude/skills/backend-architect/SKILL.md` |
| Database Engineer | `.claude/skills/database-engineer/SKILL.md` |
| Testing Engineer | `.claude/skills/testing-engineer/SKILL.md` |
| DevOps Engineer | `.claude/skills/devops-engineer/SKILL.md` |

### Architecture Documents

| Document | Location |
|---|---|
| Folder structure | `docs/architecture/folder-structure.md` |
| Frontend architecture | `docs/architecture/frontend-architecture.md` |
| Backend architecture | `docs/architecture/backend-architecture.md` |
| Infrastructure | `docs/architecture/infrastructure-architecture.md` |

### Analysis Documents

| Document | Location |
|---|---|
| Feature inventory | `docs/feature-inventory.md` |
| User roles | `docs/user-roles.md` |
| Page inventory | `docs/page-inventory.md` |
| Navigation structure | `docs/navigation-structure.md` |
| Data entities | `docs/data-entities.md` |
| API requirements | `docs/api-requirements.md` |
| Database schema | `docs/database-requirements.md` |
| Business workflows | `docs/business-workflows.md` |
| User flows | `docs/user-flows.md` |
| Pricing model | `docs/pricing-model.md` |
| Third-party integrations | `docs/third-party-integrations.md` |
