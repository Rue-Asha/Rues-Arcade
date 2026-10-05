<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';

	let { players, onstart }: SetupProps = $props();
</script>

<Card tone="imposter_pairs">
	<p class="label">{players.length} Spieler</p>
	<ol class="chips">
		{#each players as p (p.id)}
			<li>{p.name}</li>
		{/each}
	</ol>
	<p class="muted">
		Jede Runde bekommt eine Person heimlich eine andere Frage. Ihr gebt das Handy in dieser
		Reihenfolge weiter.
	</p>
	<div class="row">
		<Button variant="primary" onclick={() => onstart({})}>Los geht's</Button>
	</div>
</Card>

<style>
	.label {
		color: var(--imposter);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chips li {
		padding: 8px 14px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		box-shadow: 0 3px 0 var(--shadow);
		font-weight: 700;
		overflow-wrap: anywhere;
	}
</style>
