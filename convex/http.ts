// HTTP actions: Clerk + Circle webhooks. Every webhook HMAC-verified before
// work is queued into internal mutations.

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkRequest(request);
    if (!event) {
      return new Response("invalid webhook signature", { status: 401 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted": {
        const id = event.data.id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId: id });
        break;
      }
      default:
        // ignore other event types
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateClerkRequest(req: Request): Promise<WebhookEvent | null> {
  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-signature": req.headers.get("svix-signature")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payload, headers) as unknown as WebhookEvent;
  } catch {
    return null;
  }
}

export default http;
