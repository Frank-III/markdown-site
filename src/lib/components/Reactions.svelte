<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { browser } from '$app/environment';

	let { slug }: { slug: string } = $props();

	const client = useConvexClient();

	// Get or create session ID
	function getSessionId(): string {
		if (!browser) return '';
		let id = localStorage.getItem('sessionId');
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem('sessionId', id);
		}
		return id;
	}

	const sessionId = browser ? getSessionId() : '';

	const reactions = useQuery(api.reactions.getReactions, () => ({ slug }));
	const userReactions = useQuery(api.reactions.getUserReactions, () => ({ slug, sessionId }));

	async function toggleReaction(emoji: string) {
		if (!sessionId) return;
		await client.mutation(api.reactions.toggleReaction, { slug, emoji, sessionId });
	}

	function hasReacted(emoji: string): boolean {
		return userReactions.data?.includes(emoji) ?? false;
	}
</script>

<div class="reactions">
	<span class="reactions-label">React:</span>
	<div class="reaction-buttons">
		{#if reactions.data}
			{#each reactions.data as reaction}
				<button
					class="reaction-btn"
					class:active={hasReacted(reaction.emoji)}
					onclick={() => toggleReaction(reaction.emoji)}
					aria-label="React with {reaction.emoji}"
				>
					<span class="reaction-emoji">{reaction.emoji}</span>
					{#if reaction.count > 0}
						<span class="reaction-count">{reaction.count}</span>
					{/if}
				</button>
			{/each}
		{/if}
	</div>
</div>

<style>
	.reactions {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 0;
	}

	.reactions-label {
		font-size: 14px;
		color: var(--text-muted);
	}

	.reaction-buttons {
		display: flex;
		gap: 8px;
	}

	.reaction-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.reaction-btn:hover {
		background: var(--bg-hover);
		transform: scale(1.05);
	}

	.reaction-btn.active {
		background: var(--accent);
		border-color: var(--accent);
	}

	.reaction-btn.active .reaction-count {
		color: white;
	}

	.reaction-emoji {
		font-size: 16px;
	}

	.reaction-count {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-secondary);
	}
</style>
