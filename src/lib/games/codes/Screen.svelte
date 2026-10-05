<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Card from '#lib/ui/Card.svelte';
	import type { CodesState } from './engine.ts';

	let { state: game }: ScreenProps = $props();

	const s = $derived(game as CodesState);
</script>

<Card tone="codes_words">
	<p class="label">{s.phase}</p>
</Card>
