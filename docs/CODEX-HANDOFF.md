# PlotArmour Merch: Codex handoff

State described: branch `agent/merch-crm-pivot-and-catalog`, commit `f4a2033`, 2026-11-22. Remote: `https://github.com/DivyomSharma/plotarmour-merch`. Read this whole file first, then `PLAN.md` (product plan and binding requirements), `AGENTS.md` (Next.js 16 warning) and `README.md` (testing notes).

You are the implementer and, for this session, also your own reviewer. The previous workflow was: an architect (Claude) wrote briefs, Codex implemented, the architect re-ran everything and attacked the code. You no longer have that second pair of eyes, so section 6 (verification protocol) is mandatory, not advice.

---

## 1. Product and business context

PlotArmour Merch (`merch.plotarmour.in`) is a standalone B2B vertical of PlotArmour for bulk custom apparel, event/campus merchandise and corporate gifting in India. Positioning line on the site: "Your merchandise partner, from concept to doorstep." One supplier, one quotation, one point of contact. Minimum order is **10 pieces per style**. Buyers are procurement/HR/admin teams, colleges and fest committees, startups and agencies. The business model is prepaid bulk orders, outsourced production and low inventory risk.

Phase 1 objective (from `PLAN.md`): turn qualified bulk enquiries into operationally complete orders with honest indicative pricing, quote approval, payment tracking and production visibility. Not a print-on-demand marketplace.

The owner is a small team: one person decides product, pricing and operations. Staff roles at launch are expected to be sales, production and finance, each as a `StaffMember` row (no shared logins).

Design authority: the existing restrained editorial look (dark by default with a light theme, warm cream/near-black/brick-red palette). Tokens live in `src/app/globals.css` (`--background`, `--foreground`, `--accent`, `--accent-strong`, `--accent-text`, `--surface`, `--border`, `--text-soft`; utility classes `surface-card`, `surface-panel`, `fine-rule`, fonts via `font-display`). Use `--accent-text` (class `text-accent-text`) for coloured text, never `text-accent` (it fails contrast on the dark theme). If you have a design-skill library, follow it for craft (hierarchy, spacing, motion, states, copy). Every card is a real link to something meaningful, fully visible, no clipped content, no horizontal scroll at 360px.

---

## 2. What is built and verified (do not rebuild)

### Public site (Next.js 16.2.4 App Router, React 19, Tailwind v4)
| Route | What it is |
| --- | --- |
| `/` | Landing: hero (LCP-safe via `ScrollReveal eager`), stats, audiences, catalogue showcase (21 blank styles), kits, process, proof, order bands, FAQ, order flow |
| `/kits`, `/kits/[slug]` | Five generated-cover kits plus a "Build your own kit" card; per-kit page with a headcount x per-head budget tool (`kit-budget-tool.tsx`) |
| `/products/[slug]` | 21 fact-sheet pages (specs, colour/size chips, quantity bands, indicative price, **bulk order estimator** `product-estimator.tsx`) |
| `/order` | Enquiry form (`lead-form.tsx`) plus "What happens next" and a 7-question FAQ (`order-faq.tsx`); noindex and disallowed in robots |
| `/owner/[accessId]`, `/projects/[projectId]` | **Legacy mock prototypes.** Hard-coded access id in `src/lib/internal-routes.ts`, data in `src/lib/merch-data.ts`. noindex. Scheduled for deletion (Track B9). Never extend them. |
| `/api/leads` | POST. Saves an anonymous lead when `DATABASE_URL` is set; 503 otherwise |
| `/api/webhooks/razorpay` | POST. Razorpay webhook, signature verified over the raw body |
| `opengraph-image`, `twitter-image`, `robots.ts`, `sitemap.ts` | Metadata routes |

Key behaviours already implemented:
- The order form validates (phone, MOQ, max quantity 1,000,000), tries `/api/leads`, and ALWAYS opens a pre-filled WhatsApp (or mailto when `NEXT_PUBLIC_WHATSAPP_NUMBER` is unset) message. It shows a reference code only when the API returned one, and never claims a save that did not happen. A blocked popup still saves. A ref guard blocks double submits.
- Public copy was swept: no developer notes, no promises of unbuilt features. `src/lib/order-steps.ts` is the single truthful description of the process; keep it true.
- All public prices are labelled "Indicative, blank garment, ex-GST. Final price confirmed in quote."
- Accessibility/perf: Lighthouse mobile 100 on accessibility, best practices, SEO for `/`, a kit page and a product page; hero LCP about 0.9 s on a throttled mobile profile; landing transfers about 960 KB when fully scrolled; no videos load.

