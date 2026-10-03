# Digital Life Lessons — Client

A Next.js JavaScript frontend for preserving and sharing personal wisdom.
Live URL: not deployed yet.

## Architecture

The standalone Express backend lives in `../p-hero-a10-server` and owns Better
Auth, MongoDB, and the business APIs. Next.js forwards `/api/*` to Express, except
for the local `/api/checkout_sessions` route that creates Stripe Checkout sessions.
The success page verifies checkout on the server; Express owns Premium activation
and Stripe webhooks. The proxy keeps browser cookies same-origin.

## Start locally

Use Node 24 (`nvm use`) in both folders.

1. In `../p-hero-a10-server`: configure its `.env`, then run `npm run dev`.
2. Here: copy `.env.example` to `.env`, then run `npm run dev`.
3. Open `http://localhost:3000`.

The server uses port **5005** because macOS may reserve port 5000.
`API_SERVER_URL` defaults to `http://localhost:5005`. Set the deployed server URL
before building the frontend. Keep MongoDB, Better Auth, and Google OAuth secrets
only in the backend `.env`. Restart Next.js after changing the proxy URL.

## Implemented features

- Email/password and Google authentication with Better Auth.
- Responsive navigation, light/dark theme, custom 404, toast feedback.
- Landing-page carousel, Motion animation, database-backed community sections.
- Public lessons: keyword/category/tone filters, sorting and pagination.
- Free public lesson details and comments are readable without login; premium/private
  access and authenticated engagement are enforced by Express.
- Like toggles, favorites, paginated comments, confirmation-based reports.
- Public author profiles and their public lessons.
- My Favorites with category/tone filters, pagination, and save removal.
- My Profile: display name/photo editing, read-only email, membership badge,
  lesson/favorite counts, and paginated public lessons.
- Add Lesson and My Lessons: validated forms, editing, visibility/access controls,
  engagement counts, and confirmed deletion.

- Pricing page at `/pricing`: Free/Premium comparison, account-aware upgrade
  summary, and FAQs. Authenticated Stripe subscription checkout activates Premium
  through server-verified payment and account ownership checks. Configure Stripe
  webhooks in deployment to synchronize subscription lifecycle changes.

Final contact/terms/social configuration remains separate implementation work.

## Verify

- `npm run lint`
- `node --test tests/*.test.mjs`
- `npm run build -- --webpack`

Backend authorization and MongoDB tests live in the server repository.

## Main packages

Next.js, React, Tailwind CSS, shadcn/ui/Base UI, Better Auth (client), Motion,
lucide-react, next-themes.

### Image uploads

Registration, profile editing, and lesson creation/editing accept JPEG, PNG, WebP,
or GIF files up to 5 MB. The browser sends the file to the authenticated Express
`POST /api/images` endpoint, which uploads it to ImgBB. Only the resulting URL is
saved with the user or lesson in MongoDB. Existing images stay until replaced or
removed. Removing an image removes its reference from the app, not from ImgBB.

Set `IMGBB_API_KEY` in the **server project's `.env`**, then restart Express. Keep
this key server-only; do not prefix it with `NEXT_PUBLIC_`. Registration creates
the account before uploading its optional photo. If that upload fails, the
account still exists and the user can retry from My Profile.

Before upload, `browser-image-compression` prepares a WebP version in the browser:
profile/registration photos target 200 KB and 512 px on the longest edge; lesson
images target 1 MB and 1920 px. These are compression targets, not guaranteed
output sizes. The original is retained if smaller, and GIFs are left unchanged.
The picker previews the prepared image and displays the size reduction. The
existing 5 MB input limit still applies. No server configuration changes are needed.

Public lesson details include Facebook, X, and LinkedIn sharing through `react-share`,
plus Copy link with a manual-copy fallback. Private lessons hide sharing controls.
The footer links to existing discovery, lesson management, and account pages.

Lesson details also offer **Export PDF** below the heading. This opens a clean,
text-only browser print layout; choose **Save as PDF** as the destination. The
export includes the title, author, date, category, tone, access labels, and full
lesson text. Images, navigation, and comments are excluded. Only lessons already
loaded through the existing access checks can be exported.


