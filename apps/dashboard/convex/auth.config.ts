// Clerk JWT integration. The `convex` JWT template must exist in the Clerk
// dashboard (JWT templates -> "New template" -> choose "Convex"). Copy the
// Issuer URL into CLERK_JWT_ISSUER_DOMAIN on this machine's
// apps/dashboard/.env.local, then run `convex deploy` so the domain is
// baked into the deployed auth config.
//
// This file is evaluated at deploy time, so if the env var is missing the
// providers array is empty and ctx.auth.getUserIdentity() simply returns
// null for every request (instead of throwing). That keeps the dashboard
// loading cleanly while you finish the Clerk wiring.

const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;

export default {
  providers: domain
    ? [{ domain, applicationID: "convex" }]
    : [],
};
