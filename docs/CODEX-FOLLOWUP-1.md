# Codex follow-up 1: verify, fix and land the uncommitted Track A work

Read `docs/CODEX-HANDOFF.md` first (context, rules, verification protocol), then this file. Branch `agent/merch-crm-pivot-and-catalog`, last pushed commit `35b469d`. The working tree has UNCOMMITTED changes from two sources: your Track A run, and a reviewer's follow-up edits made without being verified. Nothing in the tree has been checked together. Your job is to verify it all, fix what is wrong, and land it.

## 0. First, establish the facts (do not assume)

1. `git status` and `git diff --stat`. List what changed and who it affects.
2. Confirm nothing is listening on port 3100 (`Get-NetTCPConnection -LocalPort 3100 -State Listen`). If a stray `next start`/`next build` from an interrupted earlier run is there, stop it. Never build while a server serves `.next`.
3. Run `npx tsc --noEmit`, `npx eslint src`, `npm test` (PowerShell), then `npx next build`. Report real numbers. The reviewer's edits were never typechecked.

## 1. Reviewer edits you must verify (already in the working tree)

- `src/lib/server/env.ts` and `env.test.ts`: `DATABASE_URL` and `RAZORPAY_WEBHOOK_SECRET` are now OPTIONAL again; malformed values always fail; a missing value fails only when `REQUIRE_SERVER_ENV=true`. Reason: the site is designed to degrade without a database (`/api/leads` answers 503 and the form falls back to WhatsApp; the webhook route answers 503). Your earlier version made a missing value a hard error in production, which turned that designed 503 into a 500. **Prove the behaviour**: run the production build with NO env vars and confirm `POST /api/leads` returns 503 `{"ok":false,"error":"not_configured"}` and `POST /api/webhooks/razorpay` returns 503 (with valid-looking headers); then with `REQUIRE_SERVER_ENV=true` and no values, confirm the failure is loud and clear. Add/keep tests, and prove the new tests can fail by temporarily reverting the rule.
- `src/components/scroll-reveal.tsx`: the below-the-fold entrance animation is RESTORED (`initial` opacity 0, y 28, blur; `whileInView` to visible; `data-reveal=""` attribute; reduced motion renders statically). Your version had set `initial={false}`, which silently removed every scroll animation. The no-JavaScript requirement is met instead by `src/app/layout.tsx`: a `<head><noscript><style>[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}</style></noscript></head>`. **Verify**: with JavaScript DISABLED in a real browser, below-the-fold content is visible; with JavaScript enabled, elements start hidden and animate in on scroll; the `eager` hero path is unchanged and LCP stays about 1 s on a throttled mobile profile (Fast 4G, 4x CPU); no hydration warning in the console from the added `<head>`.
- Deleted dead components `src/components/{type-headline,interactive-red-element,marquee-banner}.tsx` (never rendered; confirm with grep that nothing imports them).
- `.env.example` rewritten with every variable COMMENTED OUT. Reason: an unchanged copy of the previous file produced `NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX` which strips to the digits `91` and made every WhatsApp button open `https://wa.me/91`, and a fake `DATABASE_URL` host. Keep it commented; confirm it documents `REQUIRE_SERVER_ENV`.

## 2. Review your own Track A output as an attacker, then fix

- **CSP (`src/lib/security-headers.ts`, `next.config.ts`)** is `Content-Security-Policy-Report-Only` with `'unsafe-inline'` scripts/styles (documented trade-off: nonces would force dynamic rendering). In a REAL browser, load `/`, `/kits`, one kit, `/products/<slug>`, `/order`, `/kits/unknown` (404), and trigger the order form (blocked popup, 503 fallback), the budget tool and the product estimator; read the console for `[Report Only]` violations. Fix the policy for any legitimate violation. When there are none, FLIP it to enforcing (`Content-Security-Policy`) in the same change, re-run the same browser pass to prove the site still hydrates and works, and keep a unit test pinning the policy (no `unsafe-eval`, no wildcard, `frame-ancestors 'none'`). If enforcing breaks anything you cannot fix cleanly, leave it report-only and report why.
- **New routes**: `not-found.tsx`, `error.tsx`, `global-error.tsx`, `loading.tsx`; unknown kit/product slugs must be real HTTP 404; the error boundary must not leak stack traces. Check them visually at 360px.
- **OG image routes** for kits and products: request each, confirm a valid PNG, correct size, no invented claims.
- **`sitemap.ts`** uses the build date: acceptable, but confirm it lists only real public routes and not `/order`, `/owner`, `/projects`.
- **`smooth-scroll.tsx`** (Lenis is now off for reduced motion and non-fine pointers, with live listeners): test in a real browser with reduced motion emulated and with touch emulation; there must be no scroll jank, no double scroll and no memory leak on toggling.
- **`.github/workflows/ci.yml`**: re-read it as an attacker (secrets exposure, `pull_request_target`, unpinned third-party actions: pin to full commit SHAs or official `actions/*` major tags and justify). Confirm the Postgres job's `REAL_DATABASE_URL` only points at the service container.
- **Lighthouse (mobile)** on `/`, a kit, a product, `/order`: accessibility, best practices, SEO must stay 100 (SEO of `/order` is lower by design: noindex). Report any regression.

## 3. Documentation to update (stale after these changes)

In `docs/CODEX-HANDOFF.md`: test counts; the env section (optional values, `REQUIRE_SERVER_ENV`); the list of dead components; mark Track A items A1-A7 done with a one-line result each and what remains; keep everything else.

## 4. Land it

Make small conventional commits on the branch (for example `feat: CI workflow`, `feat: security headers`, `feat: env validation`, `feat: error and not-found pages`, `feat: sitemap, JSON-LD and OG images`, `fix: restore scroll reveal with no-JS fallback`, `chore: remove unused components`, `docs: handoff update`). Push the branch only if the operator asked you to. Never push to `main`.

## 5. Things to REPORT, not act on (owner decisions)

- The GitHub repository `DivyomSharma/plotarmour-merch` is **PUBLIC**. It tracks `bulkplaintshirt-data.md` (supplier price research) and a root `Media/` folder of 37 WhatsApp images and 21 WhatsApp videos, plus 21 unreferenced videos in `public/media`. Recommend to the owner: make the repo private now, then decide whether to remove those files from version control. Removing them from git HISTORY (the supplier prices removed from code in commit `f4a2033` still exist in earlier commits) needs a history rewrite: do NOT do this; describe the options (`git filter-repo`, or a fresh repository) and let the owner decide.
- Anything else you find that needs a business or credential decision.

## 6. Final message format

For each section above: what you found, what you changed (files), the real output of every check you ran, what you attacked and what happened, which tests you proved can fail, and what you could not verify. Do not claim a result you did not observe.
