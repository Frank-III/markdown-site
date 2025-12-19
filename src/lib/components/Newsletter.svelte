<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { Mail, Check, AlertCircle } from 'lucide-svelte';

	const client = useConvexClient();

	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let message = $state('');

	async function subscribe() {
		if (!email.trim() || status === 'loading') return;

		status = 'loading';
		try {
			const result = await client.mutation(api.newsletter.subscribe, { email: email.trim() });
			if (result.success) {
				status = 'success';
				message = result.message;
				email = '';
			} else {
				status = 'error';
				message = result.message;
			}
		} catch (e) {
			status = 'error';
			message = 'Something went wrong. Please try again.';
		}

		// Reset after delay
		setTimeout(() => {
			if (status !== 'loading') {
				status = 'idle';
				message = '';
			}
		}, 3000);
	}
</script>

<div class="newsletter">
	<div class="newsletter-header">
		<Mail size={20} />
		<h3 class="newsletter-title">Subscribe to updates</h3>
	</div>
	<p class="newsletter-desc">Get notified when new posts are published.</p>

	<form class="newsletter-form" onsubmit={(e) => { e.preventDefault(); subscribe(); }}>
		<input
			type="email"
			bind:value={email}
			placeholder="your@email.com"
			class="newsletter-input"
			disabled={status === 'loading' || status === 'success'}
		/>
		<button
			type="submit"
			class="newsletter-btn"
			disabled={status === 'loading' || status === 'success' || !email.trim()}
		>
			{#if status === 'loading'}
				Subscribing...
			{:else if status === 'success'}
				<Check size={16} />
				Subscribed!
			{:else}
				Subscribe
			{/if}
		</button>
	</form>

	{#if message}
		<div class="newsletter-message" class:error={status === 'error'} class:success={status === 'success'}>
			{#if status === 'error'}
				<AlertCircle size={14} />
			{:else if status === 'success'}
				<Check size={14} />
			{/if}
			{message}
		</div>
	{/if}
</div>

<style>
	.newsletter {
		padding: 24px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		margin: 32px 0;
	}

	.newsletter-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		color: var(--text-primary);
	}

	.newsletter-title {
		font-size: 16px;
		font-weight: 500;
		margin: 0;
	}

	.newsletter-desc {
		font-size: 14px;
		color: var(--text-muted);
		margin-bottom: 16px;
	}

	.newsletter-form {
		display: flex;
		gap: 8px;
	}

	.newsletter-input {
		flex: 1;
		padding: 10px 14px;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		font-size: 14px;
		color: var(--text-primary);
	}

	.newsletter-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.newsletter-input::placeholder {
		color: var(--text-muted);
	}

	.newsletter-input:disabled {
		opacity: 0.6;
	}

	.newsletter-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s ease;
		white-space: nowrap;
	}

	.newsletter-btn:hover:not(:disabled) {
		opacity: 0.9;
	}

	.newsletter-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.newsletter-message {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 12px;
		font-size: 13px;
	}

	.newsletter-message.success {
		color: #22c55e;
	}

	.newsletter-message.error {
		color: #ef4444;
	}

	@media (max-width: 480px) {
		.newsletter-form {
			flex-direction: column;
		}

		.newsletter-btn {
			justify-content: center;
		}
	}
</style>
