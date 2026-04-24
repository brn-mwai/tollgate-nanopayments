import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const attributes = {
      tokenIdentifier: `https://${data.object}|${data.id}`,
      email: data.email_addresses[0]?.email_address ?? "",
      name:
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
        data.username ||
        undefined,
      role: "publisher" as const,
    };

    const existing = await userByTokenIdentifier(ctx, attributes.tokenIdentifier);
    if (existing === null) {
      await ctx.db.insert("users", attributes);
    } else {
      await ctx.db.patch(existing._id, attributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const tokenIdentifier = `https://clerk|${clerkUserId}`;
    const user = await userByTokenIdentifier(ctx, tokenIdentifier);
    if (user !== null) {
      await ctx.db.delete(user._id);
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("can't get current user");
  return user;
}

export async function getCurrentUser(ctx: QueryCtx) {
  // Wrap in try-catch so partially-configured auth (missing
  // CLERK_JWT_ISSUER_DOMAIN or no matching provider) surfaces as a
  // null identity instead of a 500 on every authenticated request.
  let identity;
  try {
    identity = await ctx.auth.getUserIdentity();
  } catch {
    return null;
  }
  if (identity === null) return null;
  return await userByTokenIdentifier(ctx, identity.tokenIdentifier);
}

async function userByTokenIdentifier(ctx: QueryCtx, tokenIdentifier: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .unique();
}
