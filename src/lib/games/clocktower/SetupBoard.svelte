<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import CharacterBoard from './CharacterBoard.svelte';
	import Circle from './Circle.svelte';
	import { byId } from './characters.ts';
	import { fill, problems } from './setup.ts';
	import type { CharacterId, ClocktowerAction, ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const send = (action: ClocktowerAction) => dispatch(action);

	let picked = $state<number | null>(null);
	let pending = $state<CharacterId | null>(null);
	let stuck = $state<string | null>(null);

	function tap(i: number) {
		stuck = null;
		if (pending !== null) {
			send({ type: 'assign', seat: i, character: pending });
			pending = null;
		} else if (picked === null) picked = i;
		else if (picked === i) picked = null;
		else {
			send({ type: 'swap', a: picked, b: i });
			picked = null;
		}
	}

	function choose(id: CharacterId) {
		stuck = null;
		const at = s.seats.findIndex((x) => x.character === id);
		if (at >= 0) {
			if (at === picked) send({ type: 'assign', seat: at, character: null });
			picked = null;
		} else if (picked !== null) {
			send({ type: 'assign', seat: picked, character: id });
			picked = null;
		} else pending = pending === id ? null : id;
	}

	function randomise(type: 'fill' | 'reroll') {
		picked = null;
		pending = null;
		if (type === 'fill' && fill(s.seats, s.rng)[0] === null) {
			stuck = problems(s.seats, s.redHerring)[0] ?? 'Zufällig geht hier nicht auf.';
			return;
		}
		stuck = null;
		send({ type });
	}
</script>

<div class="board">
	<section class="panel stack seats" aria-labelledby="seats">
		<h2 id="seats">Sitzordnung</h2>
		<Circle
			seats={s.seats}
			size="setup"
			label={(i) => (i === picked && s.seats[i].character ? byId[s.seats[i].character!].name : null)}
			marked={picked === null ? [] : [picked]}
			onseat={tap}
			onswap={(from, to) => send({ type: 'move', from, to })}
			onmove={(from, to) => send({ type: 'move', from, to })}
		/>
		<div class="row actions">
			<Button variant="secondary" onclick={() => randomise('fill')}>Zufällig</Button>
			<Button variant="ghost" onclick={() => randomise('reroll')}>Alles neu</Button>
		</div>
		{#if stuck}<p class="stuck" role="alert">{stuck}</p>{/if}
		<p class="muted">Tippt zwei Plätze an, um sie zu tauschen, oder zieht einen Platz an eine andere Stelle.</p>
	</section>

	<section class="panel stack chars" aria-labelledby="chars">
		<h2 id="chars">Charaktere</h2>
		<CharacterBoard seats={s.seats} {picked} {pending} onpick={choose} />
	</section>
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--gap);
		align-items: start;
	}

	/* the circle takes the panel's full width: 15 seats need every pixel of a 390px phone */
	.seats {
		padding: 16px 0;
	}

	.seats > :global(h2),
	.seats > :global(p),
	.actions {
		padding-inline: 16px;
	}

	.chars {
		padding: 16px;
	}

	.stuck {
		color: var(--evil);
		font-weight: 700;
	}

	@media (min-width: 1024px) {
		.board {
			grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
		}
	}
</style>
