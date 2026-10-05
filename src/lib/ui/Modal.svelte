<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
	}

	let { open, title, onclose, children }: Props = $props();
</script>

{#if open}
	<div role="dialog" aria-label={title}>{@render children()}</div>
{/if}
