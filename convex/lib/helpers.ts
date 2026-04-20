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
