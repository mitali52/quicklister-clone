# Data Entities

All data models with field definitions, types, and relationships.

---

## User

```
users
├── id                    UUID / PK
├── email                 string, unique, required
├── password_hash         string, required
├── full_name             string, required
├── phone_number          string, nullable
├── address_line1         string, nullable
├── address_line2         string, nullable
├── city                  string, nullable
├── county                string, nullable
├── postcode              string, nullable
├── role                  enum: seller | landlord | commercial_owner | pro_lister | admin
├── email_verified        boolean, default false
├── nrla_member           boolean, default false
├── created_at            timestamp
└── updated_at            timestamp
```

**Relationships:**
- Has many `Properties`
- Has many `Orders`
- Has one `Subscription` (Pro Lister only)
- Has many `OwnershipVerifications`

---

## Property

```
properties
├── id                    UUID / PK
├── user_id               UUID, FK → users.id
├── type                  enum: residential_sale | residential_let | commercial_sale | commercial_let
├── status                enum: draft | pending_approval | active | paused | expired | sold | let | rejected
├── title                 string, required
├── description           text, required
├── address_line1         string, required
├── address_line2         string, nullable
├── city                  string, required
├── county                string, nullable
├── postcode              string, required
├── latitude              float, nullable (geocoded from postcode)
├── longitude             float, nullable
├── asking_price          integer (pence), nullable (sales)
├── monthly_rent          integer (pence), nullable (lettings)
├── bedrooms              integer, nullable
├── bathrooms             integer, nullable
├── property_type         enum: detached | semi_detached | terraced | flat | bungalow |
│                               office | retail | light_industrial | land | other
├── square_footage        integer, nullable
├── available_from        date, nullable (lettings)
├── furnished             enum: furnished | unfurnished | part_furnished, nullable (lettings)
├── epc_rating            enum: A | B | C | D | E | F | G, nullable
├── created_at            timestamp
├── updated_at            timestamp
└── expires_at            timestamp (set on approval: +6 weeks lettings, +3 months sales)
```

**Relationships:**
- Belongs to `User`
- Has many `PropertyPhotos`
- Has many `PropertyDocuments`
- Has one `OwnershipVerification`
- Has many `PortalListings`
- Has many `MessageThreads`
- Has many `Viewings`
- Has many `TenantReferences`
- Has many `PerformanceReports`
- Has many `Orders` (via package purchases)

---

## PropertyPhoto

```
property_photos
├── id                    UUID / PK
├── property_id           UUID, FK → properties.id
├── storage_key           string (CDN/S3 object key)
├── url                   string (CDN URL)
├── sort_order            integer (determines display order)
├── is_primary            boolean, default false (cover photo)
├── width                 integer, nullable
├── height                integer, nullable
└── created_at            timestamp
```

---

## PropertyDocument

```
property_documents
├── id                    UUID / PK
├── property_id           UUID, FK → properties.id
├── type                  enum: floorplan | epc_certificate | gas_safety | electrical_cert |
│                               ownership_proof | photo_id | other
├── filename              string
├── storage_key           string (private, encrypted storage)
├── mime_type             string
├── size_bytes            integer
└── uploaded_at           timestamp
```

---

## Package

```
packages
├── id                    UUID / PK
├── name                  string (e.g. "Saver", "Exposure", "Premium", "Pro Lister Monthly")
├── category              enum: residential_sales | residential_lettings | commercial_sales | commercial_lettings
├── price_gbp_pence       integer
├── duration_value        integer (e.g. 6, 3)
├── duration_unit         enum: weeks | months | years
├── portals_included      JSON array: ["zoopla", "onthemarket", "rightmove", "primelocation"]
├── max_listings          integer, nullable (Pro Lister plans only)
├── billing_cycle         enum: one_off | monthly | yearly
├── is_active             boolean
└── created_at            timestamp
```

---

## AddOn

```
add_ons
├── id                    UUID / PK
├── name                  string (e.g. "Rightmove", "AML Check", "Professional Photography")
├── price_gbp_pence       integer
├── applicable_categories JSON array of package categories this add-on can be applied to
├── is_active             boolean
└── created_at            timestamp
```

---

## Order

```
orders
├── id                    UUID / PK
├── user_id               UUID, FK → users.id
├── property_id           UUID, FK → properties.id, nullable (subscription orders have no single property)
├── package_id            UUID, FK → packages.id
├── add_ons               JSON array of add_on ids purchased
├── subtotal_pence        integer
├── total_pence           integer (after discounts)
├── stripe_payment_intent_id  string, unique
├── stripe_status         string (from Stripe: requires_payment_method | processing | succeeded | failed)
├── status                enum: pending | paid | refunded | failed
├── created_at            timestamp
└── paid_at               timestamp, nullable
```

