# Page Inventory

All pages on the public marketing site and the authenticated platform app.

---

## Public Marketing Site — `quicklister.co.uk`

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Homepage | `/` | No | Platform overview, hero section, value proposition, CTAs |
| The Platform | `/the-platform` | No | How-it-works (4-step), feature showcase, savings calculator |
| Lettings | `/lettings` | No | Lettings-specific features, packages, process explainer |
| Sales | `/sales` | No | Sales-specific features, packages, process explainer |
| Commercial | `/commercial` | No | Commercial let and sale offering, property types supported |
| Pricing | `/pricing` | No | All plan tiers with pricing detail, add-ons, and comparison |
| Property Search | `/search` | No | Public listing directory — search and browse active properties |
| Property Detail | `/property/:id` | No | Individual listing — photos, description, price, enquiry form |
| Support | `/support` | No | FAQs (sales & lettings tabs), contact details |
| Privacy Policy | `/privacy-policy` | No | GDPR / data use disclosure |
| Cookie Policy | `/cookie-policy` | No | Cookie usage and opt-out guidance |
| Terms of Use | `/terms-of-use` | No | Platform rules and user obligations |

---

## Platform App — `platform.quicklister.co.uk`

### Authentication

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Login | `/login` | No | Email + password sign-in |
| Forgot Password | `/forgot-password` | No | Request password reset email |
| Reset Password | `/reset-password` | No | Set new password via email token |
| Register | `/register` | No | New user sign-up (may redirect to marketing site) |

### Dashboard & Overview

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Dashboard | `/dashboard` | Yes | Summary of active listings, recent enquiries, account status |

### Listings

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| My Properties | `/listings` | Yes | All of the user's listings (active, draft, paused, archived) |
| Create Listing | `/listings/new` | Yes | Multi-step listing builder — type, details, photos, documents |
| Edit Listing | `/listings/:id/edit` | Yes | Update property details, price, photos, status |
| Listing Detail (Owner View) | `/listings/:id` | Yes | Full listing view with management actions |

### Verification

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Submit Verification | `/listings/:id/verification` | Yes | Upload photo ID and proof of ownership for a listing |
| Verification Status | `/listings/:id/verification/status` | Yes | Track KYC/AML review progress |

### Inbox & Messaging

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Inbox | `/messages` | Yes | All message threads across all listings |
| Message Thread | `/messages/:threadId` | Yes | Individual conversation with a buyer/tenant |

### Viewings

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Viewings | `/viewings` | Yes | All scheduled and past viewings across all listings |
| Viewing Detail | `/viewings/:id` | Yes | View/manage a specific viewing appointment |

### Tenant Referencing (Lettings)

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Order Reference | `/referencing/new` | Yes | Initiate a Goodlord tenant reference check |
| Reference Status | `/referencing/:id` | Yes | Track and view results of a reference check |

### Conveyancing (Sales)

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Instruct Solicitors | `/conveyancing` | Yes | Post-offer solicitor instruction and conveyancing quotes |

### Documents

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Documents | `/documents` | Yes | Manage uploaded certificates and ownership documents |

### Payments & Billing

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Package Selection | `/checkout/packages` | Yes | Select a plan + add-ons before payment |
| Checkout | `/checkout` | Yes | Stripe payment form |
| Order Confirmation | `/checkout/confirmation` | Yes | Post-payment success summary |
| Billing History | `/billing` | Yes | Past orders and invoices |
| Subscription Management | `/billing/subscription` | Yes | View and cancel Pro Lister subscription |

### Reports

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Performance Reports | `/reports` | Yes | Portal views and enquiries per listing |

### Account Settings

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Account Settings | `/settings` | Yes | Update profile, phone, email |
| Change Password | `/settings/password` | Yes | Update account password |

### Admin (Quicklister Staff Only)

| Page | URL | Auth Required | Purpose |
|---|---|---|---|
| Admin Dashboard | `/admin` | Yes (Admin) | Overview of pending actions |
| Pending Verifications | `/admin/verifications` | Yes (Admin) | Queue of listings awaiting ID/ownership review |
| Verification Review | `/admin/verifications/:id` | Yes (Admin) | Review docs and approve or reject a listing |
| All Properties | `/admin/properties` | Yes (Admin) | Browse and filter all listings platform-wide |
| All Users | `/admin/users` | Yes (Admin) | Browse user accounts |
| User Detail | `/admin/users/:id` | Yes (Admin) | View/manage a specific user account |
