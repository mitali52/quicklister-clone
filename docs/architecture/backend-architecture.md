# Backend Architecture

NestJS REST API with PostgreSQL, Redis, and background job processing.

---

## Technology Stack

| Concern | Library / Tool | Reason |
|---|---|---|
| Framework | NestJS | Modular, TypeScript-native, built-in DI, decorator-based |
| Language | TypeScript | Shared types with frontend |
| Database ORM | Prisma | Type-safe queries, auto-generated client, migration tooling |
| Database | PostgreSQL 16 | Relational integrity, JSONB, PostGIS for geo-search |
| Cache / Queue broker | Redis | Session blacklist, rate limiting, BullMQ job queue |
| Job queue | BullMQ | Background job processing (portal sync, email, expiry) |
| Auth | Passport.js (jwt + local) | NestJS-standard auth strategy pattern |
| Token | JWT (RS256) | Stateless auth; signed with RSA private key |
| Validation | class-validator + class-transformer | DTO validation via NestJS pipes |
| API docs | Swagger (OpenAPI 3.0) | Auto-generated from NestJS decorators |
| Password hashing | bcrypt | Industry standard, configurable rounds |
| File storage | AWS SDK v3 (S3) | Pre-signed URL generation, private document access |
| Email | Resend (or AWS SES) | Transactional email with React Email templates |
| Payments | Stripe Node SDK | PaymentIntents, Subscriptions, Webhook verification |
| Tenant referencing | Goodlord REST API | Credit/employment/landlord checks |
| Geocoding | Postcodes.io HTTP API | Postcode → lat/lng (free UK-specific API) |
| Logging | Pino (via nestjs-pino) | Structured JSON logging |
| Error tracking | Sentry | Runtime exception capture with context |
| Testing | Jest + Supertest | Unit and e2e tests |

---

## Module Architecture

NestJS uses a module system where each feature is self-contained with its own controller, service, and DTOs. Modules declare their dependencies explicitly.

```
AppModule
│
├── AuthModule
│   ├── PassportModule
│   └── JwtModule
│
├── UsersModule
├── PropertiesModule
│   └── depends on: StorageModule, GeocodingModule
│
├── PhotosModule
│   └── depends on: StorageModule
│
├── DocumentsModule
│   └── depends on: StorageModule
│
├── VerificationModule
│   └── depends on: AdminNotificationService
│
├── PackagesModule
├── OrdersModule
│   └── depends on: StripeModule, PackagesModule
│
├── StripeModule (global)
│   └── StripeWebhookController
│
├── SubscriptionsModule
│   └── depends on: StripeModule
│
├── MessagesModule
│   └── depends on: EmailModule
│
├── ViewingsModule
├── ReferencingModule
│   └── depends on: GoodlordModule, EmailModule
│
├── PortalsModule
│   └── portal adapters (Rightmove, Zoopla, OnTheMarket, PrimeLocation)
│
├── ReportsModule
├── AdminModule
├── JobsModule (global)
│   └── BullModule queues
│
├── StorageModule (global)
├── EmailModule (global)
├── GeocodingModule (global)
└── PrismaModule (global)
```

---

## Request Lifecycle

Every incoming request passes through this chain:

```
HTTP Request
    │
    ▼
Guards (JWT verification, role check)
    │
    ▼
Interceptors (request logging, response transform)
    │
    ▼
Pipes (DTO validation via class-validator)
    │
    ▼
Controller (route handler — thin, delegates to service)
    │
    ▼
Service (business logic)
    │
    ├── Prisma (database queries)
    ├── External APIs (Stripe, Goodlord, portals)
    ├── BullMQ (enqueue background jobs)
    └── EmailModule (send notifications)
    │
    ▼
Response (transformed by TransformInterceptor)
    │
    ▼
HTTP Response
```

---

## Authentication & Authorisation

### Strategy
- **JWT RS256** — asymmetric signing. Private key signs tokens (API); public key verifies them (API + optionally frontend middleware).
- Tokens are short-lived (15 minutes) with a refresh token (7-day httpOnly cookie).
- Refresh tokens are stored as a hash in Redis (allows revocation on logout).

### Token Flow
```
POST /api/auth/login
  → validate credentials
  → issue access_token (15min JWT) + set refresh_token cookie (httpOnly, 7d)

Subsequent requests:
  → Authorization: Bearer <access_token>
  → JwtStrategy validates signature + expiry
  → Attaches user to request

Token refresh:
  POST /api/auth/refresh
  → reads refresh_token cookie
  → validates hash against Redis
  → issues new access_token

Logout:
  POST /api/auth/logout
  → deletes refresh token hash from Redis
  → clears cookie
```

