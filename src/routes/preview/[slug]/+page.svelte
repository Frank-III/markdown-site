<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import BlogPost from '$lib/components/BlogPost.svelte';
	import { format, parseISO } from 'date-fns';
	import { ArrowLeft, Eye, EyeOff } from 'lucide-svelte';

	const slug = $derived($page.params.slug);
	const postData = useQuery(api.posts.getPostBySlugPreview, () => ({ slug }));

	function handleBack() {
		goto('/');
	}
</script>

<svelte:head>
	{#if postData.data}
		<title>[PREVIEW] {postData.data.title}</title>
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

{#if postData.data === undefined}
	<!-- Loading -->
{:else if postData.data}
	<div class="post-page">
		<!-- Preview banner -->
		<div class="preview-banner">
			{#if postData.data.published}
				<Eye size={16} />
				<span>Preview Mode - This post is published</span>
			{:else}
				<EyeOff size={16} />
				<span>Preview Mode - This post is a draft</span>
			{/if}
		</div>

		<nav class="post-nav">
			<button onclick={handleBack} class="back-button">
				<ArrowLeft size={16} />
				<span>Back</span>
			</button>
		</nav>

		<article class="post-article">
			<header class="post-header">
				<h1 class="post-title">{postData.data.title}</h1>
				<div class="post-meta-header">
					<time class="post-date">
						{format(parseISO(postData.data.date), 'MMMM yyyy')}
					</time>
					{#if postData.data.readTime}
						<span class="post-meta-separator">·</span>
						<span class="post-read-time">{postData.data.readTime}</span>
					{/if}
					{#if !postData.data.published}
						<span class="post-meta-separator">·</span>
						<span class="draft-badge">Draft</span>
					{/if}
				</div>
				{#if postData.data.description}
					<p class="post-description">{postData.data.description}</p>
				{/if}
			</header>

			<BlogPost content={postData.data.content} />

			{#if postData.data.tags && postData.data.tags.length > 0}
				<footer class="post-footer">
					<div class="post-tags">
						{#each postData.data.tags as tag}
							<span class="post-tag">{tag}</span>
						{/each}
					</div>
				</footer>
			{/if}
		</article>
	</div>
{:else}
	<div class="post-page">
		<div class="post-not-found">
			<h1>Post not found</h1>
			<p>The post you're looking for doesn't exist.</p>
			<a href="/" class="back-link">
				<ArrowLeft size={16} />
				Back to home
			</a>
		</div>
	</div>
{/if}

<style>
	.preview-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px;
		background: linear-gradient(135deg, #f59e0b, #d97706);
		color: white;
		font-size: 14px;
		font-weight: 500;
		margin: -40px -24px 24px;
		border-radius: 0;
	}

	.draft-badge {
		padding: 2px 8px;
		background: #f59e0b;
		color: white;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.preview-banner {
			margin: -24px -16px 16px;
		}
	}
</style>
