<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import ThemeToggle from './ThemeToggle.svelte';
	import Search from './Search.svelte';

	let { children } = $props();

	const pages = useQuery(api.pages.getAllPages, () => ({}));
</script>

<div class="layout">
	<!-- Top navigation bar with page links and theme toggle -->
	<div class="top-nav">
		<!-- Page navigation links -->
		{#if pages.data && pages.data.length > 0}
			<nav class="page-nav">
				{#each pages.data as page}
					<a href="/{page.slug}" class="page-nav-link">
						{page.title}
					</a>
				{/each}
			</nav>
		{/if}
		<!-- Search and Theme toggle -->
		<div class="nav-actions">
			<Search />
			<ThemeToggle />
		</div>
	</div>
	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
