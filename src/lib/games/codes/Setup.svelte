<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';

	let { players, onstart }: SetupProps = $props();

	function deal(ids: string[]): string[][] {
		const count = Math.max(2, Math.min(5, Math.floor(ids.length / 2)));
		return Array.from({ length: count }, (_, t) => ids.filter((_, i) => i % count === t));
	}
</script>

<Card tone="codes_words">
	<p class="label">{players.length} Spieler</p>
	<div class="row">
		<Button variant="primary" onclick={() => onstart({ teams: deal(players.map((p) => p.id)), rounds: 5 })}>Los geht's</Button>
	</div>
</Card>