### Domain layer (`src/lib/domain/`, pure TypeScript, tested)
- `state-machines.ts`: five machines as `as const` tables (below), `canTransition`, `allowedTransitions`, `assertTransition`, `InvalidTransitionError`.
- `quote-calculation.ts`: `calculateQuote` in integer paise, GST as integer basis points supplied by the caller (never hard-coded), CGST+SGST vs IGST by **validated GST state codes**, optional rupee rounding, manual-review flags (split delivery, custom fabric, unfamiliar artwork, non-standard size matrix, special packaging, exceptional quantity, supplier price uncertain, rush under 14 days). Rejects quantity below MOQ.
- `gst.ts`: official GST state code table (25 and 28 retired, omitted), `parseGstin` with the mod-36 checksum (verified against `27AAPFU0939F1ZV`).
- `canonical.ts`: deterministic JSON and sha256 (`canonicalize`, `contentHash`, `buildQuoteVersionSnapshot`); rejects Map/Set/Buffer/class instances (they would all hash as `{}`).
- `quote-acceptance.ts`: `decideQuoteAcceptance` (accept / replay / reject with reasons `not_sent | hash_mismatch | expired | already_accepted | missing_key`). A replay is honoured even after expiry.
- `razorpay-signature.ts`: HMAC-SHA256 hex over the raw body, `timingSafeEqual`, never throws.
- `src/lib/lead-validation.ts`: `normaliseIndianPhone`, `parseQuantity` (accepts "1,000"), `validateLead`, `MIN_ORDER_QUANTITY = 10`, `MAX_ORDER_QUANTITY = 1_000_000` (32-bit column).
- `src/lib/product-estimate.ts`: `parseRupeePrice` to paise, `estimateOrder` (bands 10-100, 101-500, 501+), overflow guard.

State machines (source of truth is the file; these must stay identical to `prisma` enums, enforced by a test):
- lead: new -> qualified -> quoted -> won | lost | archived
- quote: draft -> internal_review | withdrawn; internal_review -> sent | withdrawn; sent -> changes_requested | accepted | expired | rejected | withdrawn; changes_requested -> sent | withdrawn
- order: pending_advance -> confirmed | cancelled; confirmed -> proof_pending | on_hold | cancelled; proof_pending -> production_ready | on_hold | cancelled; production_ready -> in_production | on_hold; in_production -> qc | on_hold; qc -> dispatched | in_production | on_hold; on_hold -> confirmed | proof_pending | production_ready | in_production | qc | cancelled; dispatched -> delivered; delivered -> closed
- payment: pending -> initiated; initiated -> paid | failed | expired; paid -> partially_refunded | refunded; partially_refunded -> refunded
- artwork: uploaded -> scan_pending; scan_pending -> review_required | rejected; review_required -> proof_sent; proof_sent -> approved | rejected | superseded

### Server layer (`src/lib/server/`, server-side only)
- `db.ts`: `getDb()` returns a `TransactionalDb` (lazy singleton `pg` Pool from `DATABASE_URL`, `max` from `DB_POOL_MAX` default 3) or `null`; `getRazorpayWebhookSecret()`. Transactions use `BEGIN ISOLATION LEVEL SERIALIZABLE`.
- `transaction.ts`: `runSerializable` retries on Postgres `40001`/`40P01`.
- `pg-time.ts`: makes node-postgres read/write `timestamp(3)` as UTC (Prisma stores UTC). Called by `getDb()`. Do not remove: without it, quote expiry and every timestamp shift on non-UTC servers.
- `leads.ts`: `createLead` parameterised, one statement with a data-modifying CTE that inserts the `Lead` and a `lead.created` `OutboxEvent` atomically; retries on publicId collision (`23505`). `parseLeadRequestBody` strict caps. 10-char public ids from alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
- `lead-endpoint.ts`: size cap 16 KB, same-origin check, in-memory per-instance rate limit (5/min/IP, **a shared edge limiter is still required in production**), honeypot field `website`, 503 when no db.
- `quote-service.ts`: `acceptQuote` (organisation-scoped `FOR UPDATE`, active-version check, `validUntil`, optimistic `version`, writes `QuoteApproval`, `Order` snapshot, `OrderLine`s copied from `QuoteLine`, `AuditEvent`, `OutboxEvent`, all in one serializable transaction).
- `payment-service.ts`: `processRazorpayEvent` (signature BEFORE parsing; unique `GatewayEvent` ledger on `(provider, eventId)`; amount/currency match against `PaymentAttempt`; state-machine-checked Payment and Order transitions; `unmatched` events stay unprocessed so Razorpay retries; a late `failed` never downgrades `paid`; outbox events only on a real state change).
- `webhook-endpoint.ts`: maps outcomes to HTTP: 400 missing headers, 401 bad signature, 413 too large, 503 not configured, 200 processed/duplicate/ignored/amount_mismatch, **409 unmatched (deliberately non-2xx)**, 500 processing_failed.

