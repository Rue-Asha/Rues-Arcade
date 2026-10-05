<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';

	let { players, onstart }: SetupProps = $props();
</script>

<Card tone="duck_words">
	<p class="label">{players.length} Spieler</p>
	<div class="row">
		<Button variant="primary" onclick={() => onstart({ target: 10 })}>Los geht's</Button>
	</div>
</Card>
