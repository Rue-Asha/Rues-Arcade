<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		key: unknown;
		children: Snippet;
	}

	let { key, children }: Props = $props();
</script>

{#key key}
	{@render children()}
{/key}
