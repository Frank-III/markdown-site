import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get highlights/annotations for a post
 */
export const getHighlights = query({
  args: {
    slug: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("highlights"),
      text: v.string(),
      comment: v.string(),
      author: v.string(),
      startOffset: v.number(),
      endOffset: v.number(),
      timestamp: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const highlights = await ctx.db
      .query("highlights")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .order("asc")
      .collect();

    return highlights.map((h) => ({
      _id: h._id,
      text: h.text,
      comment: h.comment,
      author: h.author,
      startOffset: h.startOffset,
      endOffset: h.endOffset,
      timestamp: h.timestamp,
    }));
  },
});

/**
 * Add a highlight/annotation
 */
export const addHighlight = mutation({
  args: {
    slug: v.string(),
    text: v.string(),
    comment: v.string(),
    author: v.string(),
    startOffset: v.number(),
    endOffset: v.number(),
    sessionId: v.string(),
  },
  returns: v.id("highlights"),
  handler: async (ctx, args) => {
    if (!args.text.trim() || !args.comment.trim()) {
      throw new Error("Text and comment are required");
    }

    const id = await ctx.db.insert("highlights", {
      slug: args.slug,
      text: args.text.trim(),
      comment: args.comment.trim(),
      author: args.author.trim() || "Anonymous",
      startOffset: args.startOffset,
      endOffset: args.endOffset,
      sessionId: args.sessionId,
      timestamp: Date.now(),
    });

    return id;
  },
});

/**
 * Delete a highlight
 */
export const deleteHighlight = mutation({
  args: {
    highlightId: v.id("highlights"),
    sessionId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const highlight = await ctx.db.get(args.highlightId);
    if (!highlight || highlight.sessionId !== args.sessionId) {
      return false;
    }
    await ctx.db.delete(args.highlightId);
    return true;
  },
});
