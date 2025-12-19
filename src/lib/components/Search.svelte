<script lang="ts">
	import { Search as SearchIcon, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let isOpen = $state(false);
	let query = $state('');
	let results = $state<Array<{ slug: string; title: string; description: string; tags: string[] }>>(
		[]
	);
	let loading = $state(false);
	let inputRef: HTMLInputElement;

	async function search() {
		if (!query.trim()) {
			results = [];
			return;
		}

		loading = true;
		try {
			const response = await fetch(`/api/posts?q=${encodeURIComponent(query)}`);
			results = await response.json();
		} catch (e) {
			results = [];
		}
		loading = false;
	}

	function open() {
		isOpen = true;
		setTimeout(() => inputRef?.focus(), 100);
	}

	function close() {
		isOpen = false;
		query = '';
		results = [];
	}

	function selectResult(slug: string) {
		close();
		goto(`/${slug}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	// Global keyboard shortcut
	$effect(() => {
		if (!browser) return;

		function handleGlobalKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				if (isOpen) {
					close();
				} else {
					open();
				}
			}
		}

		window.addEventListener('keydown', handleGlobalKeydown);
		return () => window.removeEventListener('keydown', handleGlobalKeydown);
	});

	$effect(() => {
		if (query) {
			const timeoutId = setTimeout(search, 300);
			return () => clearTimeout(timeoutId);
		} else {
			results = [];
		}
	});
</script>

<button class="search-trigger" onclick={open} aria-label="Search">
	<SearchIcon size={18} />
	<span class="search-shortcut">⌘K</span>
</button>

{#if isOpen}
	<div class="search-overlay" onclick={close} onkeydown={handleKeydown} role="button" tabindex="-1">
		<div class="search-modal" onclick={(e) => e.stopPropagation()} role="dialog">
			<div class="search-header">
				<SearchIcon size={20} />
				<input
					bind:this={inputRef}
					bind:value={query}
					type="text"
					placeholder="Search posts..."
					class="search-input"
				/>
				<button class="search-close" onclick={close} aria-label="Close search">
					<X size={18} />
				</button>
			</div>

			<div class="search-results">
				{#if loading}
					<div class="search-loading">Searching...</div>
				{:else if query && results.length === 0}
					<div class="search-empty">No results found</div>
				{:else}
					{#each results as result}
						<button class="search-result" onclick={() => selectResult(result.slug)}>
							<div class="result-title">{result.title}</div>
							<div class="result-description">{result.description}</div>
							{#if result.tags.length > 0}
								<div class="result-tags">
									{#each result.tags.slice(0, 3) as tag}
										<span class="result-tag">{tag}</span>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.search-trigger {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.search-trigger:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.search-shortcut {
		font-size: 12px;
		opacity: 0.6;
	}

	.search-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 15vh;
		z-index: 1000;
		animation: fadeIn 0.15s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
	}

	.search-modal {
		width: 100%;
		max-width: 560px;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		animation: slideIn 0.2s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
	}

	.search-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-bottom: 1px solid var(--border-color);
		color: var(--text-muted);
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 16px;
		color: var(--text-primary);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.search-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		border-radius: 4px;
	}

	.search-close:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.search-results {
		max-height: 400px;
		overflow-y: auto;
	}

	.search-loading,
	.search-empty {
		padding: 32px;
		text-align: center;
		color: var(--text-muted);
	}

	.search-result {
		display: block;
		width: 100%;
		padding: 16px;
		background: transparent;
		border: none;
		text-align: left;
		cursor: pointer;
		transition: background 0.1s ease;
	}

	.search-result:hover {
		background: var(--bg-secondary);
	}

	.search-result:not(:last-child) {
		border-bottom: 1px solid var(--border-color);
	}

	.result-title {
		font-size: 15px;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 4px;
	}

	.result-description {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 8px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.result-tags {
		display: flex;
		gap: 6px;
	}

	.result-tag {
		font-size: 11px;
		padding: 2px 8px;
		background: var(--bg-hover);
		color: var(--text-muted);
		border-radius: 10px;
	}
</style>
