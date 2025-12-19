<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { Eye } from 'lucide-svelte';

	let { path }: { path: string } = $props();

	const activeReaders = useQuery(api.stats.getActiveReadersForPath, () => ({ path }));
</script>

{#if activeReaders.data !== undefined && activeReaders.data > 0}
	<div class="live-readers">
		<span class="live-dot"></span>
		<Eye size={14} />
		<span class="reader-count">
			{activeReaders.data} {activeReaders.data === 1 ? 'person' : 'people'} reading now
		</span>
	</div>
{/if}

<style>
	.live-readers {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		color: var(--text-secondary);
		padding: 6px 12px;
		background: var(--bg-secondary);
		border-radius: 20px;
		width: fit-content;
	}

	.live-dot {
		width: 8px;
		height: 8px;
		background: #22c55e;
		border-radius: 50%;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.reader-count {
		font-weight: 500;
	}
</style>
