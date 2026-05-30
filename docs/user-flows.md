# User Flows

Step-by-step journeys for each type of user through the platform.

---

## Flow 1: Private Seller — List a Property for Sale

```
[Landing]
Homepage → clicks "Get Started" (Sales)
    ↓
[Registration]
Sign Up page → enters name, email, password → confirms email
    ↓
[Package]
Pricing page → selects tier:
  Saver (£99)    — Zoopla + PrimeLocation
  Exposure (£169) — + OnTheMarket
  Premium (£299)  — + Rightmove  ← most popular
  + optional add-ons: Rightmove, AML check, Professional Photography
    ↓
[Payment]
Stripe checkout → enters card → payment confirmed
    ↓
[Listing Builder — Step 1: Property Details]
  • Address (autocomplete)
  • Property type (detached, semi, flat, etc.)
  • Number of bedrooms / bathrooms
  • Asking price
  • Square footage (optional)
  • EPC rating (optional)
    ↓
[Listing Builder — Step 2: Description]
  • Write property description
  • Highlight key features
    ↓
[Listing Builder — Step 3: Photos]
  • Drag-and-drop upload (min 1 photo)
  • Reorder photos (cover photo first)
  • Upload floorplan (optional)
    ↓
[Listing Builder — Step 4: Certificates]
  • Upload EPC certificate (optional)
  • Other documents
    ↓
[Listing Builder — Step 5: Verification]
  • Upload photo ID (passport / driving licence)
  • Upload proof of ownership (land registry / mortgage statement)
    ↓
[Review & Submit]
  • Preview listing as it will appear
  • Submit for Quicklister admin review
    ↓
[Status: Pending Approval]
  • Email confirmation sent
  • Dashboard shows "Pending Approval"
    ↓
[Admin Approves — within ~24 hours]
  ↓
[Listing Live on Portals]
  • Email: "Your listing is live!"
  • Dashboard shows portal status (Rightmove ✓, Zoopla ✓, etc.)
  • 3-month countdown begins
    ↓
[Ongoing: Manage Listing]
  • Check inbox for buyer enquiries
  • Reply to messages
  • Schedule viewings
  • Update price if needed
    ↓
[Offer Received]
  • Seller accepts offer via message/phone
  • Clicks "Instruct Solicitors" in platform
  • Selects conveyancing partner → solicitor instructed
  • Listing marked "Under Offer" (optional)
    ↓
[Sale Completes]
  • Seller marks listing as "Sold"
  • Listing removed from portals
  • Archived in dashboard
```

---

## Flow 2: Private Landlord — List a Rental Property

```
[Landing]
Homepage → clicks "Get Started" (Lettings)
    ↓
[Registration / Login]
    ↓
[Package]
  Saver (£29)       — Zoopla + PrimeLocation (6 weeks)
  Exposure (£39)    — + OnTheMarket (6 weeks)
  Pro Lister (£42/mo) — All portals, up to 6 listings/month
    ↓
[Payment / Subscription Setup]
    ↓
[Listing Builder]
  (same steps as Seller, with lettings-specific fields)
  • Monthly rent
  • Available from (date)
  • Furnished / Unfurnished / Part Furnished
  • Upload gas safety certificate
  • Upload electrical certificate
    ↓
[Verification — same as seller]
    ↓
[Admin Approval → Live on Portals]
  6-week countdown begins
    ↓
[Tenant Enquiry Received]
  • Notification by email
  • Reply via inbox
  • Arrange viewing
    ↓
[Viewing Completed]
  • Landlord decides to proceed with applicant
    ↓
[Order Tenant Reference]
  • Platform: enter applicant name + email → pay £25
  • Goodlord runs checks
  • Result returned (pass / fail)
    ↓
  PASS → Proceed to tenancy agreement (off-platform)
         Mark listing as "Let" → archived
  FAIL → Pause listing → re-list → repeat from enquiry step
```

---

## Flow 3: Prospective Buyer / Tenant — Find and Enquire About a Property

