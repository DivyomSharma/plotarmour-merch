# PlotArmour Merch — Launch Plan

## Purpose and launch decision

PlotArmour Merch will be a standalone B2B commerce vertical at `merch.plotarmour.in` for wholesale blanks, branded merchandise, and managed bulk production. It should help a buyer move from a clear product choice to a quoted and trackable order. It is **not** launching as a general-purpose print-on-demand marketplace in the first release.

**Phase 1 objective:** turn qualified bulk apparel and corporate-merchandise enquiries into operationally complete orders with transparent indicative quantity pricing, artwork collection, quote approval, payment tracking, and production visibility.

The product must remain separate from PlotArmour Studio's software-service offering. Future POD and reseller features must be architected as capabilities, not exposed as a promised launch feature until operations, support, and supplier integrations are ready.

## Current repository baseline

The existing Next.js 16 application already provides a strong public marketing and lead-capture foundation:

- A public landing page with category positioning, product showcase, kits, an order process, and a WhatsApp hand-off (`src/components/merch-landing.tsx`).
- An `/order` route and lead form (`src/app/order/page.tsx`, `src/components/lead-form.tsx`).
- A source-backed starter blank-apparel catalogue (`src/lib/product-catalog.ts`) and detailed source notes in `bulkplaintshirt-data.md`.
- Internal-style lead/project views at `/owner/[accessId]` and `/projects/[projectId]`, currently powered by mock project data in `src/lib/merch-data.ts`.
- Brand assets, product illustration assets, responsive styling, and visual interaction primitives.

Known baseline risks, tracked as the **Immediate hardening (batch A)** items below: the owner dashboard URL is a hard-coded ID in `src/lib/internal-routes.ts` that acts as a password; `robots.ts` did not exclude internal routes; catalogue cards show marked-up prices without an "indicative" label and the underlying numbers derive from supplier research (`bulkplaintshirt-data.md`), so their rights and truthfulness need review; `/order` collected fields but sent them nowhere.

The current internal views and records are presentation prototypes, not authenticated production operations tooling. The work below replaces mocked operational state with secured, auditable data before it is relied on by staff or customers.

## Product principles

1. **Bulk first:** optimize B2B buying journeys from the **10-piece MOQ** upward (bands 10-100, 100-500, 500+) before single-order POD. MOQ policy to confirm in Phase 0: blanks versus customised runs, per style versus per order.
2. **Truthful commercial information:** label estimates, lead times, stock, tax, and delivery promises according to their actual confidence. Never present supplier-sourced prices or inventory as live unless synchronized and time-stamped.
3. **Quote before commitment where needed:** custom processes, mixed sizes, unusual placements, special packaging, and non-standard delivery locations must produce a reviewed quote rather than a false instant checkout promise.
4. **Supplier-agnostic model:** a sellable SKU may have several suppliers, costs, MOQs, stock positions, and lead times. Supplier choice remains an internal operational decision.
5. **Secure, shared workspaces:** customer, sales, production, and finance views receive only the fields and actions appropriate to their role.
6. **Make status understandable:** customer-facing order status answers what has happened, what is needed next, and when the next update is expected. Internal detail can remain more granular.

## Personas and primary jobs

| Persona | Primary job | First-release route/action |
| --- | --- | --- |
| Procurement / operations buyer | Source compliant apparel, compare quantities, get a valid quote | Catalogue → product → quote builder |
| HR / people team | Build an employee or onboarding kit against a budget | Kits → assisted brief → quote |
| College / event organizer | Order custom merchandise by a deadline | Product/collection → artwork + quantities → quote |
| Brand / agency | Reorder an approved programme with less back-and-forth | Account → previous order → reorder / quote revision |
| Sales operator | Qualify enquiry, issue revisions, collect approvals | Internal lead and quote workspace |
| Production operator | Turn approved order into a specification and production plan | Production queue + order detail |
| Finance operator | Request and reconcile advances/balances | Payments view + payment records |

## Phase 1 scope

### Public storefront

