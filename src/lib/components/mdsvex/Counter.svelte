<script lang="ts">
	import { Minus, Plus } from 'lucide-svelte';

	let { initial = 0 }: { initial?: number } = $props();
	let count = $state(initial);
</script>

<div class="counter">
	<button class="counter-btn" onclick={() => count--} aria-label="Decrease">
		<Minus size={16} />
	</button>
	<span class="counter-value">{count}</span>
	<button class="counter-btn" onclick={() => count++} aria-label="Increase">
		<Plus size={16} />
	</button>
</div>

<style>
	.counter {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 8px 16px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		margin: 16px 0;
	}

	.counter-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.counter-btn:hover {
		background: var(--bg-hover);
		border-color: var(--text-muted);
	}

	.counter-value {
		font-size: 1.25rem;
		font-weight: 600;
		min-width: 40px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
</style>
