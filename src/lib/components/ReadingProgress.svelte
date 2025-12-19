<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let progress = $state(0);

	onMount(() => {
		if (!browser) return;

		function updateProgress() {
			const article = document.querySelector('.post-article');
			if (!article) return;

			const articleRect = article.getBoundingClientRect();
			const articleTop = articleRect.top + window.scrollY;
			const articleHeight = articleRect.height;
			const windowHeight = window.innerHeight;
			const scrollY = window.scrollY;

			// Calculate how much of the article has been scrolled past
			const scrolled = scrollY - articleTop + windowHeight * 0.3;
			const total = articleHeight;

			progress = Math.min(100, Math.max(0, (scrolled / total) * 100));
		}

		window.addEventListener('scroll', updateProgress, { passive: true });
		updateProgress();

		return () => window.removeEventListener('scroll', updateProgress);
	});
</script>

<div class="reading-progress" style="--progress: {progress}%">
	<div class="reading-progress-bar"></div>
</div>

<style>
	.reading-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--bg-secondary);
		z-index: 1000;
	}

	.reading-progress-bar {
		height: 100%;
		width: var(--progress);
		background: linear-gradient(90deg, var(--accent-color), var(--accent-hover));
		transition: width 0.1s ease-out;
	}
</style>