- Catalogue landing page with categories: T-shirts, polos, hoodies/sweatshirts, jackets, uniforms, kits, and corporate gifting.
- Search and filters for intended use, garment type, fit, fabric composition, GSM, colour, size range, MOQ, print suitability, and indicative lead-time band.
- Product detail pages with accurate blank specifications, gallery, colour/size availability, MOQ, quantity price bands, care notes, customisation compatibility, and enquiry/quote CTAs.
- Corporate-kit and event-merch landing pages that use a brief rather than forcing a buyer into unsuitable product configuration.
- Content and SEO foundation: product/schema metadata, canonical URLs, robots/sitemap, accessible images, and indexable category/product copy.

### Quoting and ordering

- Quote builder seeded with a selected product, colour, quantity, size breakdown, delivery postcode/city, required-by date, and artwork requirement.
- Quantity-tier display that clearly distinguishes **indicative ex-GST price** from an issued quote. Support custom pricing rules and negotiated discounts internally.
- Optional customisation selections: print method, number of placements, dimensions, embroidery, labels, packaging, and delivery split. Unsupported combinations route to review.
- Artwork upload with file validation, virus scanning/storage workflow, preview metadata, and a rights/approval declaration.
- Customer contact/company profile, billing and shipping addresses, GSTIN capture and validation strategy, and purchase-order reference field.
- Quote lifecycle: draft → sent → customer changes requested / accepted → internal approval → payment requested → converted to order. Preserve immutable quote versions.
- Online payment requests through Razorpay for advance/balance payments only after payment reconciliation and refund/cancellation policy are defined.
- WhatsApp contact remains a complementary hand-off with contextual quote/order identifiers, not the only record of customer communication.

### Customer workspace

- Magic-link or authenticated account access to quotes, artwork approvals, invoices/payment requests, documents, production milestones, dispatch information, and repeat-order entry points.
- Clear action states: awaiting customer details, awaiting artwork approval, quote awaiting acceptance, advance due, in production, dispatched, delivered, and closed.
- Email and WhatsApp notification events for quote sent, action required, approval captured, payment received, production started, and dispatch created. Message templates need legal/commercial review before activation.

### Internal operations

- Role-protected internal dashboard for leads, quote queue, approvals, payment status, production queue, dispatch exceptions, and supplier purchase requirements.
- Lead qualification fields: source, owner, probability, requested delivery date, risk notes, quote deadline, and next action.
- Quote composer with version history, line-level margin checks, tax and shipping fields, terms, PDF/export, and customer acceptance audit trail.
- Order specification record that locks the approved artwork version, product/supplier selection, size matrix, print instructions, packing instructions, approved proof, and delivery plan.
- Production milestones: material reserved, sample/proof approved, production started, QC complete, packed, dispatched, delivered. Each change captures actor and timestamp.
- Manual supplier workflow: supplier quotes, lead-time commitments, purchase order reference, cost confirmation, and supplier status. No supplier API should be assumed.
- CSV export/import where it genuinely removes operational friction, with validation and activity logging.

## Deliberately deferred from Phase 1

- Self-serve visual product designer with pixel-accurate garment mockups.
- Seller/reseller onboarding, white-label packaging rules, wallet/settlement logic, and supplier-automated POD fulfilment.
- Public single-unit checkout, marketplace seller tools, Shopify/WooCommerce apps, and external order APIs.
- Live supplier stock claims or automated replenishment without contracts, feed reliability, and reconciliation processes.
- Manufacturing ERP synchronization until the target system, ownership, field mapping, retry policy, and exception process are approved.

## Information architecture and route map

| Area | Proposed route | Responsibility |
| --- | --- | --- |
| Home | `/` | Positioning, category paths, proof, bulk CTA |
| Catalogue | `/shop` | Browse/search/filter sellable products |
| Category | `/shop/[category]` | Focused browsing and buying guidance |
| Product detail | `/products/[slug]` | Specifications, price bands, customisation paths, quote CTA |
| Kits | `/kits` and `/kits/[slug]` | Curated use-case merchandise packages |
| Quote builder | `/quote/new` | Product/quantity/artwork/delivery brief and estimate |
| Quote | `/quotes/[publicId]` | Customer review/approval and payment actions |
| Account | `/account`, `/account/orders/[orderId]` | Customer history and order tracking |
| Order workspace | `/orders/[publicId]` | Customer-safe production and dispatch status |
| Internal dashboard | `/admin` | Protected sales, production, finance, supplier operations |
| Internal order | `/admin/orders/[id]` | Full operational record and audit timeline |
| Help/policies | `/help`, `/shipping`, `/returns`, `/artwork-guidelines`, `/privacy`, `/terms` | Buyer confidence, legal, and support |

