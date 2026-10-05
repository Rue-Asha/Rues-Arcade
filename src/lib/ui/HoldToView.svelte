<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		action?: string;
		onrelease: () => void;
		label: string;
		children: Snippet;
	}

	let { action, onrelease, label, children }: Props = $props();
</script>

<button type="button">{label}</button>
