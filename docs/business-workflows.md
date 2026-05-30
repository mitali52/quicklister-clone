# Business Workflows

End-to-end business process flows for all major operations on the platform.

---

## Workflow 1: User Registration & Onboarding

```
1. Visitor lands on marketing site (quicklister.co.uk)
2. Clicks "Free Sign Up" or "Get Started"
3. Completes registration form (name, email, password)
4. Email verification sent → user confirms email
5. Redirected to package selection
6. Selects property category: Sales | Lettings | Commercial
7. Selects pricing tier + any add-ons
8. Completes Stripe payment
9. Redirected to listing builder (Step 1 of creation wizard)
```

**Key Rules:**
- Account is created before payment to retain intent if user drops off
- Email must be verified before a listing can be submitted
- A user can hold listings of multiple types under one account

---

## Workflow 2: Listing Creation & Approval

```
1. User enters listing builder (multi-step wizard)
   Step 1: Property type (residential sale/let, commercial)
   Step 2: Address and basic details
   Step 3: Description, price/rent, bedrooms/bathrooms, EPC
   Step 4: Upload photos (drag-and-drop, min 1 required)
   Step 5: Upload floorplan and certificates (optional)
   Step 6: Upload photo ID + proof of ownership
   Step 7: Review and submit

2. Listing status → "Pending Approval"

3. Quicklister admin receives notification of pending submission

4. Admin reviews:
   - Photo ID (valid government-issued document)
   - Proof of ownership (matches address on listing)
   - KYC check (address and electoral roll validation)
   - AML check (if purchased as add-on)

5a. Approved:
   - Listing status → "Approved"
   - Portal syndication jobs queued
   - User notified by email
   - Listing goes live on selected portals within ~24 hours
   - Listing status → "Active"
   - Expiry timer starts (6 weeks: lettings / 3 months: sales)

5b. Rejected:
   - Admin provides rejection reason
   - Listing status → "Rejected"
   - User notified by email with reason
   - User can correct and resubmit
```

**Key Rules:**
- Listings cannot go live without admin approval
- The 24-hour SLA clock starts after admin approval, not submission
- Photos must be of the actual property (no stock images per terms)
- Only the property owner can submit (professional agents prohibited)

---

## Workflow 3: Portal Syndication

```
1. Admin approves listing
2. System reads portals_included from the purchased package
3. For each portal in the list:
   a. Format listing data to portal's API spec
   b. POST listing to portal API
   c. Receive portal_listing_id from portal
   d. Record PortalListing row (status: pending → live)
4. If any portal submission fails:
   a. Log error, set PortalListing.status = "failed"
   b. Retry logic (e.g., 3 attempts with exponential backoff)
   c. Notify admin if still failing after retries
5. Listing shows portal sync status to owner in dashboard
```

---

## Workflow 4: Enquiry Handling (Lettings)

```
1. Prospective tenant finds listing on Zoopla / OnTheMarket / Quicklister search
2. Tenant submits enquiry form (name, email, phone, message)
3. System creates MessageThread + initial Message
4. Landlord receives:
   - Email notification (24/7 on Exposure/Pro plans; 9–6 Mon–Fri on Saver)
   - Inbox badge in platform
5. Landlord reads enquiry and replies via platform inbox
6. Conversation continues as a thread (both parties can message)
7. Parties agree on viewing:
   - Landlord proposes viewing slot or accepts prospect's request
   - Viewing logged in platform (status: confirmed)
8. Viewing takes place (off-platform)
9. Landlord updates viewing status to "completed"
10. Landlord decides to proceed → orders tenant reference
```

---

## Workflow 5: Tenant Referencing

