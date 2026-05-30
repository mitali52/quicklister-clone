# API Requirements

REST API endpoint specifications for the Quicklister clone backend.

All authenticated endpoints require a valid Bearer token in the `Authorization` header.  
All request/response bodies use `Content-Type: application/json` unless noted.  
Monetary values are in **pence** (integer) throughout the API.

---

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create new user account |
| POST | `/api/auth/login` | No | Authenticate user, return access token |
| POST | `/api/auth/logout` | Yes | Invalidate session / revoke token |
| POST | `/api/auth/forgot-password` | No | Send password reset email |
| POST | `/api/auth/reset-password` | No | Set new password using reset token |
| GET | `/api/auth/verify-email` | No | Confirm email using token from email link |
| POST | `/api/auth/resend-verification` | No | Resend email verification link |

### POST /api/auth/register
```json
Request:
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!"
}

Response 201:
{
  "user": { "id": "...", "email": "...", "full_name": "..." },
  "message": "Verification email sent"
}
```

### POST /api/auth/login
```json
Request:
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": { "id": "...", "email": "...", "role": "landlord" }
}
```

---

## User / Account

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Yes | Get authenticated user's profile |
| PUT | `/api/users/me` | Yes | Update profile (name, phone, address) |
| PUT | `/api/users/me/password` | Yes | Change password |
| DELETE | `/api/users/me` | Yes | Request account deletion |

---

## Properties

### Listing Management (Owner)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/properties` | Yes | List current user's properties |
| POST | `/api/properties` | Yes | Create a new property (draft) |
| GET | `/api/properties/:id` | Yes | Get single property (owner view) |
| PUT | `/api/properties/:id` | Yes | Update property details |
| DELETE | `/api/properties/:id` | Yes | Delete/archive a property |
| POST | `/api/properties/:id/submit` | Yes | Submit listing for admin approval |
| POST | `/api/properties/:id/pause` | Yes | Pause an active listing |
| POST | `/api/properties/:id/resume` | Yes | Resume a paused listing |
| POST | `/api/properties/:id/mark-sold` | Yes | Mark as Sold (sales) |
| POST | `/api/properties/:id/mark-let` | Yes | Mark as Let (lettings) |

### GET /api/properties Query Parameters
```
?status=active|draft|paused|expired|archived
?type=residential_sale|residential_let|commercial_sale|commercial_let
?page=1&limit=20
```

### POST /api/properties
```json
Request:
{
  "type": "residential_let",
  "title": "2-Bed Flat in Shoreditch",
  "description": "...",
  "address_line1": "42 Brick Lane",
  "city": "London",
  "postcode": "E1 6RF",
  "monthly_rent": 200000,
  "bedrooms": 2,
  "bathrooms": 1,
  "property_type": "flat",
  "available_from": "2026-07-01",
  "furnished": "furnished",
  "epc_rating": "C"
}

Response 201:
{
  "id": "prop_abc123",
  "status": "draft",
  ...
}
```

### Public Property Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/properties/search` | No | Public search with filters |

### GET /api/properties/search Query Parameters
```
?listing_type=sale|let
?location=London                  (city, area, or postcode)
?lat=51.5074&lng=-0.1278&radius=5 (km radius search)
?min_price=100000&max_price=500000
?min_rent=500&max_rent=3000
?bedrooms=2
?property_type=flat|detached|semi_detached|terraced
?page=1&limit=20
```

```json
Response 200:
{
  "results": [
    {
      "id": "prop_abc123",
      "title": "...",
      "asking_price": 30000000,
      "bedrooms": 2,
      "property_type": "flat",
      "postcode": "E1 6RF",
      "primary_photo_url": "https://cdn.example.com/...",
      "portals": ["zoopla", "rightmove"]
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

### GET /api/properties/:id/public
Public listing detail (no auth required):
```json
Response 200:
{
  "id": "...",
  "title": "...",
  "description": "...",
  "address_city": "London",
  "postcode_outward": "E1",
  "asking_price": 30000000,
  "bedrooms": 2,
  "photos": [...],
  "epc_rating": "C",
  "available_from": "2026-07-01"
}
```
> Note: Full address is hidden from public view until an enquiry is submitted.

---

## Photos & Documents

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/properties/:id/photos` | Yes | Upload photos (multipart/form-data) |
| PUT | `/api/properties/:id/photos/reorder` | Yes | Update photo sort order |
| DELETE | `/api/properties/:id/photos/:photoId` | Yes | Delete a photo |
| POST | `/api/properties/:id/documents` | Yes | Upload a document (multipart/form-data) |
| GET | `/api/properties/:id/documents` | Yes | List documents for a property |
| DELETE | `/api/properties/:id/documents/:docId` | Yes | Delete a document |

### POST /api/properties/:id/photos
```
Content-Type: multipart/form-data
Body: files[] (multiple image files accepted)

Response 201:
{
  "photos": [
    { "id": "ph_1", "url": "https://cdn.../photo.jpg", "sort_order": 1 }
  ]
}
```

---

## Ownership Verification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/properties/:id/verification` | Yes | Submit ID and ownership docs |
| GET | `/api/properties/:id/verification` | Yes | Get verification status |

