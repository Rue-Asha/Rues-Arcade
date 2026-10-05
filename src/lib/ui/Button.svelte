<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant: 'primary' | 'secondary' | 'ghost';
		size?: 'md' | 'sm';
		action?: string;
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	}

	let { variant, size = 'md', action, disabled = false, onclick, children }: Props = $props();
</script>

<button type="button" {disabled} {onclick}>{@render children()}</button>
