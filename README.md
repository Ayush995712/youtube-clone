# Backend structure

```
src/
  config/
    env.ts           # validates & exports all env vars in one place
    r2Client.ts       # Cloudflare R2 (S3-compatible) client
  middleware/
    auth.ts           # requireAuth (401s), optionalAuth (attaches viewer if present)
    asyncHandler.ts    # wraps async routes so errors reach errorHandler
    errorHandler.ts    # central 404/Prisma-error/500 handling
    validate.ts        # generic zod body validation middleware
    rateLimiters.ts     # auth + view-count rate limits
  schemas/            # one zod schema file per domain
  controllers/        # actual logic, one file per domain
  routes/             # thin route definitions, wired to controllers
  db.ts               # Prisma client singleton
  app.ts              # express app (middleware + routes), no listen()
  server.ts           # imports app, calls listen() — this is your entrypoint
```

Run with `ts-node src/server.ts` (or compile with `tsc` and run the JS build),
same as before — just point your start script at `src/server.ts` instead of
the old single file.

## New dependencies

Two packages were added that weren't in the original file:

```bash
npm install helmet express-rate-limit
```

- `helmet` — sets sensible security headers.
- `express-rate-limit` — caps requests to `/api/signup`, `/api/signin`
  (brute-force protection) and `/api/videos/:id/view` (view-count spam
  protection).

Everything else (`express`, `cors`, `bcrypt`, `jsonwebtoken`, `zod`,
`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@prisma/client`)
is unchanged.

## What changed vs. the original single file

**Bug fixes**
- `crypto.randomUUID()` now explicitly imports `node:crypto` instead of
  relying on the global (only reliable on Node 19+).
- Signup's duplicate-username/channel-name race condition (two signups
  landing at the same instant) is now caught via Prisma's `P2002` error
  code in the central error handler, instead of falling through to a
  generic 500.
- `POST /api/videos` now checks that `videoUrl`/`thumbnail` actually
  point into your R2 bucket, so a client can't register an arbitrary
  external URL as a "video."

**New, previously missing**
- `DELETE /api/videos/:id` (owner-only) — likes/comments could already
  be deleted, but videos couldn't.
- `GET /api/users/:id` and `GET /api/users/:id/videos` — a channel
  profile page needs both of these and neither existed.
- Pagination (`?page=&limit=`, capped at 50/page) on `GET /api/videos`
  and `GET /api/videos/:id/comments` — both would eventually return
  every row in the table otherwise.
- Rate limiting on auth routes and the view-increment route.
- `helmet` for baseline security headers.

**Structural**
- All the repeated `try { ... } catch (err) { console.error(...); res
  .status(500)... }` blocks are gone. Routes are wrapped in
  `asyncHandler`, so thrown errors flow to one `errorHandler` that
  already knows how to translate Prisma's `P2002`/`P2025` into 409/404.
- All the repeated `schema.safeParse(req.body)` blocks are gone too —
  `validateBody(schema)` middleware does it once, and controllers just
  read `req.body` already typed and validated.
- Auth logic (`getUserId` / `requireUser`) became `requireAuth` /
  `optionalAuth` middleware that attach `req.userId`, instead of every
  controller calling a helper function at the top.

## Still worth doing (not implemented here, out of scope for a refactor)

- After the client PUTs a file to the presigned URL, you're trusting
  it did so honestly (right content-type/size) — for stricter
  guarantees you'd verify via an R2 event webhook or a HEAD request
  before trusting the URL.
- View counts can still be inflated by a logged-out user hammering the
  endpoint from different IPs; rate limiting helps but a truly robust
  fix is deduplicating by (video, viewer session) within a time window.
- No refresh-token flow — the JWT is a flat 7-day token with no
  revocation. Fine for a side project, worth revisiting before
  production traffic.
- No structured logger (currently just `console.error`) — consider
  `pino` or `winston` if this grows.
