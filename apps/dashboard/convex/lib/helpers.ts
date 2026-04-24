// Shared helpers for queries, mutations, and actions.
// Trust-boundary rule: client-callable code must go through these helpers to
// resolve the current user + publisher; never trust ownership from args.

import { MutationCtx, QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { getCurrentUser, getCurrentUserOrThrow } from "../users";

export async function getCurrentPublisher(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"publishers"> | null> {
  const user = await getCurrentUser(ctx);
  if (!user) return null;
  return await ctx.db
    .query("publishers")
    .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
    .unique();
}

export async function requirePublisher(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"publishers">> {
  const publisher = await getCurrentPublisher(ctx);
  if (!publisher) throw new Error("publisher not set up");
  return publisher;
}

// Mutation-side: upsert the user row on-demand from the JWT identity if the
// Clerk webhook hasn't fired yet. Returns the user doc. Throws only if there
// is no JWT identity at all (unauthenticated).
export async function ensureCurrentUser(ctx: MutationCtx): Promise<Doc<"users">> {
  let identity;
  try {
    identity = await ctx.auth.getUserIdentity();
  } catch {
    throw new Error("not authenticated");
  }
  if (!identity) throw new Error("not authenticated");

  const existing = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity!.tokenIdentifier))
    .unique();
  if (existing) return existing;

  const email = (identity.email as string | undefined) ?? "";
  const givenName = (identity.givenName as string | undefined) ?? "";
  const familyName = (identity.familyName as string | undefined) ?? "";
  const nickname = (identity.nickname as string | undefined) ?? "";
  const derivedName =
    [givenName, familyName].filter(Boolean).join(" ").trim() || nickname || undefined;

  const userId = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    email,
    name: derivedName,
    role: "publisher",
  });

  const created = await ctx.db.get(userId);
  if (!created) throw new Error("failed to create user");
  return created;
}

export async function requireSiteOwnedByMe(
  ctx: QueryCtx | MutationCtx,
  siteId: Id<"sites">,
): Promise<Doc<"sites">> {
  const pub = await requirePublisher(ctx);
  const site = await ctx.db.get(siteId);
  if (!site) throw new Error("site not found");
  if (site.publisherId !== pub._id) throw new Error("not your site");
  return site;
}

export { getCurrentUser, getCurrentUserOrThrow };