```
1. Landlord opens a property's "Referencing" section
2. Enters applicant name and email
3. Selects checks to run (credit, employment, affordability, previous landlord)
4. Confirms cost (£25 per applicant) and pays (or charged to card on file)
5. System calls Goodlord API to initiate reference
6. Goodlord emails applicant to provide information
7. Applicant completes Goodlord's form and consents to checks
8. Goodlord runs checks and returns result (pass/fail)
9. Platform updates TenantReference.status
10. Landlord notified of result by email + inbox alert

PASS path:
  → Landlord proceeds to tenancy agreement (off-platform)

FAIL path:
  → Landlord pauses listing
  → Re-lists to find new applicant
  → Process repeats from step 1
```

---

## Workflow 6: Enquiry Handling (Sales)

```
1. Prospective buyer finds listing on Rightmove / Zoopla / Quicklister search
2. Buyer submits enquiry (name, email, phone, message)
3. Seller notified (24/7 on Premium/Exposure; office hours on Saver)
4. Seller and buyer communicate via platform inbox
5. Viewing arranged and completed
6. Buyer makes an offer (verbally / via message)
7. Seller considers and accepts offer
8. Seller marks listing as "Under Offer" (optional intermediate status)
9. Seller instructs solicitors via platform's conveyancing workflow
10. AML checks completed (if purchased)
11. Conveyancing proceeds (off-platform between solicitors)
12. On completion, seller marks listing as "Sold"
13. Listing archived; portal listings removed
```

---

## Workflow 7: Listing Expiry & Renewal

```
[Lettings — 6 weeks]
[Sales — 3 months]

T-7 days before expiry:
  → User receives email: "Your listing expires in 7 days"

T-3 days before expiry:
  → User receives email: "Your listing expires in 3 days"

On expiry:
  → Listing status → "Expired"
  → Portal listings removed / set to expired
  → Listing moved to "Archived" section in dashboard

User options after expiry:
  Option A: Renew — purchase a new package for the same property
    → Creates new Order → payment → listing resubmitted for approval (or auto-renewed)
    → New expiry timer starts

  Option B: Mark as Sold / Let — archive permanently

  Option C: Do nothing — listing remains in archived state
```

---

## Workflow 8: Pro Lister Subscription Management

```
Signup:
  1. User selects "Pro Lister Monthly" or "Pro Lister Yearly"
  2. Stripe sets up a recurring subscription
  3. First payment processed immediately
  4. Subscription.status = "active"
  5. listings_used_this_period reset to 0

Each listing:
  1. User creates a listing
  2. System checks: listings_used_this_period < max_listings_per_period
     → Yes: listing allowed, increment counter
     → No: user shown "listing limit reached" for this period

Monthly reset (for monthly plan):
  1. Stripe invoice raised and paid
  2. Webhook updates current_period_start / end
  3. listings_used_this_period resets to 0

Cancellation:
  1. User clicks "Cancel Subscription"
  2. User confirms (warned: active listings remain until period end)
  3. Stripe subscription cancelled (at period end)
  4. Subscription.status = "cancelled", cancelled_at recorded
  5. Existing listings remain active until they expire naturally
```

---

## Workflow 9: Admin Verification Review

```
1. Admin navigates to /admin/verifications (queue view)
2. Admin sees list of pending submissions ordered by submitted_at
3. Admin opens a submission:
   - Views photo ID (name, DOB, address match check)
   - Views ownership document (address matches listing)
   - Reviews any KYC/AML flags
4a. Approved:
   - Admin clicks Approve
   - OwnershipVerification.kyc_status = "passed"
   - Property.status → "approved"
   - Portal syndication triggered
   - User notified

4b. Rejected:
   - Admin enters rejection reason
   - Admin clicks Reject
   - OwnershipVerification.kyc_status = "failed"
   - Property.status → "rejected"
   - User notified with reason and instructions to resubmit
```

---

## Workflow 10: Password Reset

```
1. User clicks "Forgotten your password?" on login page
2. Enters email address and submits
3. System generates a time-limited reset token (e.g., 1-hour expiry)
4. Reset email sent with unique link
5. User clicks link → directed to reset-password page
6. User enters and confirms new password
7. Password updated; token invalidated
8. User redirected to login page with success message
```
