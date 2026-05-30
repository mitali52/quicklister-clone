# Folder Structure

Monorepo layout using Turborepo. All apps and shared packages live under one repository.

---

## Technology Choices (Summary)

| Layer | Technology |
|---|---|
| Monorepo tooling | Turborepo |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database ORM | Prisma |
| Package manager | pnpm workspaces |

---

## Top-Level Monorepo

```
quicklister-clone/
│
├── apps/
│   ├── web/                        # Next.js frontend (public site + platform app)
│   └── api/                        # NestJS REST API
│
├── packages/
│   ├── database/                   # Prisma schema, migrations, seed scripts
│   ├── types/                      # Shared TypeScript types and Zod schemas
│   ├── ui/                         # Shared React component library (shadcn/ui base)
│   ├── email/                      # Email templates (React Email)
│   └── config/                     # Shared ESLint, TypeScript, Tailwind configs
│
├── docs/                           # Project documentation (this folder)
│
├── .github/
│   └── workflows/                  # CI/CD GitHub Actions pipelines
│
├── turbo.json                      # Turborepo pipeline config
├── pnpm-workspace.yaml
├── package.json
├── .env.example
└── README.md
```

---

## `apps/web/` — Next.js Frontend

```
apps/web/
│
├── app/                            # Next.js App Router root
│   │
│   ├── (marketing)/                # Public marketing site (no auth layout)
│   │   ├── layout.tsx              # Marketing layout (nav, footer)
│   │   ├── page.tsx                # Homepage /
│   │   ├── the-platform/
│   │   │   └── page.tsx
│   │   ├── lettings/
│   │   │   └── page.tsx
│   │   ├── sales/
│   │   │   └── page.tsx
│   │   ├── commercial/
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── support/
│   │       └── page.tsx
│   │
│   ├── (search)/                   # Public property search
│   │   ├── layout.tsx
│   │   ├── search/
│   │   │   └── page.tsx            # /search — listing directory
│   │   └── property/
│   │       └── [id]/
│   │           └── page.tsx        # /property/:id — listing detail
│   │
│   ├── (auth)/                     # Authentication pages (no sidebar)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   ├── (platform)/                 # Authenticated platform app (with sidebar)
│   │   ├── layout.tsx              # Platform shell — sidebar + header
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── listings/
│   │   │   ├── page.tsx            # My Properties list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create listing wizard
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Listing detail (owner view)
│   │   │       ├── edit/
│   │   │       │   └── page.tsx
│   │   │       └── verification/
│   │   │           └── page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx            # Inbox
│   │   │   └── [threadId]/
│   │   │       └── page.tsx
│   │   ├── viewings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── referencing/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── conveyancing/
│   │   │   └── page.tsx
│   │   ├── documents/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   └── subscription/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── password/
│   │           └── page.tsx
│   │
│   ├── (admin)/                    # Admin-only section
│   │   ├── layout.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx            # Admin dashboard
│   │   │   ├── verifications/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── properties/
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │
│   ├── checkout/
│   │   ├── packages/
│   │   │   └── page.tsx
│   │   ├── page.tsx                # Stripe checkout
│   │   └── confirmation/
│   │       └── page.tsx
│   │
│   ├── api/                        # Next.js Route Handlers (thin proxies or webhooks)
│   │   └── stripe/
│   │       └── webhook/
│   │           └── route.ts        # Stripe webhook receiver (forwards to API)
│   │
│   ├── layout.tsx                  # Root layout (fonts, providers)
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                         # Primitive components (shadcn/ui installed here)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── layout/                     # Layout-level components
│   │   ├── MarketingNav.tsx
│   │   ├── MarketingFooter.tsx
│   │   ├── PlatformSidebar.tsx
│   │   ├── PlatformHeader.tsx
│   │   └── AdminSidebar.tsx
│   │
│   ├── marketing/                  # Marketing page sections
│   │   ├── HeroSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── PricingTable.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── SavingsCalculator.tsx
│   │
│   ├── listing/                    # Listing-related components
│   │   ├── ListingCard.tsx
│   │   ├── ListingDetail.tsx
│   │   ├── PhotoGallery.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── ListingStatusBadge.tsx
│   │   └── PortalStatusIndicator.tsx
│   │
│   ├── wizard/                     # Multi-step listing creation wizard
│   │   ├── WizardShell.tsx
│   │   ├── StepPropertyType.tsx
│   │   ├── StepDetails.tsx
│   │   ├── StepPhotos.tsx
│   │   ├── StepDocuments.tsx
│   │   ├── StepVerification.tsx
│   │   └── StepReview.tsx
│   │
│   ├── search/                     # Search page components
│   │   ├── SearchBar.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── SearchResults.tsx
│   │   └── PropertyMap.tsx
│   │
│   ├── messages/
│   │   ├── ThreadList.tsx
│   │   ├── MessageThread.tsx
│   │   └── MessageComposer.tsx
│   │
│   ├── checkout/
│   │   ├── PackageSelector.tsx
│   │   ├── AddOnSelector.tsx
│   │   └── StripePaymentForm.tsx
│   │
│   └── shared/                     # Generic reusable components
│       ├── FileUpload.tsx
│       ├── ConfirmDialog.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── PageHeader.tsx
│
├── hooks/                          # Custom React hooks
│   ├── useAuth.ts
│   ├── useListings.ts
│   ├── useMessages.ts
│   ├── useViewings.ts
│   ├── useUpload.ts
│   └── useDebounce.ts
│
├── lib/                            # Frontend utilities and config
│   ├── api-client.ts               # Typed fetch wrapper around the API
│   ├── auth.ts                     # Auth session helpers
│   ├── stripe.ts                   # Stripe.js loader
│   ├── formatters.ts               # Price, date, address formatters
│   └── constants.ts                # UK portals, property types, EPC ratings etc.
│
├── stores/                         # Zustand global state stores
│   ├── auth.store.ts
│   ├── wizard.store.ts             # Listing creation wizard state
│   └── notifications.store.ts
│
├── middleware.ts                   # Route protection (auth guards)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## `apps/api/` — NestJS Backend

```
apps/api/
│
├── src/
│   ├── main.ts                     # Bootstrap (port, global pipes, Swagger)
│   ├── app.module.ts               # Root module
│   │
│   ├── auth/                       # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   │
│   ├── users/                      # User profile module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   │
│   ├── properties/                 # Property listings module
│   │   ├── properties.module.ts
│   │   ├── properties.controller.ts
│   │   ├── properties.service.ts
│   │   └── dto/
│   │       ├── create-property.dto.ts
│   │       ├── update-property.dto.ts
│   │       └── search-property.dto.ts
│   │
│   ├── photos/                     # Photo upload module
│   │   ├── photos.module.ts
│   │   ├── photos.controller.ts
│   │   └── photos.service.ts
│   │
│   ├── documents/                  # Document upload module
│   │   ├── documents.module.ts
│   │   ├── documents.controller.ts
│   │   └── documents.service.ts
│   │
│   ├── verification/               # Ownership/ID verification module
│   │   ├── verification.module.ts
│   │   ├── verification.controller.ts
│   │   └── verification.service.ts
│   │
│   ├── packages/                   # Pricing packages module
│   │   ├── packages.module.ts
│   │   ├── packages.controller.ts
│   │   └── packages.service.ts
│   │
│   ├── orders/                     # Orders and billing module
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   └── orders.service.ts
│   │
│   ├── stripe/                     # Stripe integration module
│   │   ├── stripe.module.ts
│   │   ├── stripe.service.ts
│   │   └── stripe-webhook.controller.ts
│   │
│   ├── subscriptions/              # Pro Lister subscription module
│   │   ├── subscriptions.module.ts
│   │   ├── subscriptions.controller.ts
│   │   └── subscriptions.service.ts
│   │
│   ├── messages/                   # Enquiries and messaging module
│   │   ├── messages.module.ts
│   │   ├── messages.controller.ts
│   │   └── messages.service.ts
│   │
│   ├── viewings/                   # Viewing management module
│   │   ├── viewings.module.ts
│   │   ├── viewings.controller.ts
│   │   └── viewings.service.ts
│   │
│   ├── referencing/                # Goodlord tenant referencing module
│   │   ├── referencing.module.ts
│   │   ├── referencing.controller.ts
│   │   ├── referencing.service.ts
│   │   └── goodlord-webhook.controller.ts
│   │
│   ├── portals/                    # Portal syndication module
│   │   ├── portals.module.ts
│   │   ├── portals.service.ts
│   │   ├── adapters/
│   │   │   ├── portal-adapter.interface.ts
│   │   │   ├── rightmove.adapter.ts
│   │   │   ├── zoopla.adapter.ts
│   │   │   ├── onthemarket.adapter.ts
│   │   │   └── primelocation.adapter.ts
│   │   └── portal-sync.processor.ts  # BullMQ job processor
│   │
│   ├── reports/                    # Performance reports module
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   └── reports.service.ts
│   │
│   ├── admin/                      # Admin-only module
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts
│   │   └── admin.service.ts
│   │
│   ├── storage/                    # S3/file storage service
│   │   ├── storage.module.ts
│   │   └── storage.service.ts
│   │
│   ├── email/                      # Email sending service
│   │   ├── email.module.ts
│   │   └── email.service.ts
│   │
│   ├── geocoding/                  # Postcodes.io integration
│   │   ├── geocoding.module.ts
│   │   └── geocoding.service.ts
│   │
│   ├── jobs/                       # Background job definitions
│   │   ├── jobs.module.ts
│   │   ├── expire-listings.processor.ts
│   │   ├── expiry-reminders.processor.ts
│   │   ├── portal-sync.processor.ts
│   │   └── data-retention.processor.ts
│   │
│   └── common/                     # Shared utilities
│       ├── filters/
│       │   └── http-exception.filter.ts
│       ├── interceptors/
│       │   └── transform.interceptor.ts
│       ├── pipes/
│       │   └── zod-validation.pipe.ts
│       └── utils/
│           ├── pagination.ts
│           └── money.ts
│
├── test/
│   ├── e2e/
│   └── unit/
│
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## `apps/api/src/database/` — Database Layer

