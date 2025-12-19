import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get all published posts, sorted by date descending
export const getAllPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      published: v.boolean(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Sort by date descending
    const sortedPosts = posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Return without content for list view
    return sortedPosts.map((post) => ({
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
    }));
  },
});

// Get a single post by slug
export const getPostBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      date: v.string(),
      published: v.boolean(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post || !post.published) {
      return null;
    }

    return {
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
    };
  },
});

// Internal mutation for syncing posts from markdown files
export const syncPosts = internalMutation({
  args: {
    posts: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        description: v.string(),
        content: v.string(),
        date: v.string(),
        published: v.boolean(),
        tags: v.array(v.string()),
        readTime: v.optional(v.string()),
        image: v.optional(v.string()),
      }),
    ),
  },
  returns: v.object({
    created: v.number(),
    updated: v.number(),
    deleted: v.number(),
  }),
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;
    let deleted = 0;

    const now = Date.now();
    const incomingSlugs = new Set(args.posts.map((p) => p.slug));

    // Get all existing posts
    const existingPosts = await ctx.db.query("posts").collect();
    const existingBySlug = new Map(existingPosts.map((p) => [p.slug, p]));

    // Upsert incoming posts
    for (const post of args.posts) {
      const existing = existingBySlug.get(post.slug);

      if (existing) {
        // Update existing post
        await ctx.db.patch(existing._id, {
          title: post.title,
          description: post.description,
          content: post.content,
          date: post.date,
          published: post.published,
          tags: post.tags,
          readTime: post.readTime,
          image: post.image,
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new post
        await ctx.db.insert("posts", {
          ...post,
          lastSyncedAt: now,
        });
        created++;
      }
    }

    // Delete posts that no longer exist in the repo
    for (const existing of existingPosts) {
      if (!incomingSlugs.has(existing.slug)) {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted };
  },
});

// Public mutation wrapper for sync script (no auth required for build-time sync)
export const syncPostsPublic = mutation({
  args: {
    posts: v.array(
      v.object({
        slug: v.string(),
        title: v.string(),
        description: v.string(),
        content: v.string(),
        date: v.string(),
        published: v.boolean(),
        tags: v.array(v.string()),
        readTime: v.optional(v.string()),
        image: v.optional(v.string()),
      }),
    ),
  },
  returns: v.object({
    created: v.number(),
    updated: v.number(),
    deleted: v.number(),
  }),
  handler: async (ctx, args) => {
    let created = 0;
    let updated = 0;
    let deleted = 0;

    const now = Date.now();
    const incomingSlugs = new Set(args.posts.map((p) => p.slug));

    // Get all existing posts
    const existingPosts = await ctx.db.query("posts").collect();
    const existingBySlug = new Map(existingPosts.map((p) => [p.slug, p]));

    // Upsert incoming posts
    for (const post of args.posts) {
      const existing = existingBySlug.get(post.slug);

      if (existing) {
        // Update existing post
        await ctx.db.patch(existing._id, {
          title: post.title,
          description: post.description,
          content: post.content,
          date: post.date,
          published: post.published,
          tags: post.tags,
          readTime: post.readTime,
          image: post.image,
          lastSyncedAt: now,
        });
        updated++;
      } else {
        // Create new post
        await ctx.db.insert("posts", {
          ...post,
          lastSyncedAt: now,
        });
        created++;
      }
    }

    // Delete posts that no longer exist in the repo
    for (const existing of existingPosts) {
      if (!incomingSlugs.has(existing.slug)) {
        await ctx.db.delete(existing._id);
        deleted++;
      }
    }

    return { created, updated, deleted };
  },
});

// Public mutation for incrementing view count
export const incrementViewCount = mutation({
  args: {
    slug: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("viewCounts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
      });
    } else {
      await ctx.db.insert("viewCounts", {
        slug: args.slug,
        count: 1,
      });
    }

    return null;
  },
});

// Get view count for a post
export const getViewCount = query({
  args: {
    slug: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const viewCount = await ctx.db
      .query("viewCounts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return viewCount?.count ?? 0;
  },
});

// Get related posts by tags
export const getRelatedPosts = query({
  args: {
    slug: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      tags: v.array(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3;

    // Get current post
    const currentPost = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!currentPost || !currentPost.tags.length) {
      return [];
    }

    // Get all published posts
    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    // Score posts by tag overlap
    const scoredPosts = allPosts
      .filter((p) => p.slug !== args.slug)
      .map((post) => {
        const commonTags = post.tags.filter((tag) =>
          currentPost.tags.includes(tag)
        );
        return { post, score: commonTags.length };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredPosts.map((p) => ({
      _id: p.post._id,
      slug: p.post.slug,
      title: p.post.title,
      description: p.post.description,
      date: p.post.date,
      tags: p.post.tags,
    }));
  },
});

// Get post by slug including drafts (for preview mode)
export const getPostBySlugPreview = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      date: v.string(),
      published: v.boolean(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post) {
      return null;
    }

    return {
      _id: post._id,
      _creationTime: post._creationTime,
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      date: post.date,
      published: post.published,
      tags: post.tags,
      readTime: post.readTime,
      image: post.image,
    };
  },
});

// Get all posts including drafts (for preview mode)
export const getAllPostsWithDrafts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      date: v.string(),
      published: v.boolean(),
      tags: v.array(v.string()),
      readTime: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();

    return posts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((post) => ({
        _id: post._id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        published: post.published,
        tags: post.tags,
        readTime: post.readTime,
      }));
  },
});
