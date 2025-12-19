<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api';

	let { currentSlug = '' }: { currentSlug?: string } = $props();

	const allPosts = useQuery(api.posts.getAllPosts, () => ({}));

	let showHint = $state(false);

	onMount(() => {
		if (!browser) return;

		function handleKeydown(e: KeyboardEvent) {
			// Ignore if typing in input/textarea
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
				return;
			}

			// Ignore if modal or popup is open
			if (document.querySelector('.lightbox-overlay, .search-overlay')) {
				return;
			}

			const posts = allPosts.data;
			if (!posts || posts.length === 0) return;

			const currentIndex = currentSlug
				? posts.findIndex((p) => p.slug === currentSlug)
				: -1;

			if (e.key === 'j' || e.key === 'J') {
				// Next post
				e.preventDefault();
				if (currentIndex === -1) {
					// On home, go to first post
					goto(`/${posts[0].slug}`);
				} else if (currentIndex < posts.length - 1) {
					goto(`/${posts[currentIndex + 1].slug}`);
				}
				showNavigationHint('Next post');
			} else if (e.key === 'k' || e.key === 'K') {
				// Previous post
				e.preventDefault();
				if (currentIndex > 0) {
					goto(`/${posts[currentIndex - 1].slug}`);
				} else if (currentIndex === 0) {
					goto('/');
				}
				showNavigationHint('Previous post');
			} else if (e.key === 'h' || e.key === 'H') {
				// Go home
				e.preventDefault();
				goto('/');
				showNavigationHint('Home');
			} else if (e.key === '?') {
				// Show keyboard shortcuts
				e.preventDefault();
				showHint = !showHint;
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	function showNavigationHint(text: string) {
		// Could add a toast notification here
	}
</script>

{#if showHint}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="keyboard-hint-overlay"
		onclick={() => (showHint = false)}
		onkeydown={(e) => e.key === 'Escape' && (showHint = false)}
		role="dialog"
		aria-modal="true"
		aria-label="Keyboard shortcuts"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="keyboard-hint" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<h3>Keyboard Shortcuts</h3>
			<div class="shortcut-list">
				<div class="shortcut">
					<kbd>j</kbd>
					<span>Next post</span>
				</div>
				<div class="shortcut">
					<kbd>k</kbd>
					<span>Previous post</span>
				</div>
				<div class="shortcut">
					<kbd>h</kbd>
					<span>Go home</span>
				</div>
				<div class="shortcut">
					<kbd>⌘</kbd> + <kbd>k</kbd>
					<span>Search</span>
				</div>
				<div class="shortcut">
					<kbd>?</kbd>
					<span>Show shortcuts</span>
				</div>
				<div class="shortcut">
					<kbd>esc</kbd>
					<span>Close dialogs</span>
				</div>
			</div>
			<button class="hint-close" onclick={() => (showHint = false)}>Close</button>
		</div>
	</div>
{/if}

<style>
	.keyboard-hint-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1500;
		animation: fadeIn 0.15s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
	}

	.keyboard-hint {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 24px;
		min-width: 300px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
	}

	.keyboard-hint h3 {
		font-size: 16px;
		font-weight: 500;
		margin-bottom: 16px;
		color: var(--text-primary);
	}

	.shortcut-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 20px;
	}

	.shortcut {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: var(--text-secondary);
	}

	kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		padding: 0 6px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		font-family: inherit;
		font-size: 12px;
		color: var(--text-primary);
	}

	.hint-close {
		width: 100%;
		padding: 10px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		cursor: pointer;
	}

	.hint-close:hover {
		background: var(--bg-hover);
	}
</style>
