# Infrastructure Architecture

Cloud deployment, networking, storage, and CI/CD design.

---

## Deployment Target

Primary target: **AWS** (most complete fit for the required services).  
Simpler alternative stack noted where applicable (for solo/early-stage builds).

---

## High-Level Architecture Diagram

```
                        ┌──────────────────────────────────┐
                        │         Internet / Users          │
                        └──────────────┬───────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
    ┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐
    │   Vercel CDN    │    │  CloudFront CDN  │    │  Stripe / Portals │
    │  (Next.js Web)  │    │  (S3 Photos)     │    │  (External APIs)  │
    └────────┬────────┘    └──────────────────┘    └────────┬──────────┘
             │                                              │
             │ API calls (HTTPS)                            │ Webhooks (HTTPS)
             ▼                                              ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                         AWS VPC                                 │
    │                                                                 │
    │   ┌──────────────────────────────┐                              │
    │   │   Application Load Balancer   │  ← public subnet            │
    │   └──────────────┬───────────────┘                              │
    │                  │                                              │
    │   ┌──────────────▼───────────────┐                              │
    │   │       ECS Fargate Cluster    │  ← private subnet            │
    │   │  ┌────────────────────────┐  │                              │
    │   │  │  NestJS API  (task)    │  │                              │
    │   │  │  NestJS API  (task)    │  │  ← auto-scaled               │
    │   │  └────────────────────────┘  │                              │
    │   └──────────────────────────────┘                              │
    │                  │                                              │
    │      ┌───────────┼───────────┐                                  │
    │      ▼           ▼           ▼                                  │
    │  ┌───────┐  ┌─────────┐  ┌──────────┐                          │
    │  │  RDS  │  │ElastiCache│  │  S3     │  ← private subnet        │
    │  │Postgres│  │  Redis   │  │ Buckets │                          │
    │  └───────┘  └─────────┘  └──────────┘                          │
    └─────────────────────────────────────────────────────────────────┘
```

---

## Services Map

| Service | AWS Service | Purpose |
|---|---|---|
| Frontend | Vercel | Next.js hosting, edge CDN, automatic deployments |
| API | ECS Fargate | Containerised NestJS, auto-scaling |
| Load balancer | Application Load Balancer (ALB) | HTTPS termination, routing |
| Database | RDS PostgreSQL (Multi-AZ) | Primary relational data store |
| Cache + Queue broker | ElastiCache Redis (cluster mode) | Sessions, rate limiting, BullMQ |
| Photo storage | S3 (public bucket) + CloudFront | CDN-served listing photos |
| Document storage | S3 (private bucket) | ID docs, ownership proof — no public access |
| Container registry | ECR | Docker image storage for API deployments |
| Secrets | AWS Secrets Manager | DB credentials, API keys |
| DNS | Route 53 | Domain management |
| TLS certificates | AWS Certificate Manager | Auto-renewing HTTPS certs |
| Email | AWS SES (or Resend) | Transactional email delivery |
| Logs | CloudWatch Logs | Centralised log aggregation |
| Error tracking | Sentry (SaaS) | Runtime exceptions |
| Monitoring | CloudWatch Metrics + Alarms | CPU, memory, DB connections |
| CI/CD | GitHub Actions | Build, test, deploy pipelines |

---

## Networking

### VPC Layout

```
VPC: 10.0.0.0/16
│
├── Public Subnets (2 AZs)          — ALB, NAT Gateway
│   ├── 10.0.1.0/24  (eu-west-2a)
│   └── 10.0.2.0/24  (eu-west-2b)
│
└── Private Subnets (2 AZs)         — ECS tasks, RDS, Redis
    ├── 10.0.3.0/24  (eu-west-2a)
    └── 10.0.4.0/24  (eu-west-2b)
```

**Inbound rules:**
- ALB accepts HTTPS (443) from the internet
- ECS tasks accept traffic **only from ALB security group** (no direct internet access)
- RDS accepts traffic **only from ECS security group**
- Redis accepts traffic **only from ECS security group**

**Outbound rules:**
- ECS tasks route outbound internet traffic through a **NAT Gateway** (to reach Stripe, Goodlord, portal APIs, Postcodes.io, SES)

**Region:** `eu-west-2` (London) — closest to UK users and UK property portal APIs.

---

## Compute — ECS Fargate

### API Service
```
Task definition:
  CPU:    512 (0.5 vCPU)
  Memory: 1024 MB
  Image:  ECR → quicklister/api:latest

Auto-scaling:
  Min tasks:     2 (HA across 2 AZs)
  Max tasks:     10
  Scale-out:     CPU > 70% for 2 minutes
  Scale-in:      CPU < 30% for 10 minutes

Health check:   GET /health → 200 OK
Deployment:     Rolling update (min 50% healthy)
```