---

## Packages & Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/packages` | No | List available packages and add-ons |
| POST | `/api/orders` | Yes | Create order and initiate Stripe payment intent |
| GET | `/api/orders` | Yes | List user's order history |
| GET | `/api/orders/:id` | Yes | Get single order status |
| POST | `/api/webhooks/stripe` | No* | Stripe webhook for payment events |
| GET | `/api/subscriptions/me` | Yes | Get user's active Pro Lister subscription |
| POST | `/api/subscriptions/me/cancel` | Yes | Cancel Pro Lister subscription |

> *Stripe webhook endpoint validated by `Stripe-Signature` header, not Bearer token.

### POST /api/orders
```json
Request:
{
  "package_id": "pkg_saver_lettings",
  "property_id": "prop_abc123",
  "add_ons": ["addon_rightmove"]
}

Response 201:
{
  "order_id": "ord_xyz",
  "stripe_client_secret": "pi_..._secret_...",
  "amount_pence": 4900,
  "currency": "gbp"
}
```

---

## Enquiries & Messaging

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/properties/:id/enquiries` | No | Submit enquiry (public) |
| GET | `/api/messages/threads` | Yes | List all message threads for the user |
| GET | `/api/messages/threads/:threadId` | Yes | Get messages in a thread |
| POST | `/api/messages/threads/:threadId` | Yes | Send a reply in a thread |
| PUT | `/api/messages/threads/:threadId/read` | Yes | Mark thread as read |

### POST /api/properties/:id/enquiries
```json
Request:
{
  "prospect_name": "John Doe",
  "prospect_email": "john@example.com",
  "prospect_phone": "07700900000",
  "message": "Is the property still available?"
}

Response 201:
{
  "message": "Enquiry sent successfully",
  "thread_id": "thread_123"
}
```

---

## Viewings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/properties/:id/viewings` | Yes | List viewings for a property |
| POST | `/api/properties/:id/viewings` | No | Request a viewing (public) |
| GET | `/api/viewings` | Yes | List all viewings for the user (all properties) |
| PUT | `/api/viewings/:id` | Yes | Update viewing status or details |

### POST /api/properties/:id/viewings
```json
Request:
{
  "prospect_name": "Sarah Jones",
  "prospect_email": "sarah@example.com",
  "prospect_phone": "07700911111",
  "proposed_datetime": "2026-06-15T14:00:00Z"
}

Response 201:
{ "viewing_id": "view_456", "status": "requested" }
```

---

## Tenant Referencing

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/referencing` | Yes | Order a tenant reference (triggers Goodlord) |
| GET | `/api/referencing` | Yes | List all references for the user |
| GET | `/api/referencing/:id` | Yes | Get status and result of a reference |
| POST | `/api/webhooks/goodlord` | No* | Goodlord webhook for reference completion |

---

## Portal Listings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/properties/:id/portals` | Yes | Get syndication status per portal |

```json
Response 200:
{
  "portals": [
    { "portal": "rightmove", "status": "live", "live_at": "2026-06-01T10:23:00Z" },
    { "portal": "zoopla",    "status": "live", "live_at": "2026-06-01T10:45:00Z" },
    { "portal": "onthemarket", "status": "pending" }
  ]
}
```

---

## Performance Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/properties/:id/reports` | Yes | Get performance data for a listing |
| POST | `/api/properties/:id/reports/request` | Yes | Request a fresh report from portals |

---

## Admin Endpoints

All admin endpoints require `role: admin`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/verifications` | Admin | List pending verifications (queue) |
| GET | `/api/admin/verifications/:id` | Admin | Get verification detail |
| POST | `/api/admin/verifications/:id/approve` | Admin | Approve a listing |
| POST | `/api/admin/verifications/:id/reject` | Admin | Reject a listing with reason |
| GET | `/api/admin/properties` | Admin | List all properties (filterable) |
| GET | `/api/admin/properties/:id` | Admin | Get any property detail |
| GET | `/api/admin/users` | Admin | List all users |
| GET | `/api/admin/users/:id` | Admin | Get user detail |
| PUT | `/api/admin/users/:id` | Admin | Update user (e.g. change role) |

---

## Standard Error Responses

```json
400 Bad Request:
{ "error": "validation_error", "details": { "field": "message" } }

401 Unauthorized:
{ "error": "unauthorized", "message": "Authentication required" }

403 Forbidden:
{ "error": "forbidden", "message": "Insufficient permissions" }

404 Not Found:
{ "error": "not_found", "message": "Resource not found" }

422 Unprocessable Entity:
{ "error": "unprocessable", "message": "..." }

429 Too Many Requests:
{ "error": "rate_limited", "retry_after": 60 }

500 Internal Server Error:
{ "error": "server_error", "message": "Something went wrong" }
```

---

## Rate Limiting

| Endpoint Group | Limit |
|---|---|
| `/api/auth/login` | 10 requests / 15 minutes per IP |
| `/api/auth/forgot-password` | 5 requests / hour per email |
| `/api/properties/:id/enquiries` | 3 requests / hour per IP per listing |
| General API | 100 requests / minute per authenticated user |
| Stripe webhook | No rate limit (validated by signature) |
