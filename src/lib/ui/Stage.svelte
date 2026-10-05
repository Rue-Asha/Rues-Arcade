<script lang="ts">
	import type { Snippet } from 'svelte';
	import { rise } from '#lib/motion.ts';

	interface Props {
		key: unknown;
		children: Snippet;
	}

	let { key, children }: Props = $props();
</script>

{#key key}
	<div class="stage" in:rise>
		{@render children()}
	</div>
{/key}
