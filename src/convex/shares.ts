import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get share counts for a post
 */
export const getShareCounts = query({
  args: {
    slug: v.string(),
  },
  returns: v.object({
    total: v.number(),
    copy: v.number(),
    twitter: v.number(),
  }),
  handler: async (ctx, args) => {
    const counts = await ctx.db
      .query("shareCounts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    const result = { total: 0, copy: 0, twitter: 0 };
    for (const count of counts) {
      if (count.platform === "total") result.total = count.count;
      if (count.platform === "copy") result.copy = count.count;
      if (count.platform === "twitter") result.twitter = count.count;
    }

    return result;
  },
});

/**
 * Increment share count
 */
export const incrementShare = mutation({
  args: {
    slug: v.string(),
    platform: v.string(), // "copy" | "twitter"
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Increment platform-specific count
    const platformCount = await ctx.db
      .query("shareCounts")
      .withIndex("by_slug_platform", (q) =>
        q.eq("slug", args.slug).eq("platform", args.platform)
      )
      .first();

    if (platformCount) {
      await ctx.db.patch(platformCount._id, { count: platformCount.count + 1 });
    } else {
      await ctx.db.insert("shareCounts", {
        slug: args.slug,
        platform: args.platform,
        count: 1,
      });
    }

    // Increment total count
    const totalCount = await ctx.db
      .query("shareCounts")
      .withIndex("by_slug_platform", (q) =>
        q.eq("slug", args.slug).eq("platform", "total")
      )
      .first();

    if (totalCount) {
      await ctx.db.patch(totalCount._id, { count: totalCount.count + 1 });
    } else {
      await ctx.db.insert("shareCounts", {
        slug: args.slug,
        platform: "total",
        count: 1,
      });
    }

    return null;
  },
});
