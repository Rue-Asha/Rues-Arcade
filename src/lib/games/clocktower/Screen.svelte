<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';

	let { state: game }: ScreenProps = $props();

	const seats = $derived((game as { seats: { player: { id: string; name: string } }[] }).seats);
</script>

<section class="panel stack gap" aria-labelledby="setup">
	<h2 id="setup">Aufbau</h2>
	<ol class="chips">
		{#each seats as seat (seat.player.id)}
			<li>{seat.player.name}</li>
		{/each}
	</ol>
</section>

<style>
	.gap {
		padding: 20px;
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
		font-weight: 700;
		overflow-wrap: anywhere;
	}
</style>
