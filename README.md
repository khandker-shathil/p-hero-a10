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
- Protected lesson details with premium/private access enforced by Express.
- Like toggles, favorites, paginated comments, confirmation-based reports.
- Public author profiles and their public lessons.
- Add Lesson and My Lessons: validated forms, editing, visibility/access controls,
  engagement counts, and confirmed deletion.

Dashboard analytics, admin moderation, Stripe upgrade/payment pages, and final
contact/terms/social configuration remain separate implementation work.

## Verify

- `npm run lint`
- `node --test tests/*.test.mjs`
- `npm run build -- --webpack`

Backend authorization and MongoDB tests live in the server repository.

## Main packages

Next.js, React, Tailwind CSS, shadcn/ui/Base UI, Better Auth (client), Motion,
lucide-react, next-themes.