### Authorisation Decorators
```typescript
@Roles('admin')          // requires admin role
@UseGuards(JwtAuthGuard, RolesGuard)

@Public()                // marks route as open (no JWT required)
```

### Ownership Checks
Services check `property.user_id === request.user.id` before any mutation. A user cannot edit another user's listing even with a valid JWT.

---

## Database Layer (Prisma)

### PrismaModule
- Single `PrismaClient` instance shared globally (connection pooling)
- `onModuleInit()` calls `$connect()`
- `onModuleDestroy()` calls `$disconnect()`

### Query Patterns
```
Read (list):      prisma.property.findMany({ where, orderBy, skip, take })
Read (single):    prisma.property.findUniqueOrThrow({ where: { id } })
Create:           prisma.property.create({ data })
Update:           prisma.property.update({ where: { id }, data })
Soft actions:     update status to 'archived' rather than delete
Transactions:     prisma.$transaction([...]) for multi-table operations
```

### Location Search
Geo-radius search is handled with raw SQL when PostGIS is available:
```sql
SELECT * FROM properties
WHERE ST_DWithin(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
  $radius_metres
)
AND status = 'active'
```
Fallback (no PostGIS): bounding box filter using simple lat/lng range.

---

## Background Job Architecture (BullMQ)

All side effects that shouldn't block the HTTP response are offloaded to queues.

### Queue Definitions

| Queue | Producer | Consumer (Processor) | Jobs |
|---|---|---|---|
| `portal-sync` | VerificationService (on approve) | PortalSyncProcessor | Submit listing to each portal API |
| `email` | Any service | EmailProcessor | Send transactional email |
| `expiry-check` | Cron (daily) | ExpiryProcessor | Mark expired listings, notify owners |
| `expiry-reminder` | Cron (daily) | ExpiryReminderProcessor | 7-day and 3-day email reminders |
| `report-fetch` | Cron (weekly) | ReportFetchProcessor | Pull views/enquiry data from portals |
| `data-retention` | Cron (monthly) | DataRetentionProcessor | Delete data past retention policy |

### Job Flow Example — Listing Approval
```
Admin approves listing
  → VerificationService.approve(id)
      → prisma: update property status to 'active'
      → for each portal in package.portals_included:
          → portalSyncQueue.add('submit', { propertyId, portal })
      → emailQueue.add('listing-approved', { userId, propertyId })

PortalSyncProcessor.process({ propertyId, portal })
  → load property + photos from DB
  → call portal adapter (e.g. ZooplaAdapter.submit(listing))
  → on success: update PortalListing.status = 'live'
  → on failure: retry (3×), then set status = 'failed', alert admin
```

### Cron Schedules
```
expire-listings:    0 1 * * *   (daily at 01:00 UTC)
expiry-reminders:   0 8 * * *   (daily at 08:00 UTC)
report-fetch:       0 6 * * 1   (Mondays at 06:00 UTC)
data-retention:     0 3 1 * *   (1st of month at 03:00 UTC)
```

---

## Portal Integration Architecture

Each portal is encapsulated behind a common adapter interface, isolating the rest of the codebase from portal-specific API quirks.

```typescript
interface PortalAdapter {
  submit(listing: NormalisedListing): Promise<PortalSubmitResult>
  update(portalListingId: string, listing: NormalisedListing): Promise<void>
  remove(portalListingId: string): Promise<void>
  getStatus(portalListingId: string): Promise<PortalStatus>
}
```

`NormalisedListing` is an internal DTO that each adapter translates into the portal's required format (XML for Rightmove RTDF, JSON for Zoopla, etc.).

**PortalsService** selects the right adapter based on the `portal` enum value and delegates.

---

## Stripe Integration

### One-off Payments
```
POST /api/orders
  → OrdersService.create()
      → calculate total (package + add-ons)
      → stripe.paymentIntents.create({ amount, currency: 'gbp', metadata })
      → save Order (status: pending, stripe_payment_intent_id)
      → return client_secret to frontend

Stripe webhook: payment_intent.succeeded
  → StripeWebhookController.handleWebhook()
      → verify Stripe-Signature header
      → OrdersService.markPaid(paymentIntentId)
          → update Order status to 'paid'
          → if listing order: update Property status to 'pending_approval'
          → emailQueue: send payment receipt
```