Existing prototype routes can be retained during transition, but must not expose mock customer data or act as an authorization boundary in production.

## Domain model and data ownership

Use Prisma with Supabase Postgres and Supabase Auth (or another approved authentication provider). Keep commercial calculations server-side. Adopt UUID primary keys internally and short, non-sequential public references for customer-visible resources.

### Core entities

| Domain | Entities | Important relationships / rules |
| --- | --- | --- |
| Identity | User, Organization, OrganizationMember, Address | An organization has members and multiple addresses; roles grant scoped access. |
| Catalogue | Product, ProductVariant, Option, MediaAsset, Category, Collection | A public product can include multiple variants and customisation capabilities. |
| Supplier sourcing | Supplier, SupplierProduct, SupplierVariant, SupplierPrice, SupplierStockSnapshot, PurchaseOrder | One sellable variant can map to many supplier variants; supplier data has source and observed-at timestamps. |
| Pricing | PriceList, PriceTier, CustomisationRule, ShippingRule, TaxProfile, Discount | Store money in smallest currency unit, tax separately, effective dates, and pricing provenance. |
| Sales | Lead, Quote, QuoteVersion, QuoteLine, QuoteApproval, ContactActivity | Never mutate an accepted quote version; create a revision. |
| Artwork | ArtworkAsset, ArtworkPlacement, ArtworkApproval, ProductionProof | Preserve approved asset/version checksum and owner declaration. |
| Ordering | Order, OrderLine, SizeBreakdown, OrderStatusEvent, DeliveryShipment | An approved quote creates a snapshot-backed order; later catalogue changes do not alter it. |
| Production | ProductionJob, ProductionStep, QCCheck, DispatchRecord | Operational updates are append-only events where possible. |
| Finance | PaymentRequest, Payment, Refund, Invoice | Payment gateway state must be reconciled using signed webhooks and idempotency keys. |
| Governance | AuditEvent, Notification, ConsentRecord, FileScanResult | Record sensitive actions, notification attempts, and consent/approval evidence. |

### Required state machines

Define transitions in one server-side domain layer, test them, and expose only permitted actions.

```text
Lead: new → qualified → quoted → won | lost | archived
Quote: draft → internal_review → sent → changes_requested → sent → accepted | expired | rejected
       draft | internal_review | sent | changes_requested → withdrawn
Order: pending_advance → confirmed → proof_pending → production_ready → in_production → qc → dispatched → delivered → closed
       qc → in_production (rework); confirmed..qc → on_hold → (resume to a prior stage);
       pending_advance | confirmed | proof_pending | on_hold → cancelled (never after dispatch)
Payment: pending → initiated → paid | failed | expired
         paid → partially_refunded | refunded;  partially_refunded → refunded
Artwork: uploaded → scan_pending → review_required | rejected (scan failed) → proof_sent → approved | rejected | superseded
```

The implemented tables live in `src/lib/domain/state-machines.ts` with tests; they are the source of truth and this block is kept in step with them. Amendments from the adversarial review: `initiated → refunded` was removed because an unpaid payment cannot be refunded; cancellation, hold, rework, partial refund, withdrawn quotes and failed scans are now representable. Still open: post-dispatch claims, returns, credit notes and settlement states.

## Pricing and commercial rules

1. Establish a written pricing policy before exposing a number publicly: whether blanks, print, branding, packing, freight, GST, design work, and payment charges are included.
2. Catalogue cards show `From ₹X per unit` only when there is a maintained, traceable price floor and a visible MOQ qualifier.
3. The estimate service calculates line items from versioned price lists, tier quantity, customisation rules, delivery rules, and tax profiles. It returns the calculation version and any manual-review flags.
4. A manual-review flag is mandatory for split delivery, rush deadlines, custom fabric/colour, unfamiliar artwork, non-standard size matrices, special packaging, exceptional quantities, and supplier-price uncertainty.
5. Quotes declare validity, assumed delivery details, taxes, exclusions, payment schedule, cancellation terms, and artwork-approval dependency.
6. Margin and supplier cost fields remain internal-only. Customer screens never reveal supplier identity/cost unless commercial policy explicitly permits it.

