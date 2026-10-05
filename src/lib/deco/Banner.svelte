<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		slug?: string;
		place: 'home' | 'start' | 'lobby';
		// token name
		colour?: string;
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="banner">
	{@render children()}
</div>
