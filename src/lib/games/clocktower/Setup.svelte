<script lang="ts">
	import type { SetupProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';

	let { players, onstart }: SetupProps = $props();
</script>

<section class="panel stack gap" aria-labelledby="seats">
	<h2 id="seats" class="label">{players.length} Spieler</h2>
	<ol class="chips">
		{#each players as p (p.id)}
			<li>{p.name}</li>
		{/each}
	</ol>
	<p class="muted">Sitzordnung und Rollen legt die erzählende Person im nächsten Schritt fest.</p>
	<div class="row">
		<Button variant="primary" onclick={() => onstart({})}>Spiel starten</Button>
	</div>
</section>

<style>
	.gap {
		padding: 20px;
	}

	.label {
		color: var(--clocktower);
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
