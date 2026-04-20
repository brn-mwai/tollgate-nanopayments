// Clerk JWT integration. The `convex` JWT template must exist in the Clerk
// dashboard (Settings -> JWT templates -> "New template" -> choose "Convex").
// Copy the Issuer URL from that template into CLERK_JWT_ISSUER_DOMAIN on the
// Convex dashboard (Environment variables).

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
