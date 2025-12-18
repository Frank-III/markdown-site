<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import PostList from '$lib/components/PostList.svelte';

	// Site configuration
	const siteConfig = {
		name: 'markdown "sync" site',
		title: 'Real-time Site with Convex',
		logo: '/images/logo.svg' as string | null,
		bio: `Write in markdown, sync to a real-time database, and deploy in minutes. Every time you sync new posts, they appear immediately without redeploying. Built with Svelte, TypeScript, and Convex for instant updates.`,
		featuredEssays: [
			{ title: 'Setup Guide', slug: 'setup-guide' },
			{ title: 'How to Publish', slug: 'how-to-publish' },
			{ title: 'About This Site', slug: 'about-this-blog' }
		],
		links: {
			docs: '/setup-guide',
			convex: 'https://convex.dev',
			netlify: 'https://netlify.com'
		}
	};

	const posts = useQuery(api.posts.getAllPosts, () => ({}));
</script>

<svelte:head>
	<title>{siteConfig.name}</title>
</svelte:head>

<div class="home">
	<!-- Header section with intro -->
	<header class="home-header">
		<!-- Optional site logo -->
		{#if siteConfig.logo}
			<img src={siteConfig.logo} alt={siteConfig.name} class="home-logo" />
		{/if}
		<h1 class="home-name">{siteConfig.name}</h1>

		<p class="home-intro">
			An open source markdown blog powered by Convex and deployed on Netlify.
			<a
				href="https://github.com/waynesutton/markdown-site"
				target="_blank"
				rel="noopener noreferrer"
				class="home-text-link"
			>
				Fork it
			</a>, customize it, ship it.
		</p>

		<p class="home-bio">{siteConfig.bio}</p>

		<!-- Featured essays section -->
		<div class="home-featured">
			<p class="home-featured-intro">Get started:</p>
			<ul class="home-featured-list">
				{#each siteConfig.featuredEssays as essay}
					<li>
						<a href="/{essay.slug}" class="home-featured-link">
							{essay.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</header>

	<!-- Blog posts section -->
	<section id="posts" class="home-posts">
		{#if posts.data === undefined}
			<!-- Loading -->
		{:else if posts.data.length === 0}
			<p class="no-posts">No posts yet. Check back soon!</p>
		{:else}
			<PostList posts={posts.data} />
		{/if}
	</section>

	<!-- Footer section -->
	<section class="home-footer">
		<p class="home-footer-text">
			Built with
			<a href={siteConfig.links.convex} target="_blank" rel="noopener noreferrer"> Convex </a>
			for real-time sync and deployed on
			<a href={siteConfig.links.netlify} target="_blank" rel="noopener noreferrer"> Netlify </a>.
			Read the
			<a
				href="https://github.com/waynesutton/markdown-site"
				target="_blank"
				rel="noopener noreferrer"
			>
				project on GitHub
			</a>
			to fork and deploy your own. View
			<a href="/stats" class="home-text-link">real-time site stats</a>.
		</p>
	</section>
</div>
