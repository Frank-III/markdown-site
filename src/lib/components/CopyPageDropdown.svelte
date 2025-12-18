<script lang="ts">
	import { Copy, MessageSquare, Sparkles } from 'lucide-svelte';

	let { title, content, url }: { title: string; content: string; url: string } = $props();

	let isOpen = $state(false);
	let copied = $state(false);
	let dropdownRef: HTMLDivElement;

	function formatAsMarkdown(title: string, content: string, url: string): string {
		return `# ${title}\n\nSource: ${url}\n\n${content}`;
	}

	async function handleCopyPage() {
		const markdown = formatAsMarkdown(title, content, url);
		await navigator.clipboard.writeText(markdown);
		copied = true;
		setTimeout(() => {
			copied = false;
			isOpen = false;
		}, 1500);
	}

	function handleOpenInChatGPT() {
		const markdown = formatAsMarkdown(title, content, url);
		const encodedText = encodeURIComponent(`Please analyze this article:\n\n${markdown}`);
		window.open(`https://chat.openai.com/?q=${encodedText}`, '_blank');
		isOpen = false;
	}

	function handleOpenInClaude() {
		const markdown = formatAsMarkdown(title, content, url);
		const encodedText = encodeURIComponent(`Please analyze this article:\n\n${markdown}`);
		window.open(`https://claude.ai/new?q=${encodedText}`, '_blank');
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	});
</script>

<div class="copy-page-dropdown" bind:this={dropdownRef}>
	<!-- Trigger button -->
	<button
		class="copy-page-trigger"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		aria-haspopup="true"
	>
		<Copy size={14} />
		<span>Copy page</span>
		<svg
			class="dropdown-chevron {isOpen ? 'open' : ''}"
			width="10"
			height="10"
			viewBox="0 0 10 10"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M2.5 4L5 6.5L7.5 4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div class="copy-page-menu">
			<!-- Copy page option -->
			<button class="copy-page-item" onclick={handleCopyPage}>
				<Copy size={16} class="copy-page-icon" />
				<div class="copy-page-item-content">
					<span class="copy-page-item-title">
						{copied ? 'Copied!' : 'Copy page'}
					</span>
					<span class="copy-page-item-desc"> Copy page as Markdown for LLMs </span>
				</div>
			</button>

			<!-- Open in ChatGPT -->
			<button class="copy-page-item" onclick={handleOpenInChatGPT}>
				<MessageSquare size={16} class="copy-page-icon" />
				<div class="copy-page-item-content">
					<span class="copy-page-item-title">
						Open in ChatGPT
						<span class="external-arrow">↗</span>
					</span>
					<span class="copy-page-item-desc"> Ask questions about this page </span>
				</div>
			</button>

			<!-- Open in Claude -->
			<button class="copy-page-item" onclick={handleOpenInClaude}>
				<Sparkles size={16} class="copy-page-icon" />
				<div class="copy-page-item-content">
					<span class="copy-page-item-title">
						Open in Claude
						<span class="external-arrow">↗</span>
					</span>
					<span class="copy-page-item-desc"> Ask questions about this page </span>
				</div>
			</button>
		</div>
	{/if}
</div>
