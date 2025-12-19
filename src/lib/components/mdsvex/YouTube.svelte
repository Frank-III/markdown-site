<script lang="ts">
	let { id, title = 'YouTube video' }: { id: string; title?: string } = $props();
</script>

<div class="youtube-embed">
	<iframe
		src="https://www.youtube-nocookie.com/embed/{id}"
		{title}
		frameborder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowfullscreen
	></iframe>
</div>

<style>
	.youtube-embed {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
		margin: 24px 0;
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg-secondary);
	}

	.youtube-embed iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