## Integrations and security design

### Supabase

- Use Auth with verified email magic links or passwordless authentication; do not create access URLs that function as permanent credentials.
- Enforce Postgres row-level security for organizations and customer resources; service-role access exists only in server-side code.
- Store artwork and documents in private buckets. Create short-lived signed URLs after authorization, validate allowed MIME types/size, and record the file owner/version.
- Use migrations, seed data only for local/demo environments, environment-variable validation, backup/restore procedures, and audit logging.

### Razorpay

- Create orders/payment links from the server after quote acceptance and payment amount validation.
- Verify signed webhooks, persist raw event identifiers safely, process idempotently, and reconcile gateway status before marking a payment paid.
- Do not store card data. Define invoice, advance, balance, refunds, and failed-payment procedures before enabling live mode.

### Shipping

- Start with manual shipment creation and carrier tracking links if Shiprocket/direct courier integration is not contractually available.
- When an integration is approved, isolate it behind a shipping provider interface; use webhook verification, idempotent events, and clear fallback/manual override operations.

### Email, WhatsApp, analytics, and observability

- Select approved providers only after data-processing, cost, sender/domain, opt-in, template, and delivery-failure requirements are confirmed.
- Avoid putting personal data or private order data in client-side analytics. Define consent, retention, and deletion handling.
- Add structured server logs, error monitoring, alerting for failed payments/webhooks/uploads, and a traceable support reference on customer-facing errors.

## Design and content requirements

- Continue the current restrained PlotArmour visual direction: editorial typography, purposeful product imagery, calm spacing, and operational clarity. Avoid generic marketplace chrome.
- Keep buyer language specific: `Request quote`, `Indicative estimate`, `Approve artwork`, `Advance due`, and `Dispatch details` rather than vague conversion labels.
- Use authentic product photographs/approved supplier imagery with source rights and accurate colour/specification captions. Mark illustrative mockups as illustrative.
- Plan desktop, tablet, and mobile layouts from the beginning. Catalogue filters become an accessible drawer on mobile; quote summary remains readable and editable.
- Meet WCAG 2.2 AA as a practical target: semantic landmarks, labelled controls, keyboard order, visible focus, contrast, alt text, screen-reader announcements for calculation/upload states, and reduced-motion handling.
- Build intentional states for empty catalogue results, unavailable variants, estimate failure, upload/scanning failure, expired quote, unauthorized workspace access, payment failure, production delay, and no tracking yet.

## Delivery sequence

### Immediate hardening (batch A, before Phase 0 completes)

- Disallow and noindex `/owner`, `/projects`, `/order`; keep them out of the sitemap. Retire the hard-coded owner ID when real staff auth lands (Phase 1).
- Label every public price "Indicative, blank garment, ex-GST; final price confirmed in quote". Decide whether competitor-derived figures and imagery may be used at all.
- Make `/order` deliver the enquiry (validated, MOQ-checked, sent via WhatsApp with every field) until the quote builder persists leads in Phase 3.
- Add kit pages (`/kits`, `/kits/[slug]`) with a headcount-times-budget tool. Kits are a first-class entity (`Kit`, `KitItem`, per-head budget range) so a budget-led brief ("₹500 per employee") becomes a quote line set in Phase 3.
- Lean-path option for Phase 1: defer customer self-service (accounts, workspace, self-serve approvals) but NOT domain controls. The quote, order, artwork and payment state invariants, quote-version immutability and payment idempotency are Phase 1 prerequisites, because accepted-quote-to-production depends on them (adversarial review finding 8).

### 0. Discovery and commercial readiness (1–2 weeks)

- Confirm launch products, supplier relationships, current pricing sources, geographic service area, MOQs, lead-time policy, returns/cancellation rules, tax treatment, payment terms, and fulfilment hand-offs.
- Conduct product/operations workshops to map the current quote-to-dispatch process and identify every manual approval point.
- Decide the Phase 1 authentication and staff role model, support ownership, data-retention policy, legal pages, and provider accounts.
- Produce a signed-off pricing/quote rulebook, product-content workbook, operations SOPs, event/state definitions, and error/escalation matrix.

