<script lang="ts">
	import { onMount } from 'svelte';
	import { List } from 'lucide-svelte';

	let { content }: { content: string } = $props();

	interface TocItem {
		id: string;
		text: string;
		level: number;
	}

	let tocItems = $state<TocItem[]>([]);
	let activeId = $state<string>('');
	let isExpanded = $state(false);

	// Extract headings from markdown content
	function extractHeadings(markdown: string): TocItem[] {
		const headingRegex = /^(#{1,3})\s+(.+)$/gm;
		const items: TocItem[] = [];
		let match;

		while ((match = headingRegex.exec(markdown)) !== null) {
			const level = match[1].length;
			const text = match[2].trim();
			// Create slug from heading text
			const id = text
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');

			items.push({ id, text, level });
		}

		return items;
	}

	$effect(() => {
		tocItems = extractHeadings(content);
	});

	onMount(() => {
		// Set up intersection observer for scroll tracking
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				}
			},
			{
				rootMargin: '-80px 0px -80% 0px',
				threshold: 0
			}
		);

		// Observe all headings
		const headings = document.querySelectorAll('h1[id], h2[id], h3[id]');
		headings.forEach((heading) => observer.observe(heading));

		return () => observer.disconnect();
	});

	function scrollToHeading(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			activeId = id;
		}
	}
</script>

{#if tocItems.length > 2}
	<div class="toc-container">
		<button class="toc-toggle" onclick={() => (isExpanded = !isExpanded)}>
			<List size={16} />
			<span>Contents</span>
			<span class="toc-chevron" class:expanded={isExpanded}>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</span>
		</button>

		{#if isExpanded}
			<nav class="toc-nav">
				{#each tocItems as item}
					<button
						class="toc-item level-{item.level}"
						class:active={activeId === item.id}
						onclick={() => scrollToHeading(item.id)}
					>
						{item.text}
					</button>
				{/each}
			</nav>
		{/if}
	</div>
{/if}

<style>
	.toc-container {
		margin-bottom: 2rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		overflow: hidden;
	}

	.toc-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 12px 16px;
		background: var(--bg-secondary);
		border: none;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-primary);
		text-align: left;
	}

	.toc-toggle:hover {
		background: var(--bg-hover);
	}

	.toc-chevron {
		margin-left: auto;
		transition: transform 0.2s ease;
	}

	.toc-chevron.expanded {
		transform: rotate(180deg);
	}

	.toc-nav {
		display: flex;
		flex-direction: column;
		padding: 8px;
		border-top: 1px solid var(--border-color);
	}

	.toc-item {
		display: block;
		padding: 8px 12px;
		background: none;
		border: none;
		border-radius: 4px;
		text-align: left;
		color: var(--text-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.toc-item:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.toc-item.active {
		background: var(--accent-color);
		color: white;
	}

	.toc-item.level-2 {
		padding-left: 24px;
	}

	.toc-item.level-3 {
		padding-left: 36px;
		font-size: 0.8rem;
	}
</style>