### Admin dashboard

Use the existing login with an account whose MongoDB `user.role` is `admin`.
Log out and back in after changing the role. Admin logins with no specific return
page go to `/dashboard/admin`; the account menu and dashboard navigation also
link there. Registration cannot assign an admin role.

The admin workspace has five routes:

- `/dashboard/admin`: total users, public lessons, distinct flagged lessons,
  today's new lessons, the five most active contributors, and daily lesson/user
  growth charts. Rankings and charts cover the last 30 days; dates use UTC.
- `/dashboard/admin/manage-users`: paginated name/email/role/lesson-count table,
  with confirmed promotion to admin. Demotion and account deletion are not exposed.
- `/dashboard/admin/manage-lessons`: all lessons, category/visibility/report
  filters, public/private/flagged totals, featuring, reviewed status, and confirmed
  deletion. Featured lessons appear in the existing homepage section.
- `/dashboard/admin/reported-lessons`: one row per reported lesson, report counts,
  and a paginated modal of reasons and reporter names/emails. Ignore clears every
  report for the selected lesson; Delete removes the lesson and related comments,
  favorites, and reports. Deleted lessons are excluded from flagged counts.
- `/dashboard/admin/profile`: the existing display-name and ImgBB photo editor,
  account email, and admin role badge.

Profile editing cannot change roles. Admin role promotion uses a separate,
admin-protected endpoint. Optional account deletion and moderation activity
summaries are not implemented.

`/api/admin/*` checks both the session and the current MongoDB role on every
request. Redeploy/restart the frontend and Express server together. Server tests:
`node --test tests/admin.test.mjs tests/profile.test.mjs`.


### Stripe Premium activation

Checkout requires login and attaches the authenticated user ID to the Stripe
Checkout Session and subscription metadata. The success page posts the checkout
ID to `/api/billing/activate`. Express retrieves the session and subscription from
Stripe, verifies ownership, the configured Premium Price, completed payment, and
an active/trialing subscription, then updates the MongoDB `user` document:
`isPremium`, `stripeCustomerId`, `stripeSubscriptionId`, `stripeSubscriptionStatus`,
and `updatedAt`. The browser refreshes its Better Auth session after activation.
Existing Premium lesson access, creation, and badges use `isPremium`.

Configure `BILLING_SECRET_KEY` in both projects' deployment environments. Optional
`STRIPE_PRICE_ID` must be the same recurring Price in both projects; otherwise the
existing configured Price ID is used. The local secret was copied to the Express
`.env` without removing it from the Next.js environment.

In Stripe, add a webhook endpoint at
`https://YOUR-EXPRESS-SERVER/api/stripe/webhook` and subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Set that endpoint's signing secret as `STRIPE_WEBHOOK_SECRET` on Express, then
restart/redeploy both projects. Webhooks verify the signature against the raw
request body before touching MongoDB. Checkout events activate access even when
the browser never returns; subscription events refresh access from Stripe's
current status. Cancellation at period end keeps access while the subscription
is still active. Canceled, unpaid, past-due, and paused statuses revoke access.

Checkouts created before user metadata was added cannot be automatically matched.
An administrator must match the existing verified payment to its account; users
should not pay again. Simply opening the success URL or sending `isPremium: true`
does not activate an account.

Billing tests (mocked Stripe and database writes):
`node --test tests/billing.test.mjs tests/lesson-access.test.mjs tests/profile.test.mjs`
from the server folder.


### User dashboard

`/dashboard` is the protected overview for regular users, showing total created
lessons, distinct saved favorites, the five newest lessons (including their own
private lessons), a 30-day daily contribution chart, and quick action links. The
chart uses UTC and includes days with zero activity. Profile photo, role, and
Premium membership appear in the welcome section. New accounts see an empty
state with a link to write their first lesson.

`GET /api/dashboard` derives ownership exclusively from the Better Auth session;
request parameters cannot select another user's data. Login defaults to this
page for regular users and `/dashboard/admin` for admins, while preserving
explicit return destinations such as lesson details and payment confirmation.
The account menu and dashboard navigation link to the overview.

Verify in the server project: `node --test tests/dashboard.test.mjs`.
