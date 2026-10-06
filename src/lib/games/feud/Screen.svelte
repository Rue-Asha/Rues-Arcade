<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Card from '#lib/ui/Card.svelte';
	import type { FeudState } from './engine.ts';

	let { state: game }: ScreenProps = $props();

	const s = $derived(game as FeudState);
</script>

<Card tone="feud_surveys">
	<h2>{s.config.surveys[s.round]?.question}</h2>
</Card>
