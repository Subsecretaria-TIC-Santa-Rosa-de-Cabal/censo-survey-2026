<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent notes for Censo Digital

## Architecture

- The app has two distinct areas:
  - **Public**: the census form at `/`, served from `src/app/(public)/`.
  - **Private**: the admin dashboard at `/admin`, served from `src/app/admin/`.
- Authentication is handled entirely by **AWS Cognito Hosted UI** via OAuth/OIDC with PKCE.
- Route protection is implemented in `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`).
- Session validation is centralized in `src/lib/auth/verify.ts` and must be called in every protected Server Component, Server Action, and Route Handler.

## Next.js 16 conventions used in this project

- `cookies()` from `next/headers` is **asynchronous**: always `await cookies()`.
- `src/proxy.ts` replaces `middleware.ts`. Do not create a `middleware.ts` file.
- Server Components can be async. Use `react`'s `cache()` for request-scoped memoization of auth checks.
- Route Handlers live in `route.ts` files under `src/app/api/`.

## Auth code patterns

- Use `src/lib/auth/cognito.ts` for Cognito endpoints and configuration.
- Use `src/lib/auth/session.ts` for reading/writing session cookies (`httpOnly`, `secure` in production, `sameSite: 'lax'`).
- Use `src/lib/auth/tokens.ts` for JWT verification with `jose` and Cognito JWKS.
- Use `src/lib/auth/verify.ts` for `verifySession()` and `requireAuth()` in protected code.
- Tokens are never exposed to the client; only the server reads the session cookie.

## UI constraints

- `src/app/(public)/layout.tsx` wraps the public form with `RecaptchaProvider`. Do not move it back to the root layout, because the admin area must not load Google reCAPTCHA.
- The admin area uses `shadcn/ui` components from `src/components/ui/`.

## Environment variables

Do not hardcode Cognito, database, reCAPTCHA secrets, or the public app URL. Read them from environment variables. Required server-side variables:

- `DATABASE_URL`
- `RECAPTCHA_SECRET_KEY`
- `COGNITO_REGION`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_DOMAIN`
- `COGNITO_REDIRECT_URI`
- `COGNITO_LOGOUT_REDIRECT_URI`

Client-side (prefixed with `NEXT_PUBLIC_`):

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_APP_URL` (e.g. `https://censo.emir.gov.co`)
