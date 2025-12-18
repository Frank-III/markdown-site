<script lang="ts">
	import { onMount } from 'svelte';
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import { gfmHeadingId } from 'marked-gfm-heading-id';
	import hljs from 'highlight.js';

	let { content }: { content: string } = $props();

	// Configure marked with highlight.js and GFM heading IDs
	const marked = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		}),
		gfmHeadingId()
	);

	marked.use({
		gfm: true,
		breaks: true
	});

	const html = $derived(marked.parse(content) as string);

	// Add copy buttons to code blocks after render
	onMount(() => {
		const codeBlocks = document.querySelectorAll('.blog-post-content pre');
		codeBlocks.forEach((block) => {
			const wrapper = document.createElement('div');
			wrapper.className = 'code-block-wrapper';

			// Get language from class
			const codeEl = block.querySelector('code');
			const langMatch = codeEl?.className.match(/language-(\w+)/);
			if (langMatch) {
				const langLabel = document.createElement('span');
				langLabel.className = 'code-language';
				langLabel.textContent = langMatch[1];
				wrapper.appendChild(langLabel);
			}

			// Create copy button
			const copyBtn = document.createElement('button');
			copyBtn.className = 'code-copy-button';
			copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
			copyBtn.title = 'Copy code';

			copyBtn.addEventListener('click', async () => {
				const code = codeEl?.textContent || '';
				await navigator.clipboard.writeText(code);
				copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
				setTimeout(() => {
					copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
				}, 2000);
			});

			wrapper.appendChild(copyBtn);
			block.parentNode?.insertBefore(wrapper, block);
			wrapper.appendChild(block);
		});
	});
</script>

<article class="blog-post-content">
	{@html html}
</article>