### Database (`prisma/`)
Prisma 6 is used for the schema and migration generation ONLY (no Prisma Client is generated or used; runtime SQL is hand-written with `pg`). `prisma/schema.prisma`, `prisma/migrations/0001_init`, `0002_quote_validity_platform_events` (additive; never edit applied migrations, add `0003+`), `prisma/rls/policies.sql` (idempotent).
Models: Organization, OrganizationMember (owner|admin|buyer), StaffMember (admin|sales|production|finance; platform-level, no organisation), Address, Lead (organisation nullable until qualified), Quote (`validUntil`, `activeVersionId`, optimistic `version`), QuoteVersion (immutable, `canonicalJson`, `contentHash`), QuoteLine (immutable), QuoteApproval (unique per version, unique `acceptIdempotencyKey`), Order (unique `quoteVersionId`, `snapshot`), OrderLine, OrderStatusEvent (append-only), ArtworkAsset, FileScanResult, PaymentAttempt, Payment, GatewayEvent (global ledger, no organisation), Invoice (`kind`: tax_invoice|advance_receipt|credit_note|debit_note; unique `(financialYear, number)`), TaxSnapshot (immutable), AuditEvent and OutboxEvent (organisation nullable; NULL means platform-level, staff-only).
Rules enforced in schema/tests: money is `Int` paise with `currency`; every tenant table has `organizationId` plus an index; no `onDelete: Cascade` anywhere; no float money; status enums equal the state-machine keys.
RLS: `app.is_org_member(org)` and `app.is_staff()` are `SECURITY DEFINER` helpers using `auth.uid()`. RLS is enabled on every table; `anon` has nothing; members read their organisation, staff read everything, NULL-organisation rows are staff-only. Members may only insert `ArtworkAsset` (status must be `uploaded`, attached only to their own quote/order/lead) and `QuoteApproval` (their own organisation's version, `actorId = auth.uid()`). Immutable triggers reject UPDATE/DELETE on AuditEvent, OrderStatusEvent, QuoteVersion, QuoteLine, TaxSnapshot, QuoteApproval, and on GatewayEvent except setting `processedAt`. Policies are NOT proven on real Supabase yet, only on Postgres semantics with a stubbed `auth.uid()`.

### Tests (`npm test`: 19 files, 18 passing and 1 skipped; 113 tests passing, 5 skipped)
Domain unit tests; Prisma-schema invariant tests (parse `schema.prisma`); RLS suite and service tests on PGlite (in-process Postgres) applying every migration via `src/lib/db/migrations.ts`; endpoint tests; `product-catalog.test.ts` (no supplier cost fields in shipped data). `concurrency.realdb.test.ts` is **opt-in** (`REAL_DATABASE_URL`): 8 parallel callers x 5 runs on the real pool, about 175 serialization conflicts retried per run, plus a mutation check showing it fails without SERIALIZABLE and the row locks.

### Tooling
`npm run dev:db` starts an in-memory Postgres over TCP (PGlite) on port 5433 with all migrations, policies and Supabase-style roles, so you can run `DATABASE_URL=postgresql://postgres@127.0.0.1:5433/postgres npm run dev` with no Docker. Data is lost on exit.

### Assets
Five generated kit covers plus `custom-kit.webp` in `public/media/kits/` (WebP, about 60-100 KB each); prompt log in `assets/image-prompts.md`. Own illustrations in `public/products/` (tshirt, hoodie, varsity, cap, kit, bottle). Images are generated through ChatGPT web via the owner's Pixel Bridge (slow, interactive login), so do not plan on generating images yourself unless that tooling is available.

---

## 3. Decisions already made (do not re-litigate)

1. MOQ is 10 pieces per style everywhere. Large programmes (over 500 pieces) are reviewed for sourcing and delivery.
2. Public prices are indicative blank-garment prices excluding GST, always labelled; volume pricing is confirmed in the quote. No new public price numbers without an owner-approved pricing policy.
3. GST rate is always an input. Never hard-code a rate or assume HSN codes. Finance/CA confirms.
4. Server authorizes in code AND scopes every query by organisation (the server DB role bypasses RLS); RLS is the second wall for browser/PostgREST access.
5. A captured payment equal to its `PaymentAttempt` amount confirms the order (the attempt is the advance request). The advance percentage policy is an owner decision.
6. Quotes are immutable once versioned; acceptance is bound to `contentHash`; orders copy a snapshot.
7. Staff roles live in `StaffMember`, separate from buyer-side `OrganizationRole`.
8. Artwork is accepted only after a lead is qualified into a buyer organisation; until then buyers send logos by WhatsApp (the form says so).
9. Migrations are additive after `0002`. Regenerate SQL offline with `npx prisma migrate diff --from-schema-datamodel <old> --to-schema-datamodel prisma/schema.prisma --script`, writing the file as UTF-8 **without BOM** via .NET (`[IO.File]::WriteAllText` with `new UTF8Encoding($false)`), never PowerShell `>` redirection (UTF-16).
10. No supplier cost, supplier identity or supplier URLs in anything shipped to the browser (see Track D2).

---

## 4. Invariants (never violate)

- Truthfulness: never claim a feature, save, price, lead time, stock or GST treatment that does not exist. Copy that says "confirmed in your quote" is correct when the number is unknown.
- Money is integer paise; no floating-point money arithmetic; guard overflow with `Number.isSafeInteger`.
- Verify the payment signature over the raw, unparsed body before parsing. Never log request bodies or headers (PII).
- All user input is parameterised in SQL; never interpolate.
- Anything that notifies a human (outbox events) fires only on a real state change.
- Timestamps are UTC; keep `pg-time.ts` wired in.
- Append-only/immutable tables stay immutable.
- Do not weaken a failing test to make it pass; report the failure and diagnose.

---

## 5. Environment and machine facts (Windows 11, PowerShell primary)

- Node v24.16.0, npm. Working directory `d:\Code\merch`. Dev/test conventions: production-build test server on port **3100**; local PGlite dev database on **5433**; throwaway real Postgres for concurrency tests on **56432**.
- **Run `npm test` from PowerShell**, not Git Bash: Vitest fails under this Git Bash with "Cannot read properties of undefined (reading 'config')" (environment quirk, not a test failure).
- Never run `next build` while a production server is serving `.next` (they collide). Stop the server first, build, then start. Kill by port with `Get-NetTCPConnection -LocalPort 3100 -State Listen`.
- `.git/index.lock` zero-byte files can be stale (IDE git polling). Only remove one after confirming no `git add|commit|merge|rebase|checkout|reset|stash|pull` process is running and the lock is over 30 seconds old.
- PowerShell tool quirks: `pg_ctl start` hangs a captured shell (use `Start-Process -WindowStyle Hidden`); wildcard characters in paths (`[slug]`) break `-Path` parameters (use `[IO.File]` or `-LiteralPath`); the first line of git stderr output shows as a red error even on success.
- **The machine runs two other PostgreSQL servers that belong to the owner: port 5432 and port 55432 (a Docker container).** Never connect to, probe, list or read them. A native PostgreSQL 17.11 install exists at `C:\Program Files\PostgreSQL\17\bin`; to make a throwaway cluster: `initdb -D <tempdir> -U postgres -A trust -E UTF8 --locale=C`, then start it on a verified-free port (check with `Get-NetTCPConnection`) with `-c listen_addresses=127.0.0.1 -c max_connections=50`, and stop/delete it when done.
- `REAL_DATABASE_URL` tests create and drop their own database; never point them at a server whose other data matters.
- Browser checks: a dedicated Opera instance is controlled through CDP on port 9222 (`~/.claude/tools/opera-agent/start-opera-agent.ps1`). Use any browser automation you have; always test at a 360x800 mobile viewport.
- Hot-linked catalogue images are fetched server-side by the Next image optimizer from `www.bulkplaintshirt.com` (`next.config.ts` `remotePatterns`). That is an availability and rights dependency (Track D2).

---

## 6. Verification protocol (mandatory for every task)

1. `npx tsc --noEmit`, `npx eslint src`, `npm test` (PowerShell), then a production build (`npx next build`) with no server running. All must be green.
2. For DB/concurrency work also run the opt-in suite against a throwaway real Postgres (section 5) at least 3 times.
3. **Attack your own code as an adversary** before declaring done: tenant isolation (can org A read/write org B?), replay/duplicate delivery, out-of-order events, partial failure mid-transaction, huge/malformed input, injection, secrets in logs, timezone, double submit.
4. **Prove each new test can fail.** Temporarily revert or break the fix (restore it in a `finally`), confirm the test goes red, restore, confirm green. Do this for every bug fix and every security/integrity rule.
5. Browser verification at 360px for every UI change: no horizontal overflow, targets at least 44px, keyboard order, visible focus, contrast (the project's `--accent-text` token), reduced motion. Run Lighthouse (mobile) on changed routes; keep accessibility, best practices and SEO at 100 (the `/order` page scores lower on SEO by design because it is noindex). For real database paths, run the real site against `npm run dev:db` and submit real requests; query the rows afterwards.
6. After any change that touches shipped data, rebuild and grep `.next/static/chunks/*.js` for things that must never ship (supplier prices, supplier URLs, secrets, field names like `bulkPrice`).
7. Do not claim a result you did not observe. If a check could not be run, say so.

Lessons from this project, apply them: Codex-written code repeatedly passed its own tests while having real bugs found only by reading it as an attacker (cross-tenant approval insert, editable quote lines, dropped unmatched payments, a notification for a blocked downgrade, timestamp shifts, a double-submit race, supplier cost prices readable in the client bundle). Plan for that.

---

## 7. Work plan

Order of execution: Track A now (no inputs needed), then B, C, D, E as inputs arrive. Each task lists acceptance criteria; meet them and the protocol above. Commit per task with a conventional message (`feat:`, `fix:`, `test:`, `docs:`) on the feature branch if the operator allows commits; never push to `main`; push the branch only when asked.

### Track A: do now (no external input)

**A1. CI — done.** `.github/workflows/ci.yml` runs Node 24, cached `npm ci`, typecheck, ESLint, tests and build; its separate Postgres 17 job points `REAL_DATABASE_URL` only at the service container. Official `actions/*` major tags are used; workflow execution/actionlint remains for GitHub CI to verify.

**A2. Security headers — done.** Production now sends enforcing CSP plus HSTS, `nosniff`, referrer, permissions and frame protections; the report-only browser pass found no violations on the public routes or exercised tools, so it was promoted to enforcing. `unsafe-inline` remains the documented static-rendering trade-off; D2 still governs the temporary supplier image origin. Lighthouse best-practices was not rerun in this pass.

**A3. Environment validation — done.** `DATABASE_URL` and `RAZORPAY_WEBHOOK_SECRET` are optional by default so missing configuration preserves the intentional 503/WhatsApp fallback; malformed values always fail, and `REQUIRE_SERVER_ENV=true` makes both mandatory with an explicit server error. `.env.example` is entirely commented out to prevent copied placeholder values. A client-bundle secret scan remains part of release verification.

**A4. Error and empty states — done.** Root loading, not-found, segment-error and global-error views use truthful recovery copy and catalogue/quote paths; an unknown kit returned the custom 404 at mobile size. Deliberately forcing an error boundary remains a manual/browser test when a safe fault-injection route exists.

**A5. Dead code — done.** Removed unreferenced `media-gallery`, `type-headline`, `interactive-red-element` and `marquee-banner` components; repository grep found no imports. Media assets and supplier-research history remain an owner decision; do not delete or rewrite history without approval.

**A6. SEO and metadata polish — done.** Sitemap dates use the build date and list only 28 public URLs; kit/product Open Graph PNG routes return 1200×630 images, and product canonical metadata is present. Lighthouse SEO and external structured-data validation remain release checks.

**A7. Motion and accessibility QA — done in browser for the changed behavior.** At 360×800, no route overflowed; below-fold reveals began hidden and animated on scroll, reduced motion was static, and with JavaScript disabled all 64 reveals were visible. Lenis now starts only for fine pointers and disposes/restarts on preference changes. Full keyboard-only and Lighthouse audits remain release verification.

**A8. Browser E2E smoke tests (optional dependency).** If you add Playwright as a devDependency (justify it), cover: landing renders; kit page budget tool; product estimator ("1,000" accepted, 9 rejected); order form with the API stubbed (503 fallback, 201 reference, blocked popup, double submit); `/kits/unknown` 404. Run in CI against a production build. Keep them fast and deterministic.

**A9. Draft policy pages (only if the owner has not supplied text).** `/privacy`, `/terms`, `/shipping`, `/returns` exist in the plan. Do NOT invent legal terms. If you build them, render a clearly marked "DRAFT, pending legal review" banner, `noindex`, and do not link them from public navigation until the owner approves. List what facts each page needs from the owner (retention periods, grievance officer under DPDP, returns policy, shipping partners, cancellation terms).

### Track B: needs Supabase (the owner will supply project URL, anon key, service connection string, JWT secret / JWKS details)

**B1. Apply schema to Supabase.** Run migrations and `prisma/rls/policies.sql` against the project (SQL editor or Supabase CLI). Verify on the REAL project: roles `anon`, `authenticated`, `service_role` exist; the real `auth.uid()` returns the JWT `sub` (do not recreate the stub there); RLS enabled on all tables; re-run a cross-tenant isolation check using real JWTs for two buyer users and one staff user. Note Supabase's newer projects sign JWTs asymmetrically (JWKS) rather than with the legacy HS256 secret; implement verification for whichever the project uses. Acceptance: a written verification log; policies unchanged unless a real defect is found (then add a migration/policy fix plus a test).

**B2. Auth.** Supabase Auth with `@supabase/ssr`: magic-link (passwordless) for buyers; staff sign in the same way and are authorised ONLY by presence of a `StaffMember` row for their `sub`. Read the Next 16 docs for the current request-interception convention (middleware may have been renamed) and cookie handling. Server helper `requireUser()` and `requireStaff(roles?)` used by every protected route/action; they verify the session server-side every time (never trust client claims). Redirect allow-list, short-lived single-use links, no tokens in logs or referrers. Acceptance: tests for each helper with minted tokens (valid, expired, wrong audience, wrong signature, alg=none, missing `StaffMember`); a real login against the Supabase project in a browser.

**B3. Staff leads inbox** `/staff/leads` (list + detail). Reads `Lead` rows (including anonymous organisation-NULL leads) with status transitions through the lead state machine (`qualified`, `quoted`, `won`, `lost`, `archived`), notes, source, owner assignment. Design with a list+live-detail pattern, not a bare table; show reference code, contact, requested product/kit, quantity, delivery date/location, budget (paise formatted as rupees), decoration, sample flag, customisation text; one-click "Reply on WhatsApp" using the phone number. Every transition writes `AuditEvent` (actorKind `staff`, actorId = staff `sub`) in a serializable transaction. Acceptance: non-staff users get 403/redirect; no cross-tenant reads; mobile usable.

**B4. Quote composer (staff).** Create a quote for a lead/organisation, add lines, call `calculateQuote` with the owner's confirmed seller state code and GST rate, show manual-review flags, set `validUntil`, save as a draft, move through `internal_review` to `sent` using the state machine, producing a new immutable `QuoteVersion` (`buildQuoteVersionSnapshot`, set `Quote.activeVersionId`, copy lines into `QuoteLine`). Revisions create a new version number; the old version stays. Acceptance: tests for version immutability, hash stability, state transitions, concurrency (two staff editing the same quote).

**B5. Buyer quote page** `/quotes/[publicId]` (authenticated buyer or single-use token bound to resource, version and email). Shows the exact hashed content, validity, terms; "Accept" calls `acceptQuote` with a client-generated idempotency key and the presented `contentHash`; "Request changes" moves to `changes_requested`. Handle every reject reason with honest copy. Public ids only locate resources; authorization is separate. Acceptance: IDOR tests (guessing another buyer's id yields 404/403), replay test, expired quote.

**B6. Orders.** Buyer order page (status timeline from `OrderStatusEvent`, next action, documents, dispatch info) and a staff production board (columns by order status, transitions via the state machine with reasons, `on_hold`, `cancelled`, QC rework). Every transition: serializable transaction, optimistic `version`, `OrderStatusEvent` plus `AuditEvent`, outbox event on change. Acceptance: illegal transitions rejected server-side; concurrent transitions safe.

**B7. Artwork pipeline.** Supabase Storage private bucket; direct upload to a quarantine prefix; verify magic bytes and size; asynchronous antivirus scan (worker: edge function or queue; choose and justify); previews generated in an isolated worker; promote only clean objects; deny signed-URL issuance while scan is pending/failed; short-lived signed URLs issued only after server authorization; `ArtworkAsset` + `FileScanResult` rows; ownership declaration captured (`ownerDeclared`, timestamp); proofs and approvals follow the artwork state machine. Acceptance: polyglot/oversized/wrong-MIME tests; an infected-file test using the EICAR test string; no download path for unscanned files.

**B8. Outbox consumer and notifications.** A worker (cron or edge function) claims `OutboxEvent` rows (`publishedAt IS NULL`, with `FOR UPDATE SKIP LOCKED`), sends the notification (staff email on `lead.created`; buyer email on `quote.sent`/`quote.accepted`/`payment.captured`/dispatch), marks `publishedAt`, increments `attempts`, backs off and dead-letters after N attempts. Idempotent per event id. Provider choice is the owner's (default recommendation: Resend or SES for email; WhatsApp Cloud API only after template approval). Acceptance: tests with a fake provider for success, transient failure, poison message, duplicate claim by two workers.

**B9. Remove the prototypes.** Delete `/owner/*`, `/projects/*`, `src/lib/internal-routes.ts`, `src/lib/merch-data.ts` (check what else imports it; the legacy `WorkspaceShell` owner branch too). Add a CI route-access test asserting `/owner` and `/projects` return 404. Update `robots.ts`/sitemap accordingly. Acceptance: no hard-coded access id remains anywhere (`grep`).

### Track C: needs Razorpay account and the owner's CA

**C1. Create-order route.** Server route (staff or the buyer after acceptance) that creates a Razorpay order for the advance amount and inserts a `PaymentAttempt` (`provider='razorpay'`, `providerOrderId`, amount in paise, currency INR) BEFORE returning it to the client, so the webhook can always match (this closes the webhook-races-ahead gap). Amount comes from the order/tax snapshot server-side, never from the client. Acceptance: tests with a faked Razorpay HTTP client; amount tamper test.

**C2. Checkout.** Razorpay Standard Checkout (or payment links) on the buyer order page; success/failure UI relies on the webhook/ledger, never on the redirect alone. Use test keys first; live only after finance sign-off.

**C3. Webhook hardening.** Extend `processRazorpayEvent` for `payment.authorized`, `order.paid`, `refund.created|processed|failed`, disputes; secret rotation (accept the current and previous secret during a window); keep the retryable-409 and no-downgrade semantics. Reconcile against the Razorpay API for stuck attempts (scheduled job). Acceptance: tests per event type; mutation checks.

**C4. Refunds.** Staff-initiated refund through the Razorpay API; records `refundedAmount` and moves `paid -> partially_refunded -> refunded` via the state machine; credit note `Invoice` (`kind='credit_note'`, `relatedInvoiceId`).

**C5. Tax invoices.** Build `TaxSnapshot` from `calculateQuote` output with the owner's seller GSTIN/state, buyer GSTIN (validated by `parseGstin`), place of supply, HSN/SAC, rate, TCS if applicable. Invoice numbering per financial year must be gap-free and race-safe (add a counter table in a new migration with an atomic increment, or an advisory-locked allocation; unique `(financialYear, number)` already exists). PDF generation server-side (choose a library, justify the dependency). E-invoice/e-way-bill applicability is a CA decision: build the data capture, gate the feature. Acceptance: numbering concurrency test on a real Postgres (parallel allocation yields no duplicates or gaps); golden-file tests for intra-state vs inter-state tax lines.

**C6. Advance policy.** Replace the "captured amount equals attempt amount confirms the order" assumption with the owner's advance percentage rule if it differs; keep it a single named function with tests.

### Track D: owner content and rights decisions (implement whichever option the owner picks)

**D1. Kit budgets.** `src/lib/kits.ts` holds placeholder per-head ranges (for example Employee Welcome 900-1800 INR). Replace with the owner's real ranges, remove the `// PLACEHOLDER` banner, keep "Indicative per head" wording. Update the tests if ranges change.

**D2. Catalogue images and prices.** Context: the 21 catalogue entries were researched from `bulkplaintshirt.com` (see `bulkplaintshirt-data.md`); each entry's `image` hot-links their image through the Next image optimizer, and `bulkPriceMarkedUp`/`samplePriceMarkedUp` are the site's own marked-up prices derived from their prices. Cost-basis fields and supplier URLs have already been removed from shipped data (commit `f4a2033`, guarded by a test). Options: (a) the owner photographs own stock or uses a licensed supplier's images; (b) written permission from the source; (c) remove product photos and use own category illustrations (`/products/*.png` mapping already exists on product pages). Implement the chosen option, remove the `remotePatterns` entry and the CSP allowance when no longer needed, and keep the indicative-price caption. Do not index product pages that still use third-party imagery.

**D3. WhatsApp number.** Set `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits with country code) in the deployment environment; verify every CTA (`floating-whatsapp.tsx`, estimator, landing, order form) opens `wa.me` with the encoded message. Until set, CTAs fall back to `mailto:merch@plotarmour.in`.

**D4. Testimonials and portfolio.** The Proof section says client names and photographed orders will appear once approved. Real client marks, written testimonials and photographs of completed orders replace it; never use placeholders or invented quotes.

**D5. Media assets.** Decide whether to keep the 21 unused videos (`public/media/vid_*.mp4`, root `Media/`) or remove them from the repo.

### Track E: launch hardening and operations

**E1. Deployment.** Hosting not yet chosen (Vercel or Cloudflare are both plausible; the owner has Cloudflare tooling). Choose with the owner; configure environment variables per `.env.example`, production vs staging projects, a staging Supabase project, and a migrations/rollback runbook (apply `0001..000N` in order, then `policies.sql`; keep a down-path or a restore point). Verify `/api/leads` and the webhook work on the deployed platform: the Origin check compares the `Origin` host with the request URL host, which can false-reject behind reverse proxies that rewrite the host; if needed also accept `x-forwarded-host`.

**E2. Abuse protection.** Replace/add to the in-memory limiter with a shared edge limiter (platform WAF/rate limits or Redis); add bot protection (Cloudflare Turnstile) to the order form in addition to the honeypot; never block the WhatsApp path.

**E3. Observability.** Structured server logs (no PII), error monitoring, alerts for failed webhooks, stuck `GatewayEvent` rows (`processedAt IS NULL` older than N minutes), `unmatched` payments, outbox backlog, failed scans. Add the `unmatched` payment audit rows to the staff dashboard.

**E4. Data protection (India DPDP).** Retention and deletion/export procedures for leads, contacts, artwork and audit data; consent record where needed; grievance contact on the privacy page; analytics only with consent and no PII in URLs.

**E5. Backups and recovery.** Backup ownership, restore-test cadence, RPO/RTO written down; rehearse a restore into a scratch project.

**E6. Incident runbooks.** Supplier failure, lost shipment, payment dispute/chargeback, customer escalation, webhook outage (replay procedure using the ledger).

---

## 8. Known gaps and risks (verify, then fix or report)

- The Next.js image optimizer fetches supplier images server-side (D2).
- Rate limiting is per-instance only (E2).
- `x-forwarded-for` is client-spoofable without a trusted proxy; do not use it for anything security-critical.
- The webhook `x-razorpay-event-id` header is not covered by the signature. Effects are idempotent at the Payment level, so replays are harmless, but the ledger can accumulate rows; consider also deduplicating on `rawBodyHash` if abuse is observed.
- Quote acceptance rejects an empty quote only implicitly; consider rejecting quotes with zero lines.
- `calculateQuote` computes tax on the invoice total (not per line); confirm with the CA whether per-line rounding is required.
- Real Supabase behaviour of the policies is unverified (B1).
- No end-user accounts exist yet; until B2, all buyer interaction is WhatsApp plus the anonymous enquiry.

---

## 9. Reporting and stop conditions

For each task report: what changed (files), what you ran and the real output (counts, not "all green"), what you attacked and found, which tests you proved can fail, anything you could not verify, and any decision you need from the owner. Stop and ask, do not guess, when you need a business decision (pricing policy, advance percentage, tax treatment, legal text, rights to images) or any credential. Never create accounts or users on live services, never touch the owner's other databases (5432, 55432), never commit secrets or real `.env` files, never push to `main`.

---

## 10. Quick reference

Commands (PowerShell, `d:\Code\merch`):
```powershell
npx tsc --noEmit; npx eslint src; npm test
npx next build                                   # only with no server running on .next
npm run dev:db                                   # local Postgres on 5433 (separate window)
$env:DATABASE_URL="postgresql://postgres@127.0.0.1:5433/postgres"; $env:RAZORPAY_WEBHOOK_SECRET="whsec_test"; npx next start -p 3100
$env:REAL_DATABASE_URL="postgresql://postgres@127.0.0.1:56432/postgres"; npx vitest run src/lib/server/concurrency.realdb.test.ts   # throwaway cluster only
npx prisma validate                              # needs a dummy DATABASE_URL in the environment
```

Environment variables: `DATABASE_URL` (optional server Postgres; required when `REQUIRE_SERVER_ENV=true`), `DB_POOL_MAX` (default 3), `RAZORPAY_WEBHOOK_SECRET` (optional until `REQUIRE_SERVER_ENV=true`), `REQUIRE_SERVER_ENV` (set `true` only when database and payments are mandatory), `NEXT_PUBLIC_WHATSAPP_NUMBER`, `REAL_DATABASE_URL` (tests only), `DEV_DB_PORT` (dev database port, default 5433).

HTTP contracts:
- `POST /api/leads` JSON body fields: `name`, `phone`, `organization`, `selectedProduct`, `expectedQuantity` (required); `deliveryDate` (YYYY-MM-DD), `deliveryLocation`, `budgetPerUnit` (digits, rupees), `decoration`, `wantsSample` (boolean), `customizationRequest`, `remarks`, `kitSlug`, `website` (honeypot, must be empty). Responses: 201 `{ ok, publicId }` (honeypot hit returns 201 `{ ok: true }` with no reference), 400 invalid JSON, 403 cross-origin, 413 too large, 422 `{ ok: false, errors }`, 429 with `Retry-After`, 503 `{ ok: false, error: "not_configured" }`, 500 `save_failed`.
- `POST /api/webhooks/razorpay` headers `x-razorpay-signature`, `x-razorpay-event-id`, raw body; responses listed in section 2.

Key files to read before touching each area: state machines `src/lib/domain/state-machines.ts`; services `src/lib/server/{quote-service,payment-service,leads,transaction,db,pg-time}.ts`; schema and policies `prisma/schema.prisma`, `prisma/rls/policies.sql`; test patterns `src/lib/server/commerce-services.test.ts`, `src/lib/db/rls.test.ts`, `src/lib/server/concurrency.realdb.test.ts`; copy truthfulness `src/lib/order-steps.ts`, `src/components/order-faq.tsx`.
