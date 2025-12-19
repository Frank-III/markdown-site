import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const ALLOWED_EMOJIS = ["👍", "🔥", "💡", "❤️", "🎉"];

/**
 * Get reaction counts for a post
 */
export const getReactions = query({
  args: {
    slug: v.string(),
  },
  returns: v.array(
    v.object({
      emoji: v.string(),
      count: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    // Count reactions by emoji
    const counts: Record<string, number> = {};
    for (const reaction of reactions) {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    }

    // Return all emoji types with their counts
    return ALLOWED_EMOJIS.map((emoji) => ({
      emoji,
      count: counts[emoji] || 0,
    }));
  },
});

/**
 * Get user's reactions for a post
 */
export const getUserReactions = query({
  args: {
    slug: v.string(),
    sessionId: v.string(),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_session_slug", (q) =>
        q.eq("sessionId", args.sessionId).eq("slug", args.slug)
      )
      .collect();

    return reactions.map((r) => r.emoji);
  },
});

/**
 * Toggle a reaction on a post
 */
export const toggleReaction = mutation({
  args: {
    slug: v.string(),
    emoji: v.string(),
    sessionId: v.string(),
  },
  returns: v.boolean(), // true if added, false if removed
  handler: async (ctx, args) => {
    if (!ALLOWED_EMOJIS.includes(args.emoji)) {
      throw new Error("Invalid emoji");
    }

    // Check if user already reacted with this emoji
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_session_slug", (q) =>
        q.eq("sessionId", args.sessionId).eq("slug", args.slug)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (existing) {
      // Remove reaction
      await ctx.db.delete(existing._id);
      return false;
    } else {
      // Add reaction
      await ctx.db.insert("reactions", {
        slug: args.slug,
        emoji: args.emoji,
        sessionId: args.sessionId,
        timestamp: Date.now(),
      });
      return true;
    }
  },
});