```
[Discovery]
Lands on Rightmove / Zoopla / OnTheMarket OR
Visits quicklister.co.uk/search directly
    ↓
[Search]
  Filters:
  • Sale or Let
  • Location / postcode
  • Price range
  • Number of bedrooms
  • Property type
    ↓
[Listing Detail Page]
  • Photo gallery
  • Full description
  • Key details (price, bedrooms, EPC)
  • Floorplan (if uploaded)
  • Enquiry / Contact form
    ↓
[Submit Enquiry — No Account Needed]
  • Name, email, phone, message
  • Submit
  • Receives confirmation: "Your enquiry has been sent"
    ↓
[Seller / Landlord Replies]
  • Prospect receives email with reply
  • If web chat used: replies through platform thread (unauthenticated link in email)
    ↓
[Viewing Arranged]
  • Agreed via messages
  • Viewing takes place at property
    ↓
  Buyer → makes offer → negotiation → offer accepted → solicitors
  Tenant → referencing requested → pass → tenancy agreement
```

---

## Flow 4: Pro Lister — Multi-Property Landlord

```
[Sign Up / Log In]
    ↓
[Select Pro Lister Plan]
  • Monthly (£42/mo, 3-month minimum)
  • Yearly (£403/year — 20% saving)
    ↓
[Stripe Subscription Set Up]
  Recurring billing authorised
    ↓
[Dashboard — Multi-Property View]
  Shows all active, draft, and paused listings
  Shows: "X / 6 listings used this month"
    ↓
[Create Listing] (repeat up to 6× per month)
  Same creation flow as Private Landlord
    ↓
[Manage All Listings from One Inbox]
  All enquiries across all properties in single inbox
  Filter by property
    ↓
[Monthly Renewal]
  Stripe charges automatically
  listings_used counter resets
    ↓
[Cancel Subscription] (if desired)
  • User cancels in /billing/subscription
  • Subscription ends at current period end
  • Existing listings remain active until they individually expire
```

---

## Flow 5: Admin — Verify and Approve a Listing

```
[Admin Login]
platform.quicklister.co.uk/login → admin credentials
    ↓
[Admin Dashboard]
  Sees: "12 listings pending verification"
    ↓
[Navigate to /admin/verifications]
  Sorted by oldest-first (FIFO queue)
    ↓
[Open Submission]
  • View listing details (address, price, photos)
  • Open photo ID document → verify name, photo, expiry
  • Open ownership document → verify address matches listing
  • Check KYC flags (any electoral roll / address mismatches)
  • Check AML status (if purchased)
    ↓
APPROVE:
  • Click "Approve"
  • Add optional note
  • Confirm
  → Property.status = "approved"
  → Portal syndication jobs queued
  → Owner emailed: "Your listing has been approved"

REJECT:
  • Click "Reject"
  • Enter reason (e.g., "ID document is expired", "Address doesn't match ownership proof")
  • Confirm
  → Property.status = "rejected"
  → Owner emailed with reason and instructions
```

---

## Flow 6: Password Reset

```
[Login Page]
  Clicks "Forgotten your password?"
    ↓
[Forgot Password Page]
  Enters email address → Submit
    ↓
[Email Sent]
  "If an account exists for this email, a reset link has been sent."
    ↓
[Email Received]
  Clicks reset link (expires in 1 hour)
    ↓
[Reset Password Page]
  • Enter new password
  • Confirm new password
  • Submit
    ↓
[Success]
  "Password updated. Please sign in."
  Redirected to /login
```

---

## Flow 7: Listing Renewal After Expiry

```
[Listing Expires]
  User receives email notification
    ↓
[User Logs In]
  Dashboard shows listing in "Expired" state
    ↓
[Clicks "Renew Listing"]
  → Redirected to package selection
  → Selects new package (can upgrade or keep same tier)
    ↓
[Payment]
  Stripe checkout → paid
    ↓
[Listing Reactivated]
  Same listing details retained (no need to re-enter)
  Verification documents re-used if still valid OR re-submitted
    ↓
[Admin Re-approval] (if required)
  OR auto-approved if previously verified and no details changed
    ↓
[Live Again on Portals]
  New expiry timer starts
```
