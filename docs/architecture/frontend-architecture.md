# Frontend Architecture

Next.js 15 application using the App Router, TypeScript, and Tailwind CSS.

---

## Technology Stack

| Concern | Library / Tool | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG for SEO on listing pages, file-based routing, Server Components |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS | Utility-first, consistent with rapid UI development |
| Component library | shadcn/ui | Accessible, unstyled primitives built on Radix UI |
| Icons | Lucide React | Consistent icon set |
| Data fetching | TanStack Query (React Query) | Cache management, background refetch, loading/error states |
| Forms | React Hook Form + Zod | Performant forms, schema validation shared with backend |
| Global state | Zustand | Lightweight — auth session, wizard progress, notifications |
| Animations | Framer Motion | Page transitions, photo gallery, accordion effects |
| Payments | Stripe.js + @stripe/react-stripe-js | PCI-compliant card input, payment element |
| Drag-and-drop | dnd-kit | Photo reordering in listing wizard |
| Date handling | date-fns | Viewing scheduling, expiry countdown |
| Maps | Mapbox GL JS | Property search map view |
| Rich text | Tiptap (optional) | Property description editor |
| Notifications | Sonner (toast) | In-app feedback for actions |

---

## Application Zones

The app is split into three distinct zones, each with its own layout, auth requirements, and rendering strategy.

```
┌─────────────────────────────────────────────────────┐
│  (marketing)                                        │
│  Public site — SSG/ISR                             │
│  /, /lettings, /sales, /commercial,                │
│  /pricing, /the-platform, /support                 │
├─────────────────────────────────────────────────────┤
│  (search)                                           │
│  Public listings — SSR (dynamic filters)           │
│  /search, /property/:id                            │
├─────────────────────────────────────────────────────┤
│  (platform)                                         │
│  Authenticated app — CSR (behind auth guard)       │
│  /dashboard, /listings/*, /messages/*,             │
│  /viewings/*, /billing/*, /settings/*              │
├─────────────────────────────────────────────────────┤
│  (admin)                                            │
│  Role-gated — CSR + role check                     │
│  /admin/*                                          │
└─────────────────────────────────────────────────────┘
```

---

## Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Homepage | SSG | Static content; revalidate when pricing/content changes |
| /the-platform, /lettings, /sales | SSG | Marketing content; rarely changes |
| /pricing | SSG with ISR (revalidate: 3600) | Prices may update; cached but refreshable |
| /search | SSR | Filter params are dynamic; must be server-rendered for SEO |
| /property/:id | SSR with ISR | Listing content changes (price, status); SEO critical |
| /dashboard and all platform pages | Client-side | Auth-gated; no SEO value; dynamic user data |
| /admin/* | Client-side | Staff-only; no SEO value |

---

## Authentication Flow

```
middleware.ts (Next.js Middleware)
│
├── Reads JWT from httpOnly cookie
├── Verifies token expiry
├── Checks role for /admin/* routes
│
├── Unauthenticated user → /login  (if accessing /platform/*)
├── Non-admin user → /dashboard    (if accessing /admin/*)
└── Passes: attaches user to request headers
```

- JWT stored in **httpOnly cookie** (not localStorage) to prevent XSS
- Token refresh handled silently via an `/api/auth/refresh` call
- `useAuth` hook provides current user from Zustand store, populated on app mount

---

## Data Fetching Architecture

### Server Components (marketing + search)
```
Page (Server Component)
  └── fetch() directly → API
       └── Renders HTML on server
           └── Streamed to client (React Suspense boundaries)
```

### Client Components (platform app)
```
Page (Client Component)
  └── TanStack Query useQuery()
       └── api-client.ts (typed fetch wrapper)
            └── GET /api/properties → data
                └── Cached, background-refetched, deduplicated
```

### Mutations (create, update, delete)
```
Form (React Hook Form + Zod)
  └── onSubmit → TanStack Query useMutation()
       └── api-client.ts POST/PUT/DELETE
            └── On success: invalidate relevant queries → refetch
                On error: display field-level or toast errors
```

---

## Component Architecture

Components are grouped by function, not by page. A component is only page-specific if it can never be reused.

### Layer Hierarchy
```
ui/           → Primitive: Button, Input, Dialog, Badge (shadcn/ui)
shared/       → Generic: FileUpload, ConfirmDialog, EmptyState, PageHeader
domain/       → Feature-specific: ListingCard, MessageThread, PhotoGallery
pages/        → Page sections: HeroSection, PricingTable, SearchFilters
```

### Component Conventions
- Every component is a named export (no default exports except pages)
- Props defined as `interface ComponentNameProps` in the same file
- Server Components by default; opt into `"use client"` only when needed (event handlers, hooks, browser APIs)
- `"use client"` boundary pushed as far down the tree as possible

---

## State Management

### Zustand Stores

**`auth.store.ts`**
```
- user: User | null
- isAuthenticated: boolean
- login(user) / logout()
```

**`wizard.store.ts`** — Listing creation wizard
```
- currentStep: number
- propertyType: string
- formData: Partial<CreatePropertyDto>
- setStep() / setFormData() / reset()
```

**`notifications.store.ts`**
```
- unreadCount: number (messages)
- increment() / reset()
```

### TanStack Query — Cache Keys Convention
```
['properties']                          → user's property list
['properties', id]                      → single property
['properties', 'search', filters]       → public search results
['messages', 'threads']                 → inbox thread list
['messages', 'threads', threadId]       → single thread messages
['packages']                            → available packages
['orders']                              → order history
['reports', propertyId]                 → performance report
```

---

## Form Architecture

All forms use **React Hook Form** with **Zod** validation schemas.

- Zod schemas live in `packages/types/` and are shared with the API
- `zodResolver` connects Zod schema to React Hook Form
- Field-level error messages displayed inline
- Disabled submit button while `isSubmitting`
- Toast notification on success or unexpected error

### Listing Creation Wizard
- Each step is an independent form (separate `useForm` instance)
- Wizard state managed in Zustand (`wizard.store.ts`)
- Step data persisted to Zustand on "Next" — survives back/forward navigation
- Final submit sends the aggregated state to the API in one call (or sequential calls: create → add photos → submit)

---

## File Upload Flow

Photos and documents use a **direct-to-S3** pattern to avoid routing large files through the API server.

```
1. User selects files in FileUpload component
2. Frontend calls POST /api/storage/presign { filename, contentType }
3. API returns: { uploadUrl (S3 pre-signed), publicUrl or key }
4. Frontend PUTs file directly to S3 uploadUrl (no API involvement)
5. Frontend sends publicUrl / key to API as part of the form payload
6. API saves the URL to the database
```

Photo upload UI (dnd-kit):
- Drop zone with file type and size validation (client-side)
- Preview thumbnails rendered from local `URL.createObjectURL()`
- Upload progress bar per file
- Drag handles for reordering after upload

---

## SEO Strategy

Property listing pages (`/property/:id`) and search (`/search`) are SSR for full crawlability.

| Element | Implementation |
|---|---|
| `<title>` | Per-page via Next.js `generateMetadata()` |
| Open Graph | Listing photo, title, price in OG tags |
| Structured data | `ListingPage` + `RealEstateListing` JSON-LD on property detail |
| Sitemap | `/sitemap.xml` — auto-generated, includes all active listing URLs |
| Robots | `/robots.txt` — index public pages, noindex platform pages |
| Canonical URLs | Set on all SSR pages |

---

## Error Handling

| Scenario | Handling |
|---|---|
| API 401 | Redirect to /login, clear auth store |
| API 403 | Show "Access denied" page |
| API 404 | Next.js `notFound()` → custom 404 page |
| API 500 | Toast error + Sentry error capture |
| Network failure | TanStack Query retry (3×), then error boundary |
| Form validation | Inline field errors via RHF |
| File upload failure | Per-file error state in upload component |

---

## Routing & Middleware

```
middleware.ts protects:
  /dashboard/*    → requires: isAuthenticated
  /listings/*     → requires: isAuthenticated
  /messages/*     → requires: isAuthenticated
  /viewings/*     → requires: isAuthenticated
  /billing/*      → requires: isAuthenticated
  /settings/*     → requires: isAuthenticated
  /admin/*        → requires: isAuthenticated + role === 'admin'
  /checkout/*     → requires: isAuthenticated

Public (no middleware):
  /
  /search
  /property/:id
  /login, /register, /forgot-password, /reset-password
  /lettings, /sales, /commercial, /the-platform, /pricing, /support
```

---

## Performance Considerations

| Concern | Approach |
|---|---|
| Image optimisation | Next.js `<Image>` with S3 CDN source, WebP conversion |
| Bundle splitting | Automatic per-route code splitting (App Router) |
| Font loading | `next/font` with `display: swap` |
| Third-party scripts | Deferred loading (Stripe.js loaded only on checkout) |
| Listing search | Debounced input (300ms) before triggering API call |
| Photo gallery | Lazy-load images below fold |
| Infinite scroll | TanStack Query `useInfiniteQuery` on search results |
| Prefetching | `<Link prefetch>` on listing cards for instant navigation |
