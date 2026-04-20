# Convex backend

Tollgate's backend. Everything that is not edge middleware.

- `schema.ts` — 11 tables (see `docs/ARCHITECTURE.pdf` Section 5.1)
- `auth.config.ts` — Clerk JWT provider wiring
- `users.ts` — `upsertFromClerk`, `deleteFromClerk`, `current`
- `publishers.ts` — `getMine`, `create`
- `http.ts` — webhooks (Clerk now, Circle next)

## First-time setup

From repo root (not from inside `convex/`):

```bash
pnpm -C apps/dashboard exec convex dev
```

This will:
1. Prompt you to log into Convex (once)
2. Create a new deployment for this project
3. Write `NEXT_PUBLIC_CONVEX_URL` into `apps/dashboard/.env.local`
4. Push the schema and function code
5. Watch for changes and redeploy automatically

On the Convex dashboard (https://dashboard.convex.dev), set the environment
variables:

- `CLERK_JWT_ISSUER_DOMAIN` — copy from your Clerk JWT template ("convex")
- `CLERK_WEBHOOK_SECRET` — copy from Clerk webhooks page

## Clerk webhook endpoint

After `convex dev` runs the first time, your Clerk webhook URL is:

```
<your-convex-url>.convex.site/clerk-webhook
```

Add it to Clerk -> Webhooks. Subscribe to `user.created`, `user.updated`,
`user.deleted`. Copy the signing secret into `CLERK_WEBHOOK_SECRET` on the
Convex dashboard.
