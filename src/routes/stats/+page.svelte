<script lang="ts">
	import { goto } from '$app/navigation';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { ArrowLeft, Users, Eye, FileText, BookOpen, Activity } from 'lucide-svelte';

	const SITE_LAUNCH_DATE = 'Dec 14, 2025 at 1:00 PM';

	function formatTrackingDate(timestamp: number | null): string {
		if (!timestamp) return 'No data yet';
		const date = new Date(timestamp);
		const dateStr = date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
		const timeStr = date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit'
		});
		return `${dateStr} at ${timeStr}`;
	}

	const stats = useQuery(api.stats.getStats, () => ({}));

	function handleBack() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Site Statistics | Markdown Site</title>
</svelte:head>

{#if stats.data === undefined}
	<!-- Loading -->
{:else}
	<div class="stats-page">
		<!-- Header with back button -->
		<nav class="stats-nav">
			<button onclick={handleBack} class="back-button">
				<ArrowLeft size={16} />
				<span>Back</span>
			</button>
		</nav>

		<!-- Page header -->
		<header class="stats-header">
			<h1 class="stats-title">Site Statistics</h1>
			<p class="stats-subtitle">Real-time analytics for this site. All data updates automatically.</p>
		</header>

		<!-- Stats cards grid -->
		<section class="stats-grid">
			<!-- Active visitors card -->
			<div class="stat-card">
				<div class="stat-card-header">
					<Activity size={18} class="stat-card-icon" />
					<span class="stat-card-label">Active Now</span>
				</div>
				<div class="stat-card-value">{stats.data.activeVisitors}</div>
				<div class="stat-card-desc">Visitors on site</div>
			</div>

			<!-- Total page views card -->
			<div class="stat-card">
				<div class="stat-card-header">
					<Eye size={18} class="stat-card-icon" />
					<span class="stat-card-label">Total Views</span>
				</div>
				<div class="stat-card-value">{stats.data.totalPageViews}</div>
				<div class="stat-card-desc">Since {formatTrackingDate(stats.data.trackingSince)}</div>
				<div class="stat-card-note">Site launched {SITE_LAUNCH_DATE}</div>
			</div>

			<!-- Unique visitors card -->
			<div class="stat-card">
				<div class="stat-card-header">
					<Users size={18} class="stat-card-icon" />
					<span class="stat-card-label">Unique Visitors</span>
				</div>
				<div class="stat-card-value">{stats.data.uniqueVisitors}</div>
				<div class="stat-card-desc">Unique sessions</div>
			</div>

			<!-- Published posts card -->
			<div class="stat-card">
				<div class="stat-card-header">
					<BookOpen size={18} class="stat-card-icon" />
					<span class="stat-card-label">Blog Posts</span>
				</div>
				<div class="stat-card-value">{stats.data.publishedPosts}</div>
				<div class="stat-card-desc">Published posts</div>
			</div>

			<!-- Published pages card -->
			<div class="stat-card">
				<div class="stat-card-header">
					<FileText size={18} class="stat-card-icon" />
					<span class="stat-card-label">Pages</span>
				</div>
				<div class="stat-card-value">{stats.data.publishedPages}</div>
				<div class="stat-card-desc">Static pages</div>
			</div>
		</section>

		<!-- Active visitors by page -->
		{#if stats.data.activeByPath.length > 0}
			<section class="stats-section">
				<h2 class="stats-section-title">Currently Viewing</h2>
				<div class="stats-list">
					{#each stats.data.activeByPath as item}
						<div class="stats-list-item">
							<span class="stats-list-path">
								{item.path === '/' ? 'Home' : item.path}
							</span>
							<span class="stats-list-count">
								{item.count}
								{item.count === 1 ? 'visitor' : 'visitors'}
							</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Page views by page -->
		{#if stats.data.pageStats.length > 0}
			<section class="stats-section">
				<h2 class="stats-section-title">Views by Page</h2>
				<div class="stats-list">
					{#each stats.data.pageStats as item}
						<div class="stats-list-item">
							<div class="stats-list-info">
								<span class="stats-list-title">{item.title}</span>
								<span class="stats-list-type">{item.pageType}</span>
							</div>
							<span class="stats-list-count">
								{item.views}
								{item.views === 1 ? 'view' : 'views'}
							</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
