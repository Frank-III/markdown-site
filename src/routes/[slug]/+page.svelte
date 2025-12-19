<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import BlogPost from '$lib/components/BlogPost.svelte';
	import CopyPageDropdown from '$lib/components/CopyPageDropdown.svelte';
	import LiveReaders from '$lib/components/LiveReaders.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import ReadingProgress from '$lib/components/ReadingProgress.svelte';
	import Reactions from '$lib/components/Reactions.svelte';
	import RelatedPosts from '$lib/components/RelatedPosts.svelte';
	import Comments from '$lib/components/Comments.svelte';
	import Newsletter from '$lib/components/Newsletter.svelte';
	import { format, parseISO } from 'date-fns';
	import { ArrowLeft, Link as LinkIcon, Twitter, Rss } from 'lucide-svelte';
	import { browser } from '$app/environment';

	const SITE_URL = 'https://markdowncms.netlify.app';
	const SITE_NAME = 'Markdown Site';

	const slug = $derived($page.params.slug);

	// Query page first, then post
	const pageData = useQuery(api.pages.getPageBySlug, () => ({ slug }));
	const postData = useQuery(api.posts.getPostBySlug, () => ({ slug }));

	let copied = $state(false);

	function handleBack() {
		goto('/');
	}

	async function handleCopyLink() {
		if (browser) {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	function handleShareTwitter() {
		if (browser && postData.data) {
			const text = encodeURIComponent(postData.data.title);
			const url = encodeURIComponent(window.location.href);
			window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
		}
	}

	const currentUrl = $derived(browser ? window.location.href : `${SITE_URL}/${slug}`);
</script>

<svelte:head>
	{#if pageData.data}
		<title>{pageData.data.title} | {SITE_NAME}</title>
	{:else if postData.data}
		<title>{postData.data.title} | {SITE_NAME}</title>
		<meta name="description" content={postData.data.description} />
		<meta property="og:title" content={postData.data.title} />
		<meta property="og:description" content={postData.data.description} />
		<meta property="og:type" content="article" />
	{/if}
</svelte:head>

{#if pageData.data === undefined || postData.data === undefined}
	<!-- Loading -->
{:else if pageData.data}
	<!-- Static page -->
	<div class="post-page">
		<nav class="post-nav">
			<button onclick={handleBack} class="back-button">
				<ArrowLeft size={16} />
				<span>Back</span>
			</button>
			<CopyPageDropdown
				title={pageData.data.title}
				content={pageData.data.content}
				url={currentUrl}
			/>
		</nav>

		<article class="post-article">
			<header class="post-header">
				<h1 class="post-title">{pageData.data.title}</h1>
			</header>

			<BlogPost content={pageData.data.content} />
		</article>
	</div>
{:else if postData.data}
	<!-- Blog post -->
	<ReadingProgress />
	<div class="post-page">
		<nav class="post-nav">
			<button onclick={handleBack} class="back-button">
				<ArrowLeft size={16} />
				<span>Back</span>
			</button>
			<CopyPageDropdown
				title={postData.data.title}
				content={postData.data.content}
				url={currentUrl}
			/>
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
				</div>
				{#if postData.data.description}
					<p class="post-description">{postData.data.description}</p>
				{/if}
				<LiveReaders path="/{slug}" />
			</header>

			<TableOfContents content={postData.data.content} />

			<BlogPost content={postData.data.content} />

			<footer class="post-footer">
				<Reactions {slug} />

				<div class="post-share">
					<button onclick={handleCopyLink} class="share-button" aria-label="Copy link">
						<LinkIcon size={16} />
						<span>{copied ? 'Copied!' : 'Copy link'}</span>
					</button>
					<button onclick={handleShareTwitter} class="share-button" aria-label="Share on Twitter">
						<Twitter size={16} />
						<span>Tweet</span>
					</button>
					<a
						href="/rss.xml"
						target="_blank"
						rel="noopener noreferrer"
						class="share-button"
						aria-label="RSS Feed"
					>
						<Rss size={16} />
						<span>RSS</span>
					</a>
				</div>

				{#if postData.data.tags && postData.data.tags.length > 0}
					<div class="post-tags">
						{#each postData.data.tags as tag}
							<span class="post-tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</footer>

			<RelatedPosts {slug} />
			<Newsletter />
			<Comments {slug} />
		</article>
	</div>
{:else}
	<!-- Not found -->
	<div class="post-page">
		<div class="post-not-found">
			<h1>Page not found</h1>
			<p>The page you're looking for doesn't exist or has been removed.</p>
			<a href="/" class="back-link">
				<ArrowLeft size={16} />
				Back to home
			</a>
		</div>
	</div>
{/if}
