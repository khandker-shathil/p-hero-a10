# Digital Life Lessons — Client

A Next.js JavaScript frontend for preserving and sharing personal wisdom.
Live URL: not deployed yet.

## Architecture

This repository is now **frontend-only**. The standalone Express backend lives
in `../p-hero-a10-server` and owns Better Auth, MongoDB, and every `/api` endpoint.
Next.js rewrites `/api/*` to that server; there are no database queries or auth
server handlers in this repository. The proxy keeps browser cookies same-origin.

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
  summary, and FAQs. Pricing is pending and checkout is disabled; no payment
  details are collected and no membership changes are made. Stripe checkout and
  verified webhook fulfillment still need backend implementation.

Personal dashboard analytics, Stripe payment integration, and final
contact/terms/social configuration remain separate implementation work.

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

The admin workspace includes overview counts, paginated lesson/user/report lists,
public lesson featuring, lesson review/edit links, confirmed lesson deletion,
and confirmed report dismissal. The user list is read-only; role changes are not
exposed in the UI. Deleted lessons also have their comments, favorites, and
reports removed. Dismissing a report keeps the lesson.

`/api/admin/*` checks both the session and the current MongoDB role on every
request. Redeploy/restart the frontend and Express server together. Server tests:
`node --test tests/admin.test.mjs tests/profile.test.mjs`.