```
apps/api/src/database/
│
├── helpers/
│   └── query.helper.ts             # Typed query(), queryOne(), transaction() wrappers
│
├── interfaces/
│   └── migration.interface.ts      # MigrationBuilder + Migration types
│
├── migrations/                     # node-pg-migrate JS migration files
│   ├── 20260530000000-enable-pgcrypto-extension.js
│   ├── 20260530000001-create-roles-table.js
│   └── 20260530000002-create-users-table.js
│
├── seeders/
│   ├── role.seeder.ts              # Upserts admin / moderator / user roles
│   └── index.ts                    # Entry point — runs all seeders
│
├── config.js                       # node-pg-migrate connection config (per env)
├── database.config.ts              # Reads DATABASE_URL, throws if missing
├── database.module.ts              # @Global() NestJS module, exports DATABASE_POOL
└── database.providers.ts           # pg.Pool factory bound to DATABASE_POOL symbol
```

---

## `packages/types/` — Shared Types

```
packages/types/
│
├── src/
│   ├── index.ts
│   ├── user.types.ts
│   ├── property.types.ts
│   ├── listing.types.ts
│   ├── order.types.ts
│   ├── message.types.ts
│   └── api.types.ts                # API request/response shapes
│
├── package.json
└── tsconfig.json
```

---

## `packages/email/` — Email Templates

```
packages/email/
│
├── src/
│   ├── index.ts
│   └── templates/
│       ├── verify-email.tsx
│       ├── reset-password.tsx
│       ├── listing-approved.tsx
│       ├── listing-rejected.tsx
│       ├── new-enquiry.tsx
│       ├── new-reply.tsx
│       ├── expiry-reminder.tsx
│       ├── listing-expired.tsx
│       ├── reference-result.tsx
│       └── payment-receipt.tsx
│
├── package.json
└── tsconfig.json
```

---

## `packages/config/` — Shared Config

```
packages/config/
│
├── eslint/
│   ├── base.js
│   ├── next.js
│   └── nest.js
│
├── typescript/
│   ├── base.json
│   ├── next.json
│   └── nest.json
│
└── tailwind/
    └── base.ts
```

---

## `.github/workflows/` — CI/CD

```
.github/
└── workflows/
    ├── ci.yml                      # Lint, type-check, test on every PR
    ├── deploy-web.yml              # Deploy frontend to Vercel on merge to master
    ├── deploy-api.yml              # Deploy API to cloud on merge to master
    └── db-migrate.yml              # Run Prisma migrations on deploy
```
