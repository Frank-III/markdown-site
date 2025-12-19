<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { format, parseISO } from 'date-fns';
	import { ArrowRight } from 'lucide-svelte';

	let { slug }: { slug: string } = $props();

	const relatedPosts = useQuery(api.posts.getRelatedPosts, () => ({ slug, limit: 3 }));
</script>

{#if relatedPosts.data && relatedPosts.data.length > 0}
	<div class="related-posts">
		<h3 class="related-title">Related Posts</h3>
		<div class="related-list">
			{#each relatedPosts.data as post}
				<a href="/{post.slug}" class="related-item">
					<div class="related-content">
						<h4 class="related-post-title">{post.title}</h4>
						<p class="related-description">{post.description}</p>
						<div class="related-meta">
							<time>{format(parseISO(post.date), 'MMM yyyy')}</time>
							{#if post.tags.length > 0}
								<span class="related-tags">
									{#each post.tags.slice(0, 2) as tag}
										<span class="related-tag">{tag}</span>
									{/each}
								</span>
							{/if}
						</div>
					</div>
					<ArrowRight size={16} class="related-arrow" />
				</a>
			{/each}
		</div>
	</div>
{/if}

<style>
	.related-posts {
		margin-top: 48px;
		padding-top: 32px;
		border-top: 1px solid var(--border-color);
	}

	.related-title {
		font-size: 18px;
		font-weight: 500;
		margin-bottom: 20px;
		color: var(--text-primary);
	}

	.related-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.related-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.related-item:hover {
		background: var(--bg-hover);
		border-color: var(--text-muted);
	}

	.related-content {
		flex: 1;
		min-width: 0;
	}

	.related-post-title {
		font-size: 15px;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 4px;
	}

	.related-description {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 8px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.related-meta {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 12px;
		color: var(--text-muted);
	}

	.related-tags {
		display: flex;
		gap: 6px;
	}

	.related-tag {
		padding: 2px 8px;
		background: var(--bg-hover);
		border-radius: 10px;
	}

	.related-item :global(.related-arrow) {
		color: var(--text-muted);
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	.related-item:hover :global(.related-arrow) {
		transform: translateX(4px);
		color: var(--text-primary);
	}
</style>