**Exit criteria:** a small, launchable assortment is validated commercially, an owner exists for every manual process, and no screen depends on invented inventory, price, or lead-time data.

### 1. Foundation and data model (1–2 weeks)

- Add Prisma, Supabase integration, migration conventions, local/dev/staging environments, typed configuration, seed fixtures, and test database strategy.
- Implement the domain schema, row-level security policies, organization roles, audit-event mechanism, and server-side data access layer.
- Move the existing source-backed catalogue from static TypeScript into controlled catalogue data/import tooling while retaining provenance and review status.
- Establish API/route-handler contracts, validation schemas, authorization helpers, error taxonomy, and observability baseline.

**Exit criteria:** authorized test users can access only their own organization records; migrations apply cleanly; no production secret is client-exposed; mock operations data is clearly segregated or removed from production paths.

### 2. Storefront and catalogue (1–2 weeks)

- Build shop/category/product pages, filters, product data states, responsive navigation, and product SEO metadata.
- Surface credible specifications, price ranges, customisation options, quantity bands, and enquiry routes using approved content.
- Add internal catalogue administration/import flow sufficient to maintain products, variants, imagery, and price effective dates.
- Validate visual hierarchy and actual product selection flow in desktop and mobile browsers.

**Exit criteria:** buyers can find a launch product, understand its buying constraints, and begin the right quote flow without encountering placeholder product claims.

### 3. Quote builder and sales workflow (2–3 weeks)

- Build customer company/contact capture, product/quantity/size/artwork/delivery brief, estimate service, upload processing, quote request creation, and email confirmations.
- Build internal lead triage, quote composer, approval/version workflow, customer-facing quote detail, and printable quote output.
- Introduce controlled price lists, manual-review routing, calculation tests, and acceptance audit logging.
- Connect contextual WhatsApp support for buyers who need assisted service.

**Exit criteria:** a staff member can take a new request through a quote revision, customer acceptance, and conversion to a production-ready order with all data attributable and versioned.

### 4. Payments, customer workspace, and production tracking (2–3 weeks)

- Add account access, action-required dashboard, payment requests and webhook reconciliation, order status timeline, artwork approval capture, shipment details, and repeat-order entry points.
- Build internal production board, operations checklist, dispatch update UI, exception/delay communication, and finance reconciliation views.
- Implement notification templates and delivery tracking for the highest-value lifecycle events.

**Exit criteria:** an accepted quote can be paid, produced, dispatched, and followed by the buyer without staff relying on a hidden mock dashboard or an unrecorded chat thread.

### 5. Launch hardening and controlled release (1–2 weeks)

- Complete unit/integration tests for pricing, state transitions, authorization, uploads, payments, and webhook idempotency.
- Run accessibility, security, performance, SEO, browser/responsive, and operational dry-run QA.
- Perform test-mode end-to-end orders, payment success/failure/refund simulations, lost-artwork and delay scenarios, and staff training.
- Deploy to staging, conduct UAT with real product/operations owners, migrate only approved launch data, then enable production providers and release deliberately.

**Exit criteria:** every customer-facing action has an owner and recovery path; monitoring and rollback are verified; launch readiness is signed off by product, operations, finance, and engineering.

## Testing and acceptance checklist

### Functional

- Filter/search/variant selection yields only compatible, accurately described products.
- Quantity and size changes update only a labelled estimate and preserve assumptions.
- Quote versions, approvals, payment amounts, and order snapshots cannot be silently overwritten.
- Unauthorized users cannot fetch another organization’s quote, artwork, payment, or order by editing a URL.
- Uploads reject unsafe/unsupported files, allow recovery, and keep approved versions immutable.
- Gateway/webhook retries never duplicate payments, orders, notifications, or production events.
- Manual-review routes do not offer a false instant purchase path.

### Quality

