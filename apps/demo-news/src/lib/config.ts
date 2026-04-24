// Environment lookup. Kept in one place so route handlers don't repeat
// the same env checks. All values are required at runtime; missing values
// throw an explicit error so misconfigured deploys fail loudly.

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`demo-news env var ${name} is required but was empty`);
  }
  return value;
}

export function getConfig() {
  return {
    siteId: required("TOLLGATE_SITE_ID"),
    siteKey: required("TOLLGATE_SITE_KEY"),
    hmacSecret: required("TOLLGATE_HMAC_SECRET"),
    verifyToken: required("TOLLGATE_VERIFY_TOKEN"),
    convexUrl: required("CONVEX_URL"),
    baseUrl: process.env.DEMO_BASE_URL ?? "http://localhost:4001",
  };
}
