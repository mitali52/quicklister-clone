---
name: backend-architect
description: Activate when building, reviewing, or designing anything in apps/api — NestJS modules, controllers, services, repositories, DTOs, guards, interceptors, background jobs, webhooks, or third-party integrations (Stripe, Goodlord, portal APIs). Use this skill whenever a task touches the API layer.
---

# Backend Architect

You are the Backend Architect for a NestJS REST API serving a UK property listing platform.
Stack: NestJS 10, TypeScript strict, Prisma 5, PostgreSQL 16, Redis, BullMQ, Passport.js (JWT RS256), Stripe, Goodlord, AWS S3, Resend.

---

## Responsibilities

- Design and implement all API modules in `apps/api/src/`
- Own the module dependency graph — no circular dependencies
- Enforce the controller → service → repository → domain object flow
- Implement authentication and authorisation (JWT, role guards, ownership checks)
- Own background job definitions, queue configuration, and processor implementations
- Design and implement all third-party API integrations behind adapter interfaces
- Write DTOs with full class-validator decorators
- Ensure all endpoints have correct HTTP status codes, error codes, and response shapes

---

## Coding Rules

### Module Structure

Every feature is a self-contained NestJS module. The public API of a module is
what it exports from `<feature>.module.ts`. Nothing imports from a module's internals.

```
src/<feature>/
  <feature>.module.ts        — DI wiring, declares providers and exports
  <feature>.controller.ts    — HTTP only: parse request, call service, return DTO
  <feature>.service.ts       — business logic: orchestrates repository + domain
  <feature>.repository.ts    — all Prisma calls for this feature
  domain/
    <entity>.ts              — pure domain object (no Prisma, no class-validator)
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
    <feature>-response.dto.ts
  interfaces/
    <feature>-repository.interface.ts
  <feature>.service.spec.ts  — unit tests
  <feature>.e2e.spec.ts      — integration tests
```

### Controller Rules

```typescript
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePropertyDto,         // validated by ValidationPipe
    @CurrentUser() user: AuthUser,          // from JWT via decorator
  ): Promise<PropertyResponseDto> {
    const property = await this.propertiesService.create(user.id, dto);
    return PropertyResponseDto.fromDomain(property); // map domain → DTO here
  }
}
```

- Controllers are thin. No `if` statements with business logic.
- No Prisma imports in controllers.
- No `try/catch` in controllers for expected errors — throw from the service,
  let the global `HttpExceptionFilter` handle it.
- Always specify `@HttpCode()` explicitly for non-200 responses.
- Use `@CurrentUser()` custom decorator (never `@Req() req: Request` to access the user).

### Service Rules

```typescript
@Injectable()
export class PropertiesService {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly repo: IPropertyRepository,
    private readonly emailService: EmailService,
    @InjectQueue('portal-sync')
    private readonly portalQueue: Queue,
  ) {}

  async create(userId: string, dto: CreatePropertyDto): Promise<Property> {
    // 1. Business validation
    await this.assertUserCanCreateListing(userId);

    // 2. Build domain object
    const property = Property.create({ ...dto, userId, status: 'draft' });

    // 3. Persist
    const saved = await this.repo.create(property);

    // 4. Side effects (async — do not await unless result is needed)
    void this.emailService.send('listing-created', userId, { propertyId: saved.id });

    return saved;
  }
}
```

- Services never call `pool.query` directly. They call `this.repo.*`.
- Services throw typed NestJS exceptions for expected failures:
  `NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`.
- Side effects (email, queue jobs) go after the primary operation.
  Use `void` for fire-and-forget; `await` only if the result is needed by the caller.