- Test keyboard navigation, focus restoration, labels, colour contrast, error messages, mobile form completion, and reduced-motion behaviour.
- Test current Chromium, Safari, and Firefox where supported; use real desktop and mobile viewport checks on localhost.
- Set performance budgets for catalogue/product pages, optimize images, prevent private media indexing, and review Core Web Vitals before launch.
- Run lint, TypeScript/build checks, relevant unit/integration/end-to-end tests, and a final diff/security review.

### Operations

- Sales can issue/revise a quote; finance can reconcile a payment; production can access a locked spec; support can explain the latest customer-visible status.
- Cancellation, credit/refund, missed-date, damaged-goods, artwork-rights, and privacy/deletion SOPs are documented and assigned.
- Supplier substitutions require a recorded review when they change visible product, price, lead time, or quality characteristics.

## Backlog after the Phase 1 launch

### Phase 2 — controlled customisation

- Placement-aware product configuration, artwork proofing workflow, print-method feasibility rules, realistic mockup generation, and design-service purchase paths.
- Customer accounts with saved brands, reusable artwork libraries, approval delegation, purchase-order workflows, negotiated price lists, and formal reorder templates.
- Supplier performance reporting, landed-cost/margin reporting, stock snapshot imports, and purchase-order automation.

### Phase 3 — fulfilment platform

- Reseller onboarding, API credentials, white-label shipping, order import APIs, Shopify/WooCommerce integrations, shipment webhooks, catalog synchronization, and settlement/reporting tooling.
- Only enter this phase after service-level targets, customer support capacity, supplier contracts, data-processing controls, and exception processes are proven at Phase 1/2 volume.

## Adversarial design review: binding requirements (Codex, 2026-11-21)

An independent hostile review of this plan produced the following. Each item was checked against the plan and repo and is adopted as a requirement for the phase named.

**Phase 1 (foundation) exit criteria additions**
1. **Payment/webhook safety.** `PaymentAttempt` plus a gateway event ledger with a unique `(provider, event_id)`; a quote-accept idempotency key; optimistic version locks; order confirmation happens only inside one serializable transaction after verified reconciliation (a webhook may arrive before, or without, the browser redirect). Side effects (notifications, production jobs) go through a transactional outbox.
2. **Immutable quote versions.** `QuoteVersion` stores a canonical JSON snapshot and hash of minor-unit lines, tax, shipping, terms, addresses and size matrix; exactly one active version per quote; `QuoteApproval(quote_version_id, hash, actor, timestamp)`; the `Order` references exactly the approved version and copies the full fulfilment snapshot in the same transaction.
3. **Tenancy.** Every tenant-owned table carries `organization_id`; deny-by-default RLS based on membership; separate staff scope; no browser or service-role path to customer data; cross-tenant tests for every route and storage object; confirm Prisma's DB role cannot bypass RLS.
4. **Prototype cutover.** The mock operational routes (`/owner/*`, `/projects/*`) and the hard-coded owner ID are deleted or return 404 before any production deploy, with a CI route-access test. Prisma/Supabase migrations, RLS policies, env validation and a rollback rehearsal are explicit Foundation exit criteria.

**Before live payments (Phase 4 gate)**
5. **India tax and invoicing.** Immutable line-level `TaxSnapshot` and `Invoice`: seller legal entity and GSTIN, place of supply, HSN/SAC, CGST/SGST/IGST, rounding, GSTIN validation evidence, TCS applicability, credit/debit notes, invoice numbering by financial period, and a decision on e-invoice/e-way-bill applicability. Finance/CA sign-off is a launch blocker.
6. **Razorpay webhooks.** Persist the raw body and hash, verify the signature before parsing, handle authorized/captured/failed/disputed events, replay window, secret rotation, and reconcile via the Razorpay API.

**Security**
7. **Access links.** Public IDs only locate resources; access requires an authenticated session or a short-lived, single-use, hashed action token bound to resource, version and email, consumed atomically; tokens are redacted from logs and referrers; re-authorize before issuing every signed URL.
8. **Uploads.** Direct upload to a private quarantine prefix; verify magic bytes; asynchronous antivirus; previews generated in an isolated worker; promote only clean, immutable objects; deny download while pending or failed; archive expansion limits.

**Omissions to resolve before launch:** data retention, deletion and export implementation (DPDP); disaster-recovery objectives and restore-test cadence; rate limiting and bot protection; accounting audit trail; incident runbooks (supplier failure, lost shipment, escalation).