### BullMQ Worker Service (Job Processor)
```
Separate ECS service (not behind ALB — processes queue only)
  CPU:    256 (0.25 vCPU)
  Memory: 512 MB
  Image:  Same ECR image, different CMD (starts job processors only)

Auto-scaling:
  Min tasks: 1
  Max tasks: 4
  Scale metric: Redis queue depth (custom CloudWatch metric)
```

---

## Database — RDS PostgreSQL

```
Engine:           PostgreSQL 16
Instance class:   db.t3.medium (2 vCPU, 4 GB RAM)
Storage:          100 GB gp3 SSD, auto-scaling enabled
Multi-AZ:         Yes (automatic standby in second AZ)
Backups:          Daily automated snapshots, 7-day retention
Encryption:       AES-256 at rest
Extensions:       pg_uuid_ossp, PostGIS (for geo-radius search)
Connection pool:  PgBouncer sidecar in ECS task (or RDS Proxy)
```

**Connection limit strategy:**
- ECS tasks use PgBouncer in transaction pooling mode
- Each NestJS instance holds max 5 PgBouncer connections
- PgBouncer holds a configurable pool size against RDS (e.g., 20 connections)
- Prevents connection exhaustion during scale-out

---

## Cache & Queue — ElastiCache Redis

```
Engine:       Redis 7
Mode:         Cluster (2 shards × 1 replica each)
Instance:     cache.t3.micro per node (early stage)
Encryption:   In-transit (TLS) + at-rest
Auth:         Redis AUTH token

Uses:
  - BullMQ job queues (portal-sync, email, expiry, reports)
  - Stripe webhook idempotency keys
  - Rate limiter counters (NestJS Throttler)
  - Refresh token hashes (revocation store)
  - Short-lived geocoding cache (postcode → lat/lng)
```

---

## File Storage — S3

### Public Photos Bucket
```
Bucket:       quicklister-photos-prod
Access:       Public read (CloudFront as origin)
Structure:    properties/{propertyId}/photos/{uuid}-{size}.webp
Sizes:        original, 1200w, 800w, 400w (thumb)
Processing:   Lambda@Edge or separate Lambda triggered on S3 upload event
Lifecycle:    No expiry (deleted when property archived via application)
CORS:         PUT allowed from quicklister.co.uk (pre-signed upload)
```

### Private Documents Bucket
```
Bucket:         quicklister-documents-prod
Access:         No public access — bucket policy blocks all public access
Structure:      properties/{propertyId}/docs/{uuid}.{ext}
Encryption:     SSE-S3 (AES-256)
Signed URLs:    900-second TTL (served via API endpoint)
Lifecycle:      S3 Object Expiry rule for documents > 12 months (backed by DB retention job)
```

### CloudFront Distribution (Photos CDN)
```
Origin:           quicklister-photos-prod S3 bucket
Edge locations:   Global (UK + EU priority)
Cache TTL:        1 year (photos are immutable — new upload = new key)
HTTPS:            Enforced, ACM certificate
Custom domain:    cdn.quicklister.co.uk
```

---

## DNS & SSL — Route 53 + ACM

```
quicklister.co.uk           → Vercel (A record / CNAME)
www.quicklister.co.uk       → Vercel
platform.quicklister.co.uk  → ALB (CNAME)
api.quicklister.co.uk       → ALB (CNAME)
cdn.quicklister.co.uk       → CloudFront (CNAME)

TLS certificates:
  *.quicklister.co.uk       → ACM (auto-renewed)
  quicklister.co.uk         → ACM
```

---

## Email — AWS SES

```
Region:           eu-west-1 (SES in Ireland — supports EU sending)
Domain:           mail.quicklister.co.uk (DKIM + SPF + DMARC configured)
Sending limit:    Start in sandbox → request production access
Bounce handling:  SES → SNS → Lambda → unsubscribe in DB
Complaint handling: SES → SNS → Lambda → flag user in DB
Templates:        Rendered by React Email in API, sent as raw HTML
```

---

## CI/CD Pipeline — GitHub Actions

### Pull Request Pipeline (`ci.yml`)
```
Trigger: any PR to main

Jobs (run in parallel):
  lint-web:       pnpm turbo lint --filter=web
  lint-api:       pnpm turbo lint --filter=api
  typecheck:      pnpm turbo typecheck
  test-api:       pnpm turbo test --filter=api (Jest unit tests)
  test-e2e:       pnpm turbo test:e2e --filter=api (Supertest against test DB)
  build-check:    pnpm turbo build (ensures both apps compile)
```

### Deploy Frontend (`deploy-web.yml`)
```
Trigger: push to main

Steps:
  1. Checkout
  2. Vercel CLI: vercel --prod
     (Vercel auto-detects Next.js, builds and deploys)
```

