<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let progress = $state(0);
	let visible = $state(false);

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

			// Calculate how much of the article has been scrolled
			const scrolled = scrollY - articleTop + windowHeight * 0.5;
			const total = articleHeight;

			progress = Math.min(100, Math.max(0, Math.round((scrolled / total) * 100)));

			// Only show when scrolled past the header
			visible = scrollY > 200 && progress > 0 && progress < 100;
		}

		window.addEventListener('scroll', updateProgress, { passive: true });
		updateProgress();

		return () => window.removeEventListener('scroll', updateProgress);
	});
</script>

{#if visible}
	<div class="scroll-position">
		<div class="scroll-indicator">
			<svg viewBox="0 0 36 36" class="circular-progress">
				<path
					class="circle-bg"
					d="M18 2.0845
						a 15.9155 15.9155 0 0 1 0 31.831
						a 15.9155 15.9155 0 0 1 0 -31.831"
				/>
				<path
					class="circle-progress"
					stroke-dasharray="{progress}, 100"
					d="M18 2.0845
						a 15.9155 15.9155 0 0 1 0 31.831
						a 15.9155 15.9155 0 0 1 0 -31.831"
				/>
			</svg>
			<span class="scroll-text">{progress}%</span>
		</div>
	</div>
{/if}

<style>
	.scroll-position {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 100;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
	}

	.scroll-indicator {
		position: relative;
		width: 48px;
		height: 48px;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 50%;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.circular-progress {
		position: absolute;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.circle-bg {
		fill: none;
		stroke: var(--border-color);
		stroke-width: 2;
	}

	.circle-progress {
		fill: none;
		stroke: var(--accent);
		stroke-width: 2;
		stroke-linecap: round;
		transition: stroke-dasharray 0.2s ease;
	}

	.scroll-text {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-primary);
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 768px) {
		.scroll-position {
			bottom: 16px;
			right: 16px;
		}

		.scroll-indicator {
			width: 40px;
			height: 40px;
		}

		.scroll-text {
			font-size: 10px;
		}
	}
</style>
