<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Card from '#lib/ui/Card.svelte';
	import type { DuckState } from './engine.ts';

	let { state: game }: ScreenProps = $props();

	const s = $derived(game as DuckState);
</script>

<Card tone="duck_words">
	<p class="label">{s.phase}</p>
</Card>
