<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { MessageSquarePlus, X, Send } from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';

	let { slug }: { slug: string } = $props();

	const client = useConvexClient();
	const highlights = useQuery(api.highlights.getHighlights, () => ({ slug }));

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

	let showPopup = $state(false);
	let popupPosition = $state({ x: 0, y: 0 });
	let selectedText = $state('');
	let selectionRange = $state<{ start: number; end: number } | null>(null);
	let commentText = $state('');
	let authorName = $state('');
	let submitting = $state(false);

	onMount(() => {
		if (!browser) return;

		authorName = localStorage.getItem('commentAuthor') || '';

		function handleSelection() {
			const selection = window.getSelection();
			if (!selection || selection.isCollapsed) {
				showPopup = false;
				return;
			}

			const text = selection.toString().trim();
			if (text.length < 3 || text.length > 500) {
				showPopup = false;
				return;
			}

			// Check if selection is within blog content
			const range = selection.getRangeAt(0);
			const container = document.querySelector('.blog-post-content');
			if (!container || !container.contains(range.commonAncestorContainer)) {
				showPopup = false;
				return;
			}

			const rect = range.getBoundingClientRect();
			popupPosition = {
				x: rect.left + rect.width / 2,
				y: rect.top - 10
			};
			selectedText = text;

			// Calculate offset within content
			const contentText = container.textContent || '';
			const beforeRange = document.createRange();
			beforeRange.setStart(container, 0);
			beforeRange.setEnd(range.startContainer, range.startOffset);
			const startOffset = beforeRange.toString().length;

			selectionRange = {
				start: startOffset,
				end: startOffset + text.length
			};

			showPopup = true;
		}

		document.addEventListener('mouseup', handleSelection);
		return () => document.removeEventListener('mouseup', handleSelection);
	});

	async function submitHighlight() {
		if (!selectedText || !commentText.trim() || !selectionRange || submitting) return;

		submitting = true;
		try {
			await client.mutation(api.highlights.addHighlight, {
				slug,
				text: selectedText,
				comment: commentText.trim(),
				author: authorName.trim() || 'Anonymous',
				startOffset: selectionRange.start,
				endOffset: selectionRange.end,
				sessionId
			});

			if (authorName.trim()) {
				localStorage.setItem('commentAuthor', authorName.trim());
			}

			commentText = '';
			showPopup = false;
			window.getSelection()?.removeAllRanges();
		} catch (e) {
			console.error('Failed to add highlight:', e);
		}
		submitting = false;
	}

	function closePopup() {
		showPopup = false;
		commentText = '';
		window.getSelection()?.removeAllRanges();
	}
</script>

<!-- Selection popup -->
{#if showPopup}
	<div
		class="highlight-popup"
		style="left: {popupPosition.x}px; top: {popupPosition.y}px;"
	>
		<div class="popup-arrow"></div>
		<div class="popup-content">
			<div class="popup-header">
				<MessageSquarePlus size={16} />
				<span>Add comment on selection</span>
				<button class="popup-close" onclick={closePopup}>
					<X size={14} />
				</button>
			</div>
			<div class="popup-selected">"{selectedText.slice(0, 50)}{selectedText.length > 50 ? '...' : ''}"</div>
			<input
				type="text"
				bind:value={authorName}
				placeholder="Your name (optional)"
				class="popup-author"
			/>
			<textarea
				bind:value={commentText}
				placeholder="Your comment..."
				class="popup-textarea"
				rows={2}
			></textarea>
			<button
				class="popup-submit"
				onclick={submitHighlight}
				disabled={submitting || !commentText.trim()}
			>
				<Send size={14} />
				{submitting ? 'Adding...' : 'Add Comment'}
			</button>
		</div>
	</div>
{/if}

<!-- Highlights sidebar -->
{#if highlights.data && highlights.data.length > 0}
	<div class="highlights-section">
		<h4 class="highlights-title">
			<MessageSquarePlus size={16} />
			Inline Comments ({highlights.data.length})
		</h4>
		<div class="highlights-list">
			{#each highlights.data as highlight}
				<div class="highlight-item">
					<div class="highlight-quote">"{highlight.text}"</div>
					<div class="highlight-comment">{highlight.comment}</div>
					<div class="highlight-meta">
						<span class="highlight-author">{highlight.author}</span>
						<span class="highlight-time">
							{formatDistanceToNow(highlight.timestamp, { addSuffix: true })}
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.highlight-popup {
		position: fixed;
		transform: translateX(-50%) translateY(-100%);
		z-index: 1000;
		animation: popupIn 0.15s ease;
	}

	@keyframes popupIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-100%) scale(0.95);
		}
	}

	.popup-arrow {
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 12px;
		height: 12px;
		background: var(--bg-primary);
		border-right: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
		transform: translateX(-50%) rotate(45deg);
	}

	.popup-content {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 12px;
		width: 280px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.popup-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-primary);
	}

	.popup-close {
		margin-left: auto;
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 2px;
	}

	.popup-selected {
		font-size: 12px;
		color: var(--text-muted);
		font-style: italic;
		margin-bottom: 8px;
		padding: 6px 8px;
		background: var(--bg-secondary);
		border-radius: 4px;
	}

	.popup-author,
	.popup-textarea {
		width: 100%;
		padding: 8px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		font-size: 13px;
		color: var(--text-primary);
		font-family: inherit;
		resize: none;
	}

	.popup-author {
		margin-bottom: 8px;
	}

	.popup-textarea {
		margin-bottom: 8px;
	}

	.popup-author:focus,
	.popup-textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.popup-submit {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		padding: 8px;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
	}

	.popup-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.highlights-section {
		margin-top: 32px;
		padding: 20px;
		background: var(--bg-secondary);
		border-radius: 8px;
	}

	.highlights-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 16px;
		color: var(--text-primary);
	}

	.highlights-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.highlight-item {
		padding: 12px;
		background: var(--bg-primary);
		border-radius: 6px;
		border-left: 3px solid var(--accent);
	}

	.highlight-quote {
		font-size: 13px;
		color: var(--text-muted);
		font-style: italic;
		margin-bottom: 8px;
	}

	.highlight-comment {
		font-size: 14px;
		color: var(--text-primary);
		margin-bottom: 8px;
	}

	.highlight-meta {
		display: flex;
		gap: 8px;
		font-size: 12px;
		color: var(--text-muted);
	}

	.highlight-author {
		font-weight: 500;
	}
</style>
