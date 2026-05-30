# Database Requirements

Schema design, indexes, constraints, and storage considerations.

---

## Technology Recommendations

| Concern | Recommendation | Reason |
|---|---|---|
| Primary database | PostgreSQL | Relational integrity, JSONB for flex fields, PostGIS for location search |
| Location search | PostGIS extension | Radius-based property search by lat/lng |
| File storage | AWS S3 / Cloudflare R2 | Photos (public CDN), documents (private bucket) |
| Cache | Redis | Session tokens, rate limiting, webhook idempotency |
| Search | Postgres full-text OR Meilisearch | Property title/description search |
| Background jobs | Redis + BullMQ / Sidekiq | Portal syndication, email sending, report generation |

---

## Full Schema (SQL)

```sql
-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'seller', 'landlord', 'commercial_owner', 'pro_lister', 'admin'
);

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  full_name         TEXT NOT NULL,
  phone_number      TEXT,
  address_line1     TEXT,
  address_line2     TEXT,
  city              TEXT,
  county            TEXT,
  postcode          TEXT,
  role              user_role NOT NULL DEFAULT 'landlord',
  email_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  nrla_member       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);


-- ─────────────────────────────────────────────
-- PROPERTIES
-- ─────────────────────────────────────────────
CREATE TYPE property_listing_type AS ENUM (
  'residential_sale', 'residential_let', 'commercial_sale', 'commercial_let'
);

CREATE TYPE property_status AS ENUM (
  'draft', 'pending_approval', 'approved', 'active',
  'paused', 'expired', 'sold', 'let', 'rejected', 'archived'
);

CREATE TYPE property_type AS ENUM (
  'detached', 'semi_detached', 'terraced', 'flat', 'bungalow',
  'office', 'retail', 'light_industrial', 'land', 'other'
);

CREATE TYPE epc_rating AS ENUM ('A','B','C','D','E','F','G');

CREATE TYPE furnished_status AS ENUM (
  'furnished', 'unfurnished', 'part_furnished'
);

CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            property_listing_type NOT NULL,
  status          property_status NOT NULL DEFAULT 'draft',
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  address_line1   TEXT NOT NULL DEFAULT '',
  address_line2   TEXT,
  city            TEXT NOT NULL DEFAULT '',
  county          TEXT,
  postcode        TEXT NOT NULL DEFAULT '',
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  asking_price    INTEGER,            -- pence, sales
  monthly_rent    INTEGER,            -- pence, lettings
  bedrooms        SMALLINT,
  bathrooms       SMALLINT,
  property_type   property_type,
  square_footage  INTEGER,
  available_from  DATE,               -- lettings
  furnished       furnished_status,   -- lettings
  epc_rating      epc_rating,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ
);

CREATE INDEX idx_properties_user_id   ON properties(user_id);
CREATE INDEX idx_properties_status    ON properties(status);
CREATE INDEX idx_properties_type      ON properties(type);
CREATE INDEX idx_properties_postcode  ON properties(postcode);
-- For location-radius search (requires PostGIS):
-- CREATE INDEX idx_properties_location ON properties USING GIST(
--   ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
-- );


-- ─────────────────────────────────────────────
-- PROPERTY PHOTOS
-- ─────────────────────────────────────────────
CREATE TABLE property_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  storage_key   TEXT NOT NULL,
  url           TEXT NOT NULL,
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  width         INTEGER,
  height        INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_photos_property_id ON property_photos(property_id);


-- ─────────────────────────────────────────────
-- PROPERTY DOCUMENTS
-- ─────────────────────────────────────────────
CREATE TYPE document_type AS ENUM (
  'floorplan', 'epc_certificate', 'gas_safety', 'electrical_cert',
  'ownership_proof', 'photo_id', 'other'
);

CREATE TABLE property_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type          document_type NOT NULL,
  filename      TEXT NOT NULL,
  storage_key   TEXT NOT NULL,   -- private bucket key
  mime_type     TEXT,
  size_bytes    INTEGER,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);


-- ─────────────────────────────────────────────
-- PACKAGES
-- ─────────────────────────────────────────────
CREATE TYPE package_category AS ENUM (
  'residential_sales', 'residential_lettings',
  'commercial_sales', 'commercial_lettings'
);

CREATE TYPE billing_cycle AS ENUM ('one_off', 'monthly', 'yearly');

CREATE TABLE packages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  category            package_category NOT NULL,
  price_pence         INTEGER NOT NULL,
  duration_value      SMALLINT NOT NULL,
  duration_unit       TEXT NOT NULL CHECK (duration_unit IN ('weeks','months','years')),
  portals_included    JSONB NOT NULL DEFAULT '[]',   -- ["zoopla","rightmove",...]
  max_listings        SMALLINT,                      -- Pro Lister only
  billing_cycle       billing_cycle NOT NULL DEFAULT 'one_off',
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- ADD-ONS
-- ─────────────────────────────────────────────
CREATE TABLE add_ons (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  price_pence             INTEGER NOT NULL,
  applicable_categories   JSONB NOT NULL DEFAULT '[]',
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

CREATE TABLE orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES users(id),
  property_id               UUID REFERENCES properties(id),  -- nullable for subscriptions
  package_id                UUID NOT NULL REFERENCES packages(id),
  add_ons                   JSONB NOT NULL DEFAULT '[]',      -- array of add_on ids
  subtotal_pence            INTEGER NOT NULL,
  total_pence               INTEGER NOT NULL,
  stripe_payment_intent_id  TEXT UNIQUE,
  stripe_status             TEXT,
  status                    order_status NOT NULL DEFAULT 'pending',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at                   TIMESTAMPTZ
);

CREATE INDEX idx_orders_user_id                   ON orders(user_id);
CREATE INDEX idx_orders_property_id               ON orders(property_id);
CREATE INDEX idx_orders_stripe_payment_intent_id  ON orders(stripe_payment_intent_id);


-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS (PRO LISTER)
-- ─────────────────────────────────────────────
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'unpaid');

CREATE TABLE subscriptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES users(id) UNIQUE,
  package_id                  UUID NOT NULL REFERENCES packages(id),
  stripe_subscription_id      TEXT UNIQUE NOT NULL,
  stripe_customer_id          TEXT NOT NULL,
  status                      subscription_status NOT NULL DEFAULT 'active',
  current_period_start        TIMESTAMPTZ NOT NULL,
  current_period_end          TIMESTAMPTZ NOT NULL,
  listings_used_this_period   SMALLINT NOT NULL DEFAULT 0,
  max_listings_per_period     SMALLINT NOT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at                TIMESTAMPTZ
);


-- ─────────────────────────────────────────────
-- OWNERSHIP VERIFICATIONS
-- ─────────────────────────────────────────────
CREATE TYPE kyc_status AS ENUM ('pending', 'passed', 'failed');
CREATE TYPE aml_status AS ENUM ('not_required', 'pending', 'passed', 'failed');
CREATE TYPE ownership_doc_type AS ENUM (
  'land_registry', 'mortgage_statement', 'property_deeds',
  'solicitor_letter', 'buildings_insurance', 'service_charge_statement'
);

CREATE TABLE ownership_verifications (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES users(id),
  property_id               UUID NOT NULL REFERENCES properties(id) UNIQUE,
  id_document_key           TEXT NOT NULL,       -- private storage
  ownership_document_key    TEXT NOT NULL,       -- private storage
  ownership_document_type   ownership_doc_type NOT NULL,
  kyc_status                kyc_status NOT NULL DEFAULT 'pending',
  aml_status                aml_status NOT NULL DEFAULT 'not_required',
  rejection_reason          TEXT,
  reviewed_by               UUID REFERENCES users(id),
  reviewed_at               TIMESTAMPTZ,
  submitted_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ownership_verifications_kyc_status ON ownership_verifications(kyc_status);
CREATE INDEX idx_ownership_verifications_property_id ON ownership_verifications(property_id);


-- ─────────────────────────────────────────────
-- PORTAL LISTINGS
-- ─────────────────────────────────────────────
CREATE TYPE portal_name AS ENUM ('rightmove', 'zoopla', 'onthemarket', 'primelocation');
CREATE TYPE portal_status AS ENUM ('pending', 'live', 'expired', 'removed', 'failed');

CREATE TABLE portal_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portal            portal_name NOT NULL,
  portal_listing_id TEXT,
  status            portal_status NOT NULL DEFAULT 'pending',
  error_message     TEXT,
  submitted_at      TIMESTAMPTZ,
  live_at           TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  UNIQUE (property_id, portal)
);

CREATE INDEX idx_portal_listings_property_id ON portal_listings(property_id);
CREATE INDEX idx_portal_listings_status      ON portal_listings(status);


-- ─────────────────────────────────────────────
-- MESSAGE THREADS
-- ─────────────────────────────────────────────
CREATE TABLE message_threads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_user_id    UUID NOT NULL REFERENCES users(id),
  prospect_name    TEXT NOT NULL,
  prospect_email   TEXT NOT NULL,
  prospect_phone   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_threads_owner_user_id ON message_threads(owner_user_id);
CREATE INDEX idx_message_threads_property_id   ON message_threads(property_id);
CREATE INDEX idx_message_threads_last_message  ON message_threads(last_message_at DESC);


-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
CREATE TYPE sender_type AS ENUM ('owner', 'prospect');

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_type  sender_type NOT NULL,
  body         TEXT NOT NULL,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at      TIMESTAMPTZ
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sent_at   ON messages(sent_at);


-- ─────────────────────────────────────────────
-- VIEWINGS
-- ─────────────────────────────────────────────
CREATE TYPE viewing_status AS ENUM (
  'requested', 'confirmed', 'cancelled', 'completed'
);

CREATE TABLE viewings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  prospect_name       TEXT NOT NULL,
  prospect_email      TEXT NOT NULL,
  prospect_phone      TEXT,
  proposed_datetime   TIMESTAMPTZ NOT NULL,
  status              viewing_status NOT NULL DEFAULT 'requested',
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_viewings_property_id ON viewings(property_id);
CREATE INDEX idx_viewings_proposed_datetime ON viewings(proposed_datetime);


-- ─────────────────────────────────────────────
-- TENANT REFERENCES
-- ─────────────────────────────────────────────
CREATE TYPE reference_status AS ENUM (
  'pending', 'in_progress', 'passed', 'failed'
);

CREATE TABLE tenant_references (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           UUID NOT NULL REFERENCES properties(id),
  applicant_name        TEXT NOT NULL,
  applicant_email       TEXT NOT NULL,
  goodlord_reference_id TEXT,
  checks                JSONB NOT NULL DEFAULT '{}',
  status                reference_status NOT NULL DEFAULT 'pending',
  cost_pence            INTEGER NOT NULL DEFAULT 2500,
  ordered_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX idx_tenant_references_property_id ON tenant_references(property_id);


-- ─────────────────────────────────────────────
-- PERFORMANCE REPORTS
-- ─────────────────────────────────────────────
CREATE TABLE performance_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  portal        portal_name NOT NULL,
  views         INTEGER NOT NULL DEFAULT 0,
  enquiries     INTEGER NOT NULL DEFAULT 0,
  period_start  DATE NOT NULL,
  period_end    DATE NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_performance_reports_property_id ON performance_reports(property_id);


-- ─────────────────────────────────────────────
-- PASSWORD RESET TOKENS
-- ─────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Key Indexes Summary

| Table | Index Column(s) | Reason |
|---|---|---|
| users | email | Login and uniqueness checks |
| properties | user_id | Load user's own listings |
| properties | status | Filter active/pending queues |
| properties | postcode, lat/lng | Location-based search |
| property_photos | property_id | Load photos for a listing |
| orders | stripe_payment_intent_id | Stripe webhook lookup |
| ownership_verifications | kyc_status | Admin approval queue |
| portal_listings | property_id, status | Sync status display |
| message_threads | owner_user_id | Load inbox |
| message_threads | last_message_at DESC | Sort inbox by recency |
| messages | thread_id | Load thread conversation |

---

## Storage Architecture

### Public CDN Bucket (Photos)
- Provider: AWS S3 + CloudFront (or Cloudflare R2 + Cloudflare CDN)
- Access: Public read
- Structure: `properties/{property_id}/photos/{uuid}.{ext}`
- Variants: Original, 1200w, 800w, 400w (thumb) — generated on upload
- Upload: Pre-signed URL issued by API; client uploads directly to S3

### Private Secure Bucket (Documents)
- Provider: AWS S3 with no public access
- Access: Private — served via signed URLs with short TTL (15 min)
- Structure: `properties/{property_id}/docs/{uuid}.{ext}`
- Encryption: AES-256 server-side encryption at rest
- Retention: 12 months post-relationship, then auto-deleted (per privacy policy)

---

## Data Retention Policy

| Data Type | Retention Period | Deletion Method |
|---|---|---|
| User account | While active + 12 months post-closure | Scheduled job |
| Property listings | 12 months after expiry/archive | Scheduled job |
| Documents (ID, ownership) | 12 months post-relationship | Scheduled job + S3 lifecycle rule |
| Messages | 12 months post-listing archive | Scheduled job |
| Payment records | 7 years (UK financial regulation) | Retained, access restricted |
| Performance reports | 2 years | Scheduled job |

---

## Background Job Requirements

| Job | Trigger | Description |
|---|---|---|
| `geocode_property` | On property address save | Convert postcode → lat/lng via Postcodes.io API |
| `submit_to_portal` | On listing approval | POST listing to each included portal API |
| `expire_listings` | Daily cron | Move listings past expires_at to "expired" status |
| `send_expiry_reminders` | Daily cron | Email owners 7 days and 3 days before expiry |
| `sync_portal_status` | Daily cron | Poll portals for live/expired status updates |
| `fetch_portal_reports` | Weekly cron | Pull views/enquiries data from portal APIs |
| `purge_expired_data` | Monthly cron | Delete data past retention policy dates |
| `reset_subscription_counters` | Stripe webhook (invoice.paid) | Reset listings_used_this_period counter |
