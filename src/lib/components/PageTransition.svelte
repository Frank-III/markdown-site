<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	// Use pathname as key to trigger transitions
	const key = $derived($page.url.pathname);
</script>

{#key key}
	<div class="page-transition" in:fade={{ duration: 200, delay: 100 }} out:fade={{ duration: 100 }}>
		{@render children()}
	</div>
{/key}

<style>
	.page-transition {
		width: 100%;
	}
</style>
