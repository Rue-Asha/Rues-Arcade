<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Card from '#lib/ui/Card.svelte';
	import type { MostLikelyState } from './engine.ts';

	let { state: game }: ScreenProps = $props();

	const s = $derived(game as MostLikelyState);
</script>

<Card tone="most_likely_prompts">
	<p class="label">{s.phase}</p>
</Card>