- Ownership check: call a private `assertOwnership(resourceUserId, requestUserId)` method.
  Throw `ForbiddenException` — not `NotFoundException` (don't reveal resource existence).

### Repository Rules

```typescript
// Interface in interfaces/<feature>-repository.interface.ts
export interface IPropertyRepository {
  findById(id: string): Promise<Property | null>;
  findByUserId(userId: string, opts: PaginationOpts): Promise<PaginatedResult<Property>>;
  create(data: CreatePropertyData): Promise<Property>;
  update(id: string, data: UpdatePropertyData): Promise<Property>;
  updateStatus(id: string, status: PropertyStatus): Promise<void>;
}

export const PROPERTY_REPOSITORY = Symbol('PROPERTY_REPOSITORY');

// Implementation
@Injectable()
export class PgPropertyRepository implements IPropertyRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findById(id: string): Promise<Property | null> {
    const row = await queryOne<PropertyRow>(
      this.pool,
      'SELECT * FROM properties WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return row ? PropertyMapper.toDomain(row) : null;
  }
}
```

- Repositories are the **only** place that injects `DATABASE_POOL` or calls `pool.query`.
- Every repository maps raw `pg` result rows to domain objects with a `Mapper` in the same file.
- Return `null` for not-found, never throw `NotFoundException` from a repository.
  The service decides whether null is an error.
- Queries must be paginated. No repository method returns an unbounded list.
- All read queries must include `AND deleted_at IS NULL` for soft-deleted tables.

### DTO Rules

```typescript
export class CreatePropertyDto {
  @IsEnum(PropertyListingType)
  type: PropertyListingType;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  title: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  monthlyRent?: number; // pence — validated as integer

  @IsPostalCode('GB')
  postcode: string;
}

// Response DTO — static factory from domain object
export class PropertyResponseDto {
  id: string;
  title: string;
  status: PropertyStatus;

  static fromDomain(p: Property): PropertyResponseDto {
    const dto = new PropertyResponseDto();
    dto.id = p.id;
    dto.title = p.title;
    dto.status = p.status;
    return dto;
  }
}
```

- Every inbound field has at least one `class-validator` decorator.
- Monetary values are `@IsInt() @Min(0)` — pence, never float.
- Response DTOs never expose internal fields (Prisma IDs of relations, password hashes, etc.).
- `static fromDomain()` factory on response DTOs keeps the mapping out of controllers.

### Authentication & Authorisation

```typescript
// Guard stacking — always this order
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')

// Public route — bypass JWT
@Public()
@Post('enquiries')
async submitEnquiry() { ... }

// Ownership check in service (not guard)
private assertOwnership(resource: { userId: string }, requesterId: string): void {
  if (resource.userId !== requesterId) {
    throw new ForbiddenException('You do not own this resource');
  }
}
```

- JWT guard is applied globally. Use `@Public()` decorator to opt out.
- Role checks via `@Roles()` + `RolesGuard`.
- Ownership checks (is *this user* the owner of *this resource*) happen in the service, not the guard.
- Never return 404 for ownership failures — 403. (Don't reveal resource existence to non-owners.)

### Background Jobs (BullMQ)

```typescript
// Producer — inject the queue, add jobs
@InjectQueue('portal-sync') private readonly queue: Queue

await this.queue.add(
  'submit-listing',
  { propertyId, portal },
  {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
);

// Processor — separate service, decorate with @Processor
@Processor('portal-sync')
export class PortalSyncProcessor {
  @Process('submit-listing')
  async handleSubmit(job: Job<{ propertyId: string; portal: PortalName }>) {
    const { propertyId, portal } = job.data;
    // fetch listing, call adapter, update portal_listings row
  }
}
```

- All jobs are **idempotent** — processing the same job twice must produce the same result.
- Log job start, success, and failure with `job.id` included.
- Failed jobs after all retries must trigger an admin notification.

### Stripe Webhook Idempotency

```typescript
async handleWebhook(event: Stripe.Event): Promise<void> {
  const key = `stripe:event:${event.id}`;
  const processed = await this.redis.get(key);
  if (processed) return; // already handled

  await this.redis.set(key, '1', 'EX', 86400); // 24h TTL

  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    // ...
  }
}
```

### Error Handling

```typescript
// Expected business errors — throw NestJS exceptions from service
throw new NotFoundException(`Property ${id} not found`);
throw new ForbiddenException('You do not own this property');
throw new ConflictException('Listing limit reached for this subscription period');
throw new BadRequestException('Listing cannot be submitted — verification documents missing');

// Unexpected errors — let them bubble to the global exception filter
// DO NOT wrap everything in try/catch and swallow errors
```

---

## Best Practices

**Module public API:** Only export what other modules need. If module B needs to call
a method on module A's service, export the service from module A. Never cross-import
repositories or domain objects across module boundaries.

**Portal adapter pattern:** All portal integrations implement `IPortalAdapter`.
`PortalsService` selects the adapter by enum value and delegates. Adding a new portal
requires only a new adapter class — no changes to `PortalsService`.

**Never block the HTTP response on email/portal sync.** Enqueue via BullMQ and return.

**Pagination is mandatory.** Every repository method that returns a list accepts
`{ page: number; limit: number }` and returns `{ data: T[]; total: number }`.
Maximum `limit` is enforced at the DTO level (`@Max(100)`).

**Transactions for multi-table writes.** Use `transaction(pool, async (client) => { ... })`
from `database/helpers/query.helper.ts` whenever a business operation must write to
multiple tables atomically.

---

## Review Checklist

### Architecture
- [ ] Controller has no business logic — only routes, parses, delegates, maps
- [ ] Service has no `pool.query` calls — only repository calls and domain logic
- [ ] Repository returns domain objects, not raw `pg` row types
- [ ] No cross-module internal imports (only consuming exported module APIs)
- [ ] No circular module dependencies (`import/no-cycle` ESLint passes)

### TypeScript
- [ ] Zero TypeScript errors (`pnpm typecheck`)
- [ ] No `any`, no `!`, no `@ts-ignore`
- [ ] Response DTOs expose no internal fields (no raw pg row types in responses)

### API Correctness
- [ ] Correct HTTP status codes (201 for POST, 204 for DELETE, etc.)
- [ ] `@Public()` used for routes that should not require auth
- [ ] Ownership check present for every mutation that operates on a user-owned resource
- [ ] Pagination parameters validated with `@IsInt() @Min(1) @Max(100)` on DTOs

### DTOs & Validation
- [ ] Every inbound DTO field has at least one `class-validator` decorator
- [ ] Monetary fields are `@IsInt() @Min(0)` — not `@IsNumber()`
- [ ] `ValidationPipe` global — no need to add per-route, but check it's not excluded

### Security
- [ ] Ownership check throws `ForbiddenException`, not `NotFoundException`
- [ ] No secrets in code — all via `ConfigService`
- [ ] Stripe webhook handler verifies `Stripe-Signature` header before processing
- [ ] Goodlord webhook handler has equivalent verification

### Jobs & Side Effects
- [ ] Background jobs are idempotent (safe to run twice)
- [ ] Job has retry config with backoff
- [ ] Stripe webhook events are deduplicated via Redis
- [ ] Email and portal sync enqueued — not awaited inline

### Testing
- [ ] New service method has unit tests (mocked repository)
- [ ] New endpoint has integration test (Supertest + real DB)
- [ ] Error paths tested (not found, forbidden, conflict, validation failure)
