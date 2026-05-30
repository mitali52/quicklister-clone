# Third-Party Integrations

All external services and dependencies identified for the Quicklister platform.

---

## Payment Processing — Stripe

| Detail | Value |
|---|---|
| **Purpose** | One-off package payments and recurring Pro Lister subscriptions |
| **Products used** | Payment Intents, Subscriptions, Customer portal, Webhooks |
| **Website** | stripe.com |

**Integration points:**
- On order creation: create a `PaymentIntent`, return `client_secret` to frontend
- Frontend uses Stripe.js / Stripe Elements to collect card details (PCI compliant)
- On subscription creation: create Stripe `Customer` + `Subscription`
- Webhook endpoint receives events:
  - `payment_intent.succeeded` → mark order paid, trigger listing approval flow
  - `payment_intent.payment_failed` → mark order failed, notify user
  - `invoice.paid` → reset Pro Lister monthly listing counter
  - `customer.subscription.deleted` → update subscription status to cancelled
- Stripe customer portal for landlords to manage payment method

**Security notes:**
- Never store raw card data — Stripe handles all PCI scope
- Validate all webhooks using `Stripe-Signature` header

---

## Tenant Referencing — Goodlord

| Detail | Value |
|---|---|
| **Purpose** | Tenant credit, employment, affordability, and previous landlord reference checks |
| **Cost to user** | £25 per applicant |
| **Website** | goodlord.co |

**Integration points:**
- POST to Goodlord API to initiate a reference request
- Goodlord emails the applicant directly for data collection and consent
- Goodlord performs checks and returns result via webhook or polling
- Platform stores result in `tenant_references` table and notifies landlord

**Data shared with Goodlord:**
- Applicant name and email address
- Property address (for context)

---

## Property Portals

### Rightmove

| Detail | Value |
|---|---|
| **Purpose** | UK's largest property portal — listing syndication |
| **Included in** | Premium Sales, Pro Lister (all tiers), optional add-on for Saver/Exposure |
| **Website** | rightmove.co.uk |

**Integration:** Rightmove Real Time Data Feed (RTDF) — XML-based API for submitting, updating, and removing listings.

---

### Zoopla

| Detail | Value |
|---|---|
| **Purpose** | Major UK property portal — listing syndication |
| **Included in** | All packages |
| **Website** | zoopla.co.uk |

**Integration:** Zoopla Property Feed API — submits listings in their prescribed format.

---

### OnTheMarket

| Detail | Value |
|---|---|
| **Purpose** | UK property portal — listing syndication |
| **Included in** | Exposure and Premium (Sales), Exposure and Pro Lister (Lettings) |
| **Website** | onthemarket.com |

**Integration:** OnTheMarket partner data feed.

---

### PrimeLocation

| Detail | Value |
|---|---|
| **Purpose** | UK property portal (part of Zoopla group) |
| **Included in** | All packages |
| **Website** | primelocation.com |

**Integration:** Syndicated automatically alongside Zoopla (same data feed via Zoopla group).

---

## Geocoding — Postcodes.io

| Detail | Value |
|---|---|
| **Purpose** | Convert UK postcode to latitude/longitude for location search |
| **Cost** | Free, open source API |
| **Website** | postcodes.io |

**Integration:**
- On property save: call `GET https://api.postcodes.io/postcodes/{postcode}`
- Store returned `latitude` and `longitude` on the property record
- Used for radius-based search queries

---

## File Storage — AWS S3 (or equivalent)

| Detail | Value |
|---|---|
| **Purpose** | Store property photos (public) and sensitive documents (private) |

**Two buckets:**

| Bucket | Access | Contents |
|---|---|---|
| `quicklister-photos` | Public via CloudFront CDN | Property photos (multiple size variants) |
| `quicklister-documents` | Private (signed URLs only) | ID documents, ownership proof, certificates |

**Integration:**
- API generates pre-signed upload URLs; client uploads directly to S3
- Image resizing triggered via Lambda or a job queue on upload completion
- Document access served via short-TTL (15 min) pre-signed download URLs

---

## Email Delivery — Transactional Email Provider

Recommended: **AWS SES**, **SendGrid**, or **Postmark**

| Detail | Value |
|---|---|
| **Purpose** | All transactional emails |

**Emails sent by the platform:**
- Email verification on registration
- Password reset link
- Listing submission confirmation
- Listing approved / rejected notification
- Enquiry received notification
- Enquiry reply notification
- Viewing request notification
- Tenant reference result notification
- Listing expiry reminders (7 days, 3 days before)
- Listing expired notification
- Payment receipt / invoice

---

## KYC / AML Verification

| Detail | Value |
|---|---|
| **Purpose** | Identity verification and Anti-Money Laundering checks |
| **Provider** | Not publicly named — Quicklister performs manual review + unnamed KYC tool |

**Current approach (observed):**
- Manual admin review of uploaded photo ID and ownership documents
- KYC check described as "address validation, electoral roll validation"
- AML check is an optional paid add-on (£29.99)

**For a clone, options include:**
- Onfido, Jumio, Veriff — automated ID verification APIs
- SmartSearch, Credas — UK-focused AML/KYC providers

---

## NRLA (National Residential Landlords Association)

| Detail | Value |
|---|---|
| **Purpose** | Affiliate/partner programme — £15 discount on NRLA membership |
| **Website** | nrla.org.uk |

**Integration:** Referral link with discount code — no deep API integration required.

---

## National Forest Charity

| Detail | Value |
|---|---|
| **Purpose** | CSR / brand charity partnership |
| **Website** | nationalforest.org |

**Integration:** Brand badge / link only — no technical integration.

---

## Integration Dependency Map

```
Quicklister Platform
│
├── Stripe              — payments, subscriptions, webhooks
├── Goodlord            — tenant referencing
├── Rightmove API       — portal syndication (sales/lettings)
├── Zoopla API          — portal syndication (all) + PrimeLocation
├── OnTheMarket API     — portal syndication (Exposure+)
├── Postcodes.io        — geocoding
├── AWS S3              — photo and document storage
├── CloudFront / CDN    — photo delivery
├── Email provider      — transactional email
└── KYC/AML provider    — identity and fraud checks
```