### Subscriptions (Pro Lister)
```
POST /api/subscriptions
  → create/retrieve Stripe Customer
  → stripe.subscriptions.create({ customer, items: [price_id] })
  → save Subscription record

Stripe webhook: invoice.paid
  → SubscriptionsService.handleInvoicePaid()
      → update current_period_start / end
      → reset listings_used_this_period = 0

Stripe webhook: customer.subscription.deleted
  → SubscriptionsService.handleCancellation()
      → update status = 'cancelled'
```

All webhook handlers are **idempotent** — they check if the event has already been processed using the Stripe event ID stored in Redis.

---

## File Storage (S3)

### Photo Upload (Pre-signed URL)
```
POST /api/storage/presign { filename, contentType, propertyId }
  → StorageService.generateUploadUrl()
      → validate: contentType must be image/*
      → validate: propertyId belongs to authenticated user
      → key = properties/{propertyId}/photos/{uuid}.{ext}
      → s3.createPresignedPost({ bucket: PUBLIC_BUCKET, key, expiry: 300 })
      → return { uploadUrl, fields, publicUrl }

Client uploads directly to S3 (no API involved)

Client POSTs publicUrl to /api/properties/:id/photos
  → PhotosService.create()
      → save PropertyPhoto record
```

### Document Upload (Pre-signed URL → Private Access)
```
Same pattern but:
  → bucket: PRIVATE_BUCKET
  → no public URL returned
  → access via: GET /api/properties/:id/documents/:docId/download
      → StorageService.generateDownloadUrl()
          → s3.getSignedUrl({ key, expiry: 900 }) → short-lived signed URL
          → redirect(302) to signed URL
```

---

## Email Architecture

`EmailModule` wraps the email provider (Resend / SES) and React Email templates.

```
EmailService.send(template: EmailTemplate, to: string, data: object)
  → render React Email template to HTML
  → provider.emails.send({ from, to, subject, html })
```

All email sends go through the `email` BullMQ queue so:
- HTTP response is never delayed by email delivery
- Failed sends are retried automatically
- Failures are logged without crashing the main process

---

## Rate Limiting

Implemented with `@nestjs/throttler` backed by Redis (shared across API instances).

| Endpoint | Window | Limit |
|---|---|---|
| POST /auth/login | 15 min | 10 requests per IP |
| POST /auth/forgot-password | 60 min | 5 requests per email |
| POST /properties/:id/enquiries | 60 min | 3 requests per IP per property |
| General API (authenticated) | 60 sec | 100 requests per user |

---

## Validation

- All incoming data validated at the DTO layer using `class-validator`
- `ValidationPipe` applied globally with `whitelist: true, forbidNonWhitelisted: true`
- Unknown fields are stripped before reaching the service layer
- Zod schemas in `packages/types/` used for shared validation (API + frontend)

---

## API Response Format

All responses are normalised by `TransformInterceptor`:

```json
Success:
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 142 }   ← pagination, where applicable
}

Error:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "email": "must be a valid email" }
  }
}
```

---

## Logging & Observability

| Layer | Tool |
|---|---|
| Structured logs | nestjs-pino → JSON to stdout → collected by cloud provider |
| Error tracking | Sentry (NestJS SDK) — captures unhandled exceptions with request context |
| Health check | `@nestjs/terminus` at `GET /health` — checks DB, Redis, S3 connectivity |
| API metrics | Optional: Prometheus + Grafana via `nestjs-prometheus` |

Log fields on every request:
```json
{
  "level": "info",
  "timestamp": "2026-05-30T10:00:00Z",
  "requestId": "uuid",
  "method": "POST",
  "path": "/api/properties",
  "statusCode": 201,
  "durationMs": 45,
  "userId": "uuid"
}
```

---

## Security Checklist

| Concern | Implementation |
|---|---|
| SQL injection | Prisma parameterised queries (no raw string interpolation) |
| XSS | API is JSON-only; no HTML rendered server-side |
| CSRF | Not applicable (JWT in header, not cookies for API calls) |
| Stripe webhook spoofing | `Stripe-Signature` header verified on every webhook |
| Unauthorised property access | `user_id` ownership check in every service mutation |
| Sensitive document exposure | Documents served only via short-lived signed URLs to authenticated owner |
| Password strength | Minimum 8 chars enforced at DTO level; bcrypt rounds = 12 |
| Rate limiting | Throttler on auth endpoints to prevent brute force |
| Secrets management | All credentials in environment variables; never in code |
| CORS | Configured to allow only the frontend domain |
| Helmet | HTTP security headers via `@nestjs/helmet` |
