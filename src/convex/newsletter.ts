import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Subscribe to newsletter
 */
export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      return { success: false, message: "Invalid email address" };
    }

    const email = args.email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return { success: false, message: "Already subscribed" };
    }

    // Add subscriber
    await ctx.db.insert("subscribers", {
      email,
      subscribedAt: Date.now(),
      confirmed: true, // In production, you'd send confirmation email
    });

    return { success: true, message: "Successfully subscribed!" };
  },
});

/**
 * Get subscriber count (for stats)
 */
export const getSubscriberCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("subscribers")
      .filter((q) => q.eq(q.field("confirmed"), true))
      .collect();
    return subscribers.length;
  },
});
