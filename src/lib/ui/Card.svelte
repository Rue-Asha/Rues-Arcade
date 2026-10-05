<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ContentType } from '#lib/content/types.ts';

	interface Props {
		tone?: ContentType | 'neutral';
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();
</script>

<div>{@render children()}</div>
