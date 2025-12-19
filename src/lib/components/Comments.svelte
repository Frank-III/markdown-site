<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api';
	import { browser } from '$app/environment';
	import { formatDistanceToNow } from 'date-fns';
	import { Send, Trash2, MessageCircle } from 'lucide-svelte';
	import type { Id } from '$convex/_generated/dataModel';

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

	const comments = useQuery(api.comments.getComments, () => ({ slug }));

	let author = $state('');
	let content = $state('');
	let submitting = $state(false);

	// Load saved author name
	$effect(() => {
		if (browser) {
			author = localStorage.getItem('commentAuthor') || '';
		}
	});

	async function submitComment() {
		if (!author.trim() || !content.trim() || submitting) return;

		submitting = true;
		try {
			await client.mutation(api.comments.addComment, {
				slug,
				author: author.trim(),
				content: content.trim(),
				sessionId
			});

			// Save author name for next time
			localStorage.setItem('commentAuthor', author.trim());
			content = '';
		} catch (e) {
			console.error('Failed to add comment:', e);
		}
		submitting = false;
	}

	async function deleteComment(commentId: Id<'comments'>) {
		try {
			await client.mutation(api.comments.deleteComment, { commentId, sessionId });
		} catch (e) {
			console.error('Failed to delete comment:', e);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			submitComment();
		}
	}
</script>

<div class="comments-section">
	<h3 class="comments-title">
		<MessageCircle size={20} />
		Comments
		{#if comments.data && comments.data.length > 0}
			<span class="comments-count">({comments.data.length})</span>
		{/if}
	</h3>

	<form class="comment-form" onsubmit={(e) => { e.preventDefault(); submitComment(); }}>
		<input
			type="text"
			bind:value={author}
			placeholder="Your name"
			class="comment-author-input"
			maxlength={50}
		/>
		<textarea
			bind:value={content}
			placeholder="Write a comment... (⌘+Enter to submit)"
			class="comment-content-input"
			rows={3}
			maxlength={2000}
			onkeydown={handleKeydown}
		></textarea>
		<button type="submit" class="comment-submit" disabled={submitting || !author.trim() || !content.trim()}>
			<Send size={16} />
			{submitting ? 'Posting...' : 'Post Comment'}
		</button>
	</form>

	<div class="comments-list">
		{#if comments.data && comments.data.length > 0}
			{#each comments.data as comment}
				<div class="comment">
					<div class="comment-header">
						<span class="comment-author">{comment.author}</span>
						<span class="comment-time">
							{formatDistanceToNow(comment.timestamp, { addSuffix: true })}
						</span>
					</div>
					<p class="comment-content">{comment.content}</p>
				</div>
			{/each}
		{:else if comments.data}
			<p class="no-comments">No comments yet. Be the first to comment!</p>
		{/if}
	</div>
</div>

<style>
	.comments-section {
		margin-top: 48px;
		padding-top: 32px;
		border-top: 1px solid var(--border-color);
	}

	.comments-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 18px;
		font-weight: 500;
		margin-bottom: 24px;
		color: var(--text-primary);
	}

	.comments-count {
		font-weight: 400;
		color: var(--text-muted);
	}

	.comment-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 32px;
	}

	.comment-author-input,
	.comment-content-input {
		width: 100%;
		padding: 12px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		font-size: 14px;
		color: var(--text-primary);
		font-family: inherit;
		resize: vertical;
	}

	.comment-author-input:focus,
	.comment-content-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.comment-author-input::placeholder,
	.comment-content-input::placeholder {
		color: var(--text-muted);
	}

	.comment-submit {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 20px;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s ease;
		align-self: flex-start;
	}

	.comment-submit:hover:not(:disabled) {
		opacity: 0.9;
	}

	.comment-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.comment {
		padding: 16px;
		background: var(--bg-secondary);
		border-radius: 8px;
	}

	.comment-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.comment-author {
		font-weight: 500;
		color: var(--text-primary);
	}

	.comment-time {
		font-size: 13px;
		color: var(--text-muted);
	}

	.comment-content {
		font-size: 15px;
		color: var(--text-secondary);
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.no-comments {
		text-align: center;
		color: var(--text-muted);
		padding: 32px;
	}
</style>
