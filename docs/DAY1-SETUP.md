# Day 1 Setup — Boot the dashboard locally

From zero to a signed-in Tollgate dashboard running on `http://localhost:3000`.

Time estimate: **15 minutes** if you already have Node 20+ and pnpm installed,
**25 minutes** otherwise.

## 0. Prereqs

```bash
node --version   # should print v20.x or higher
pnpm --version   # should print 9.x
```

If pnpm is missing: `npm i -g pnpm@9`.

## 1. Install dependencies

From the repo root (`C:\Users\Windows\Downloads\tollgate`):

```bash
pnpm install
```

This installs Next.js 16, React 19, Clerk, Convex, Tailwind 4, Phosphor Icons,
and all Convex backend deps in one shot via the workspace.

## 2. Create the Clerk application

1. Go to https://dashboard.clerk.com and create a new application named
   **Tollgate**.
2. Enable the sign-in methods you want (email+password is the simplest for
   Day 1).
3. From the **API Keys** page, copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_...`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_...`)
4. Go to **JWT Templates** → **New template** → pick **Convex**. Do not
   customize. Save. Copy the **Issuer URL** — you will paste this into the
   Convex dashboard in step 4.

## 3. Create the `.env.local`

```bash
cp apps/dashboard/.env.local.example apps/dashboard/.env.local
```

Edit `apps/dashboard/.env.local` and paste the two Clerk keys you just copied.
Leave `NEXT_PUBLIC_CONVEX_URL` empty for now (Convex will fill it in step 4).

## 4. Boot Convex for the first time

```bash
pnpm convex:dev
```

The first run is interactive:
- It will prompt you to log into Convex (opens a browser). Use the same
  account you plan to use for deployment.
- Choose **"Create a new project"** and name it `tollgate`.
- It will write `NEXT_PUBLIC_CONVEX_URL` into `apps/dashboard/.env.local`
  automatically and push the schema + functions.

Leave this terminal open — it continues watching for changes and redeploys
every time you save a file under `convex/`.

## 5. Wire Clerk into Convex

Open the Convex dashboard (https://dashboard.convex.dev) → your `tollgate`
project → **Settings** → **Environment Variables**. Add:

- `CLERK_JWT_ISSUER_DOMAIN` = the Issuer URL from Clerk JWT template (step 2.4)
- `CLERK_WEBHOOK_SECRET` = leave empty for now, set in step 6

## 6. Set up the Clerk webhook

Your Convex deployment exposes HTTP at
`https://<your-deployment>.convex.site`. The webhook URL is:

```
https://<your-deployment>.convex.site/clerk-webhook
```

In the Clerk dashboard:
1. **Webhooks** → **Add Endpoint**
2. Endpoint URL: paste the URL above
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Click **Create**
5. Copy the **Signing Secret** (starts with `whsec_...`) and paste it into the
   Convex dashboard env var `CLERK_WEBHOOK_SECRET` (step 5).

## 7. Run the dashboard

In a new terminal (keep `pnpm convex:dev` running in the first one):

```bash
pnpm dev
```

Visit http://localhost:3000.

- The landing page should render instantly (no auth needed).
- Click **Start monetising bot traffic** → you land on Clerk's sign-up flow.
- Sign up with any email. The Clerk webhook fires, which calls
  `users.upsertFromClerk` in Convex, which creates your `users` row.
- After sign-up you are redirected to `/app`. The sidebar renders, the topbar
  shows "Arc Testnet", and the Overview page shows your stats (all zeros
  because no sites yet).

## 8. Verify end-to-end

Open the Convex dashboard → **Data** → `users` table. You should see one row
with your Clerk identity. That means:

- ✅ Clerk issued a JWT
- ✅ Convex verified it against the Clerk issuer domain
- ✅ The Clerk webhook successfully upserted your user into Convex
- ✅ `ConvexProviderWithClerk` on the client passes your JWT into every
  query/mutation

That closes Day 1. Day 2 wires Arc + Circle Wallets.

## Troubleshooting

### "Cannot find name 'api'" in `app/(platform)/app/page.tsx`

`convex dev` hasn't run yet. After step 4, the `convex/_generated/` folder
appears and types resolve. Restart the Next.js dev server if VS Code doesn't
pick them up.

### "User is not authenticated" in browser console

`CLERK_JWT_ISSUER_DOMAIN` is missing or wrong in the Convex dashboard env
vars. Copy the Issuer URL verbatim from the Clerk JWT template page.

### Webhook never fires

Check Clerk → Webhooks → your endpoint → **Message Attempts**. If you see
401s, the `CLERK_WEBHOOK_SECRET` in Convex env doesn't match the one in
Clerk. If you see timeouts, your Convex deployment is paused — run
`pnpm convex:dev` to wake it.

### `force-dynamic` SSG error on /app routes

Already handled — the `(platform)/layout.tsx` exports
`export const dynamic = "force-dynamic"` to prevent Clerk SSR errors on
Vercel-compatible builds.
