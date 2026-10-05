<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { comingSoon, games } from '#lib/games/registry.ts';
	import Banner from '#lib/deco/Banner.svelte';
	import { roster } from '#lib/roster.svelte.ts';
	import Button from '#lib/ui/Button.svelte';
	import GameTile from '#lib/ui/GameTile.svelte';

	// the roster lives in localStorage, so it only exists after hydration
	let ready = $state(false);
	onMount(() => (ready = true));

	const players = $derived(ready ? roster.players : []);
</script>

<svelte:head>
	<title>Rue's Arcade</title>
</svelte:head>

<div class="stack rise">
	<header>
		<Banner place="home">
			<h1 class="sr-only">Rue's Arcade</h1>
			<p class="title">Was spielen wir heute?</p>
			<p class="muted lead">Partyspiele für ein Handy und einen Tisch voller Leute.</p>
		</Banner>
	</header>

	<div class="home">
		<section class="stack games" aria-labelledby="games">
			<h2 id="games" class="label">Spiele</h2>
			<div class="cols">
				{#each games as entry (entry.def.slug)}
					<GameTile {entry} />
				{/each}
			</div>
		</section>

		<section class="stack soon" aria-labelledby="soon">
			<h2 id="soon" class="label">Bald verfügbar</h2>
			<div class="cols">
				{#each comingSoon as name (name)}
					<GameTile locked={name} />
				{/each}
			</div>
		</section>

		<aside class="panel stack crew" aria-labelledby="crew">
			<div class="head">
				<h2 id="crew">Spieler</h2>
				<span class="count">{players.length}</span>
			</div>
			{#if players.length}
				<ul class="names">
					{#each players as p (p.id)}
						<li>{p.name}</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">Noch niemand dabei. Leg zuerst fest, wer mitspielt.</p>
			{/if}
			<Button variant={players.length ? 'secondary' : 'primary'} onclick={() => goto('/spieler')}>
				{players.length ? 'Spieler verwalten' : 'Spieler hinzufügen'}
			</Button>
		</aside>
	</div>
</div>

<style>
	.title {
		font-weight: 800;
		font-size: clamp(32px, 6vw, 46px);
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.lead {
		font-size: 17px;
	}

	.home {
		display: grid;
		grid-template-areas: 'games' 'crew' 'soon';
		gap: var(--gap);
	}

	.games {
		grid-area: games;
	}

	.soon {
		grid-area: soon;
	}

	.soon .cols {
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
	}

	.crew {
		grid-area: crew;
		padding: 20px;
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.count {
		font-weight: 800;
		font-size: 20px;
		font-variant-numeric: tabular-nums;
		color: var(--gold);
	}

	.names {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.names li {
		padding: 6px 12px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	@media (min-width: 1024px) {
		.home {
			grid-template-columns: minmax(0, 1fr) 380px;
			grid-template-areas: 'games crew' 'soon crew';
			align-items: start;
		}

		.crew {
			position: sticky;
			top: 24px;
		}
	}
</style>
