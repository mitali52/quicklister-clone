# Navigation Structure

Site-wide and app-level navigation hierarchies.

---

## Public Marketing Site (`quicklister.co.uk`)

### Primary Navigation (Header)

```
Quicklister [Logo / Home]
├── Property Search          → /search
├── The Platform             → /the-platform
├── Lettings                 → /lettings
├── Sales                    → /sales
├── Commercial               → /commercial
├── Pricing                  → /pricing
├── Support                  → /support
└── Sign In                  → platform.quicklister.co.uk/login
    [CTA Button] Free Sign Up → /register
```

### Footer Navigation

```
Footer
├── Legal
│   ├── Privacy Policy       → /privacy-policy
│   ├── Cookie Policy        → /cookie-policy
│   └── Terms of Use         → /terms-of-use
├── Company
│   └── [Stripe badge]       (payment partner, no link)
└── Contact
    ├── support@quicklister.co.uk
    └── 0203 667 2080
```

---

## Platform App (`platform.quicklister.co.uk`)

### Unauthenticated Navigation

```
[Logo]
├── Login                    → /login
└── Forgot Password          → /forgot-password
```

### Authenticated Sidebar / Main Navigation

```
[Logo]                       → /dashboard
│
├── Dashboard                → /dashboard
│
├── My Properties            → /listings
│   ├── Active
│   ├── Draft
│   ├── Paused
│   └── Archived
│
├── [+ New Listing]          → /listings/new   [primary CTA]
│
├── Messages                 → /messages
│   └── [Thread]             → /messages/:threadId
│
├── Viewings                 → /viewings
│   └── [Viewing]            → /viewings/:id
│
├── Referencing              → /referencing            [lettings only]
│   └── [Reference]          → /referencing/:id
│
├── Conveyancing             → /conveyancing           [sales only]
│
├── Documents                → /documents
│
├── Reports                  → /reports
│
├── Billing                  → /billing
│   ├── Order History
│   └── Subscription         → /billing/subscription   [Pro Lister only]
│
└── Account
    ├── Settings             → /settings
    ├── Change Password      → /settings/password
    └── Sign Out
```

### Admin Navigation (Staff Only)

```
[Logo]                       → /admin
│
├── Admin Dashboard          → /admin
├── Pending Verifications    → /admin/verifications
├── All Properties           → /admin/properties
└── All Users                → /admin/users
```

---

## Listing Creation — Step Navigation

The listing creation flow is a multi-step wizard:

```
Step 1: Property Type
    └── Select: Residential Sale | Residential Let | Commercial Sale | Commercial Let

Step 2: Package Selection
    └── Choose tier + add-ons → proceed to Stripe payment

Step 3: Property Details
    └── Address, description, price/rent, bedrooms, bathrooms, type, EPC

Step 4: Photos & Documents
    └── Upload photos (drag-and-drop), floorplan, certificates

Step 5: Ownership Verification
    └── Upload photo ID + proof of ownership document

Step 6: Review & Submit
    └── Preview listing → Submit for admin approval

[Status: Pending Approval → Approved → Live on Portals]
```

---

## Contextual Actions Per Listing (Owner View)

```
Active Listing
├── Edit Details
├── Edit Photos
├── View Enquiries (→ Messages)
├── View Viewings
├── View Portal Status
├── View Performance Report
├── Pause Listing
└── Mark as Sold / Let

Paused Listing
├── Resume / Re-list
└── Remove Listing

Draft Listing
├── Continue Editing
├── Submit for Approval
└── Delete Draft
```