---

## Subscription (Pro Lister)

```
subscriptions
├── id                    UUID / PK
├── user_id               UUID, FK → users.id
├── package_id            UUID, FK → packages.id
├── stripe_subscription_id string, unique
├── stripe_customer_id    string
├── status                enum: active | cancelled | past_due | unpaid
├── current_period_start  timestamp
├── current_period_end    timestamp
├── listings_used_this_period integer, default 0
├── max_listings_per_period   integer (from package)
├── created_at            timestamp
└── cancelled_at          timestamp, nullable
```

---

## OwnershipVerification

```
ownership_verifications
├── id                    UUID / PK
├── user_id               UUID, FK → users.id
├── property_id           UUID, FK → properties.id
├── id_document_key       string (secure storage key)
├── ownership_document_key string (secure storage key)
├── ownership_document_type enum: land_registry | mortgage_statement | property_deeds |
│                                  solicitor_letter | buildings_insurance | service_charge_statement
├── kyc_status            enum: pending | passed | failed
├── aml_status            enum: not_required | pending | passed | failed
├── rejection_reason      text, nullable
├── reviewed_by           UUID, FK → users.id (admin), nullable
├── reviewed_at           timestamp, nullable
└── submitted_at          timestamp
```

---

## PortalListing

```
portal_listings
├── id                    UUID / PK
├── property_id           UUID, FK → properties.id
├── portal                enum: rightmove | zoopla | onthemarket | primelocation
├── portal_listing_id     string, nullable (external ID returned by portal API)
├── status                enum: pending | live | expired | removed | failed
├── error_message         text, nullable
├── submitted_at          timestamp, nullable
├── live_at               timestamp, nullable
└── expires_at            timestamp, nullable
```

---

## MessageThread

```
message_threads
├── id                    UUID / PK
├── property_id           UUID, FK → properties.id
├── owner_user_id         UUID, FK → users.id
├── prospect_name         string
├── prospect_email        string
├── prospect_phone        string, nullable
├── created_at            timestamp
└── last_message_at       timestamp
```

---

## Message

```
messages
├── id                    UUID / PK
├── thread_id             UUID, FK → message_threads.id
├── sender_type           enum: owner | prospect
├── body                  text
├── sent_at               timestamp
└── read_at               timestamp, nullable
```

---

## Viewing

```
viewings
├── id                    UUID / PK
├── property_id           UUID, FK → properties.id
├── prospect_name         string
├── prospect_email        string
├── prospect_phone        string, nullable
├── proposed_datetime     timestamp
├── status                enum: requested | confirmed | cancelled | completed
├── notes                 text, nullable
└── created_at            timestamp
```

---

## TenantReference

```
tenant_references
├── id                    UUID / PK
├── property_id           UUID, FK → properties.id
├── applicant_name        string
├── applicant_email       string
├── goodlord_reference_id string, nullable (external ID from Goodlord)
├── checks                JSON: { credit: bool, employment: bool, affordability: bool, previous_landlord: bool }
├── status                enum: pending | in_progress | passed | failed
├── cost_pence            integer (2500 = £25.00)
├── ordered_at            timestamp
└── completed_at          timestamp, nullable
```

---

## PerformanceReport

```
performance_reports
├── id                    UUID / PK
├── property_id           UUID, FK → properties.id
├── portal                enum: rightmove | zoopla | onthemarket | primelocation | quicklister
├── views                 integer
├── enquiries             integer
├── period_start          date
├── period_end            date
└── generated_at          timestamp
```

---

## Entity Relationship Summary

```
User ─────────────────────────── 1:N ── Property
User ─────────────────────────── 1:N ── Order
User ─────────────────────────── 1:1 ── Subscription (Pro Lister)
Property ─────────────────────── 1:N ── PropertyPhoto
Property ─────────────────────── 1:N ── PropertyDocument
Property ─────────────────────── 1:1 ── OwnershipVerification
Property ─────────────────────── 1:N ── PortalListing
Property ─────────────────────── 1:N ── MessageThread
MessageThread ────────────────── 1:N ── Message
Property ─────────────────────── 1:N ── Viewing
Property ─────────────────────── 1:N ── TenantReference
Property ─────────────────────── 1:N ── PerformanceReport
Package ──────────────────────── 1:N ── Order
Package ──────────────────────── 1:N ── Subscription
AddOn ────────────────────────── M:N ── Order (via orders.add_ons JSON)
```
