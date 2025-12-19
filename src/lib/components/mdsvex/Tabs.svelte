<script lang="ts">
	import type { Snippet } from 'svelte';

	let { tabs, children }: { tabs: string[]; children: Snippet<[number]> } = $props();
	let activeTab = $state(0);
</script>

<div class="tabs-container">
	<div class="tabs-header">
		{#each tabs as tab, i}
			<button
				class="tab-button"
				class:active={activeTab === i}
				onclick={() => (activeTab = i)}
			>
				{tab}
			</button>
		{/each}
	</div>
	<div class="tabs-content">
		{@render children(activeTab)}
	</div>
</div>

<style>
	.tabs-container {
		margin: 24px 0;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		overflow: hidden;
	}

	.tabs-header {
		display: flex;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
	}

	.tab-button {
		padding: 12px 20px;
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: 14px;
		cursor: pointer;
		transition: all 0.15s ease;
		position: relative;
	}

	.tab-button:hover {
		color: var(--text-primary);
		background: var(--bg-hover);
	}

	.tab-button.active {
		color: var(--text-primary);
		font-weight: 500;
	}

	.tab-button.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--accent);
	}

	.tabs-content {
		padding: 20px;
	}
</style>