### Deploy API (`deploy-api.yml`)
```
Trigger: push to main (after CI passes)

Steps:
  1. Checkout
  2. Configure AWS credentials (OIDC — no long-lived keys)
  3. Build Docker image: docker build -t quicklister/api .
  4. Push to ECR: docker push {ECR_URL}/quicklister/api:latest
  5. Run DB migrations: npm run db:migrate (via ECS run-task)
     (connects to RDS via bastion or ECS task)
  6. Update ECS service: aws ecs update-service --force-new-deployment
  7. Wait for deployment stable: aws ecs wait services-stable
```

### Migration Pipeline (`db-migrate.yml`)
```
Trigger: manually dispatched or called by deploy-api.yml

Steps:
  1. Run node-pg-migrate via ECS run-task
     (uses same VPC — can reach RDS in private subnet)
  2. Report success or failure to GitHub
```

---

## Environments

| Environment | Frontend | API | Database | Purpose |
|---|---|---|---|---|
| `development` | localhost:3000 | localhost:4000 | Docker Compose PostgreSQL + Redis | Local development |
| `preview` | Vercel preview URL | n/a (uses production API or staging) | n/a | PR preview links |
| `staging` | staging.quicklister.co.uk | api-staging.quicklister.co.uk | RDS (separate instance) | Pre-production testing |
| `production` | quicklister.co.uk | api.quicklister.co.uk | RDS Multi-AZ | Live |

---

## Local Development Setup

```
docker-compose.yml services:
  postgres:   postgres:16-alpine, port 5432
  redis:      redis:7-alpine, port 6379

Root commands (via turbo):
  pnpm dev          → starts web (port 3000) + api (port 4000) concurrently
  npm run db:migrate         → node-pg-migrate up (runs pending migrations)
  npm run db:migrate:down    → node-pg-migrate down (rolls back last migration)
  npm run db:migrate:create  → scaffold new migration file
  npm run db:seed            → ts-node src/database/seeders/index.ts
  pnpm build        → production build (both apps)
  pnpm test         → run all tests
```

Environment files:
```
.env.example                    → committed, no secrets
.env.local                      → gitignored, developer machine
apps/web/.env.local             → Next.js env (NEXT_PUBLIC_*)
apps/api/.env                   → NestJS env
apps/api/.env                   → DATABASE_URL for node-pg-migrate and pg Pool
```

---

## Monitoring & Alerting

| Signal | Tool | Alert Condition |
|---|---|---|
| API error rate | CloudWatch → ALB 5xx metrics | > 1% 5xx for 5 min → PagerDuty |
| API latency | CloudWatch → ALB TargetResponseTime | p95 > 2s for 5 min → Slack |
| DB CPU | CloudWatch → RDS CPUUtilization | > 80% for 10 min → Slack |
| DB connections | CloudWatch → RDS DatabaseConnections | > 80% of max → Slack |
| Redis memory | CloudWatch → ElastiCache FreeableMemory | < 20% → Slack |
| Failed portal syncs | Application log metric filter | Any portal sync error → Slack |
| Stripe webhook failures | CloudWatch → API log filter | Stripe webhook 400/500 → Slack |
| ECS task health | CloudWatch → ECS service metrics | Unhealthy task count > 0 → PagerDuty |

---

## Simpler Alternative Stack (Early Stage / Solo Build)

If full AWS infra is overkill for an MVP, this stack covers the same needs at lower ops cost:

| Concern | Alternative |
|---|---|
| API hosting | Railway or Render (Docker deploy, no ECS needed) |
| Database | Railway PostgreSQL or Supabase |
| Redis | Railway Redis or Upstash (serverless Redis) |
| File storage | Cloudflare R2 (S3-compatible, cheaper egress) |
| Email | Resend (simpler API than SES) |
| Monitoring | Better Stack (Logtail + Uptime) |
| Secrets | .env via platform dashboard |

All application code remains identical — only the infrastructure provider changes. Migrate to AWS when traffic justifies it.

---

## Cost Estimate (Production — Low Traffic)

| Service | Monthly Cost (approx.) |
|---|---|
| Vercel Pro (frontend) | $20 |
| ECS Fargate (2 tasks × 0.5 vCPU / 1GB) | ~$30 |
| RDS db.t3.medium Multi-AZ | ~$70 |
| ElastiCache cache.t3.micro × 2 | ~$30 |
| S3 + CloudFront (10 GB storage, 50 GB transfer) | ~$5 |
| RDS Proxy / PgBouncer | ~$15 |
| ALB | ~$20 |
| SES (10,000 emails) | ~$1 |
| Route 53 | ~$2 |
| **Total** | **~$193/month** |

Railway alternative (MVP): ~$40–60/month total.