## Decisions required before implementation starts

1. Which products, cities, supplier relationships, and fulfilment routes are approved for the first launch?
2. What is the source of truth and update cadence for sale prices, supplier costs, availability, MOQs, and lead times?
3. What commercial policy governs GST, freight, artwork/design charges, deposits, quote validity, cancellations, refunds, and damaged/misprinted goods?
4. Which Supabase project, storage region, transactional email provider, WhatsApp provider, payment account, and shipping partner are authorized?
5. Which staff roles exist at launch, and who owns quotes, artwork approval, production updates, payment reconciliation, dispatch, and support?
6. Which real completed orders, client marks, testimonials, and product imagery may be used publicly with written permission?

## Open owner decisions, with recommended defaults (status as of the batch G commit)

Everything buildable without accounts or business input is built and tested: kits and product pages with a bulk estimator, the enquiry flow (persisted to Postgres when `DATABASE_URL` is set, WhatsApp-only otherwise), domain state machines, the Prisma schema and migration, RLS policies proven against real Postgres semantics (PGlite), transactional quote acceptance, the Razorpay webhook route (raw-body signature, event ledger, retryable unmatched events, no downgrade of paid payments), GST validation, and a "Before you order" FAQ. 105 tests, plus a real-PostgreSQL concurrency suite (opt-in via `REAL_DATABASE_URL`) proving one order per quote and one confirmation per payment under 8 parallel callers, with about 175 real serialization conflicts retried per run and a mutation check showing the suite fails if isolation or row locks are removed; Lighthouse 100 on accessibility, best practices and SEO; mobile hero LCP 0.9 s. `npm run dev:db` gives a local migrated Postgres. Environment variables needed in production: `DATABASE_URL`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`. The items below are the only things blocking the rest of Phase 1. Each can be answered in one line.

| # | Decision | Recommended default | Unblocks |
| --- | --- | --- | --- |
| 1 | Supabase project (region, plan) and who owns it | Create one project in `ap-south-1` (Mumbai); owner account, not personal | RLS policies, persisted leads, auth |
| 2 | Razorpay account and test-mode keys | Test mode first; live only after finance sign-off (item 4) | Payment requests, webhook ledger |
| 3 | Staff roles at launch | Owner, sales, production, finance, each a `StaffMember` row; no shared logins | Ops dashboard, quote composer |
| 4 | GST: seller GSTIN and state, applicable rate for apparel by price slab, HSN codes, e-invoice applicability, TCS | CA confirms in writing; the rate stays an input to `calculateQuote`, never a constant | Invoices, any live payment |
| 5 | Kit per-head budget ranges (currently placeholders, e.g. ₹900 to ₹1,800) | Owner supplies real ranges per kit; until then the UI keeps the "indicative" wording | Kit pages being trustworthy |
| 6 | Catalogue images and prices: the catalogue cards hot-link supplier images and use supplier-derived prices | Photograph own stock or get written supplier permission; until then keep the price caption and do not index product pages with third-party imagery | Public launch |
| 7 | `NEXT_PUBLIC_WHATSAPP_NUMBER` | Set the business number before launch; without it the CTAs fall back to mailto | Working WhatsApp CTAs |
| 8 | Transactional email and WhatsApp providers | Resend or SES for email; WhatsApp Cloud API only after template approval | Quote and payment notifications |

**Resolved by engineering (no owner input needed):** `ArtworkAsset.organizationId` stays required. Artwork is accepted only after a lead is qualified into a buyer organisation; until then buyers send logos by WhatsApp, as the enquiry form already says. The `leadId` link on `ArtworkAsset` is for artwork attached to a lead that already has an organisation. Calculation matches states by validated GST state code, not by name.

## Definition of launch-ready

PlotArmour Merch is launch-ready when a buyer can find a verified launch product, submit a complete bulk brief, receive and accept a versioned quote, pay through a reconciled payment flow, approve artwork, see honest production/dispatch updates, and receive support without exposure to internal supplier/cost data. Staff must be able to perform each corresponding operation securely, recover from routine failures, and demonstrate the flow end-to-end in staging before production release.
