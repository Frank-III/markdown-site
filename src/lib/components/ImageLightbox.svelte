<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { X, ZoomIn, ZoomOut } from 'lucide-svelte';

	let isOpen = $state(false);
	let imageSrc = $state('');
	let imageAlt = $state('');
	let scale = $state(1);

	onMount(() => {
		if (!browser) return;

		function handleImageClick(e: MouseEvent) {
			const target = e.target as HTMLElement;
			if (target.tagName === 'IMG' && target.closest('.blog-post-content')) {
				const img = target as HTMLImageElement;
				imageSrc = img.src;
				imageAlt = img.alt || 'Image';
				scale = 1;
				isOpen = true;
				document.body.style.overflow = 'hidden';
			}
		}

		function handleKeydown(e: KeyboardEvent) {
			if (!isOpen) return;
			if (e.key === 'Escape') {
				close();
			} else if (e.key === '+' || e.key === '=') {
				zoomIn();
			} else if (e.key === '-') {
				zoomOut();
			}
		}

		document.addEventListener('click', handleImageClick);
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('click', handleImageClick);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function close() {
		isOpen = false;
		document.body.style.overflow = '';
	}

	function zoomIn() {
		scale = Math.min(scale + 0.25, 3);
	}

	function zoomOut() {
		scale = Math.max(scale - 0.25, 0.5);
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="lightbox-overlay"
		onclick={close}
		onkeydown={(e) => e.key === 'Enter' && close()}
		role="dialog"
		aria-modal="true"
		aria-label="Image lightbox"
		tabindex="-1"
	>
		<div class="lightbox-controls">
			<button class="lightbox-btn" onclick={(e) => { e.stopPropagation(); zoomOut(); }} aria-label="Zoom out">
				<ZoomOut size={20} />
			</button>
			<span class="lightbox-scale">{Math.round(scale * 100)}%</span>
			<button class="lightbox-btn" onclick={(e) => { e.stopPropagation(); zoomIn(); }} aria-label="Zoom in">
				<ZoomIn size={20} />
			</button>
			<button class="lightbox-btn lightbox-close" onclick={close} aria-label="Close">
				<X size={20} />
			</button>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="lightbox-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<img
				src={imageSrc}
				alt={imageAlt}
				class="lightbox-image"
				style="transform: scale({scale})"
			/>
		</div>
		<div class="lightbox-hint">Press ESC to close · +/- to zoom</div>
	</div>
{/if}

<style>
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		animation: fadeIn 0.2s ease;
		cursor: zoom-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
	}

	.lightbox-controls {
		position: fixed;
		top: 20px;
		right: 20px;
		display: flex;
		align-items: center;
		gap: 8px;
		z-index: 2001;
	}

	.lightbox-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		border-radius: 8px;
		color: white;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.lightbox-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.lightbox-scale {
		color: white;
		font-size: 14px;
		min-width: 50px;
		text-align: center;
	}

	.lightbox-close {
		margin-left: 8px;
	}

	.lightbox-content {
		max-width: 90vw;
		max-height: 85vh;
		overflow: auto;
		cursor: default;
	}

	.lightbox-image {
		max-width: 100%;
		max-height: 85vh;
		object-fit: contain;
		transition: transform 0.2s ease;
		border-radius: 4px;
	}

	.lightbox-hint {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		color: rgba(255, 255, 255, 0.5);
		font-size: 13px;
	}
</style>
