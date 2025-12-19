<script lang="ts">
	import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-svelte';

	type CalloutType = 'info' | 'warning' | 'success' | 'error';

	let { type = 'info', title = '' }: { type?: CalloutType; title?: string } = $props();

	const icons = {
		info: Info,
		warning: AlertTriangle,
		success: CheckCircle,
		error: XCircle
	};

	const Icon = $derived(icons[type]);
</script>

<div class="callout callout-{type}">
	<div class="callout-header">
		<Icon size={18} />
		{#if title}
			<span class="callout-title">{title}</span>
		{/if}
	</div>
	<div class="callout-content">
		<slot />
	</div>
</div>

<style>
	.callout {
		border-radius: 8px;
		padding: 16px;
		margin: 24px 0;
		border-left: 4px solid;
	}

	.callout-info {
		background: rgba(59, 130, 246, 0.1);
		border-color: #3b82f6;
	}

	.callout-warning {
		background: rgba(245, 158, 11, 0.1);
		border-color: #f59e0b;
	}

	.callout-success {
		background: rgba(34, 197, 94, 0.1);
		border-color: #22c55e;
	}

	.callout-error {
		background: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
	}

	.callout-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		font-weight: 600;
	}

	.callout-info .callout-header {
		color: #3b82f6;
	}

	.callout-warning .callout-header {
		color: #f59e0b;
	}

	.callout-success .callout-header {
		color: #22c55e;
	}

	.callout-error .callout-header {
		color: #ef4444;
	}

	.callout-content {
		color: var(--text-primary);
	}

	.callout-content :global(p) {
		margin: 0;
	}
</style>
