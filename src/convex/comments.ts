import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get comments for a post
 */
export const getComments = query({
  args: {
    slug: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      author: v.string(),
      content: v.string(),
      timestamp: v.number(),
      isOwn: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .order("asc")
      .collect();

    return comments.map((comment) => ({
      _id: comment._id,
      author: comment.author,
      content: comment.content,
      timestamp: comment.timestamp,
      isOwn: false, // Will be determined client-side
    }));
  },
});

/**
 * Add a comment to a post
 */
export const addComment = mutation({
  args: {
    slug: v.string(),
    author: v.string(),
    content: v.string(),
    sessionId: v.string(),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    // Basic validation
    if (!args.author.trim() || !args.content.trim()) {
      throw new Error("Author and content are required");
    }

    if (args.author.length > 50) {
      throw new Error("Author name too long");
    }

    if (args.content.length > 2000) {
      throw new Error("Comment too long");
    }

    const id = await ctx.db.insert("comments", {
      slug: args.slug,
      author: args.author.trim(),
      content: args.content.trim(),
      sessionId: args.sessionId,
      timestamp: Date.now(),
    });

    return id;
  },
});

/**
 * Delete own comment
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    sessionId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      return false;
    }

    // Only allow deleting own comments
    if (comment.sessionId !== args.sessionId) {
      throw new Error("Cannot delete other's comments");
    }

    await ctx.db.delete(args.commentId);
    return true;
  },
});
