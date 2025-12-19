<script lang="ts">
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import { theme } from '$lib/stores/theme';
	import { createPageTracker } from '$lib/stores/pageTracking';
	import { api } from '$convex/_generated/api';
	import Layout from '$lib/components/Layout.svelte';
	import PageTransition from '$lib/components/PageTransition.svelte';
	import '../styles/global.css';

	let { children } = $props();

	// Get Convex URL from environment
	const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;

	// Setup Convex
	setupConvex(CONVEX_URL);

	// Enable View Transitions API for modern browsers
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Page tracking
	let tracker: ReturnType<typeof createPageTracker> | null = null;

	onMount(() => {
		// Initialize theme from store
		const unsubscribe = theme.subscribe((t) => {
			document.documentElement.setAttribute('data-theme', t);
		});

		// Setup page tracking
		const client = useConvexClient();

		tracker = createPageTracker(
			async (args) => {
				await client.mutation(api.stats.recordPageView, args);
			},
			async (args) => {
				await client.mutation(api.stats.heartbeat, args);
			}
		);

		// Track initial page
		let currentPath = '';
		page.subscribe(($page) => {
			if ($page.url.pathname !== currentPath) {
				currentPath = $page.url.pathname;
				if (tracker) {
					tracker.track(currentPath);
				}
			}
		});

		return () => {
			unsubscribe();
		};
	});

	onDestroy(() => {
		if (tracker) {
			tracker.cleanup();
		}
	});
</script>

<Layout>
	<PageTransition>
		{@render children()}
	</PageTransition>
</Layout>
