<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { clearSession } from '#lib/session.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import { alignment, byId } from './characters.ts';
	import CharacterIcon from './CharacterIcon.svelte';
	import { who } from './label.ts';
	import type { ClocktowerState, DemonEvent, Seat } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const revealed = $derived(s.phase.kind === 'over' && s.phase.revealed);
	const good = $derived(s.winner === 'good');
	const groups = $derived(
		(good ? (['good', 'evil'] as const) : (['evil', 'good'] as const)).map((team) => ({
			team,
			name: team === 'good' ? 'Gut' : 'Böse',
			seats: s.seats.flatMap((seat, i) => (alignment(seat.character!) === team ? [{ seat, i }] : []))
		}))
	);

	onMount(() => {
		if (!revealed) play('gong');
	});

	function character(seat: Seat) {
		const name = byId[seat.character!].name;
		return seat.character === 'drunk' && seat.believed ? `${name} (glaubte: ${byId[seat.believed].name})` : name;
	}

	const status = (seat: Seat) => (seat.alive ? 'lebt' : seat.ghostVote ? 'tot, Stimme übrig' : 'tot, keine Stimme');

	const event = (e: DemonEvent) =>
		e.kind === 'starpass'
			? `Nacht ${e.night}: Starpass von ${who(s.seats, e.from)} zu ${who(s.seats, e.to)}, davor ${byId[e.was].name}`
			: `Nacht ${e.night}: Scarlet Woman ${who(s.seats, e.to)} wird zum Imp, davor ${who(s.seats, e.from)}`;

	function leave() {
		clearSession('clocktower');
		goto('/spiele/clocktower');
	}
</script>

{#if !revealed}
	<section class="panel stack pad teaser" aria-labelledby="phase">
		<h2 id="phase">Das Spiel ist vorbei</h2>
		<p class="muted">Die Geschichte der Stadt ist erzählt. Gleich seht ihr, wie sie ausging.</p>
		<div class="row center">
			<Button variant="primary" onclick={() => dispatch({ type: 'reveal' })}>Weiter</Button>
		</div>
	</section>
{:else}
	<section class="stack" data-end aria-labelledby="phase">
		<h2 id="phase" class="winner" class:good data-testid="winner">
			{good ? 'Das Gute gewinnt' : 'Das Böse gewinnt'}
		</h2>
		<div class="groups">
			{#each groups as g (g.team)}
				<section class="panel group {g.team}" data-testid="end-group" aria-labelledby="g-{g.team}">
					<h3 id="g-{g.team}"><span class="glyph" aria-hidden="true"></span>{g.name}</h3>
					<ul class="rows">
						{#each g.seats as { seat, i } (i)}
							<li data-testid="end-row" class="row-seat {byId[seat.character!].team}" data-dead={seat.alive ? undefined : ''}>
								<CharacterIcon id={seat.character!} size={32} />
								<span class="no data">{i + 1}</span>
								<span class="who">{seat.player.name}</span>
								<span class="char">{character(seat)}</span>
								<span class="status" class:ghost={!seat.alive && seat.ghostVote}>{status(seat)}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
		<div class="panel history" data-testid="history">
			{#if s.history.length}
				{#each s.history as e, i (i)}<p>{event(e)}</p>{/each}
			{:else if s.demon !== null}
				<p>Der Dämon blieb {who(s.seats, s.demon)}</p>
			{/if}
		</div>
		<div class="row">
			<Button variant="primary" onclick={leave}>Zurück zum Start</Button>
		</div>
	</section>
{/if}

<style>
	.pad {
		padding: 20px;
	}

	h2,
	p {
		margin: 0;
	}

	.winner {
		padding: 18px 16px;
		border: 2px solid var(--evil);
		border-radius: var(--radius-xl);
		background: var(--evil-tint);
		color: var(--evil);
		font-family: var(--font-display);
		font-size: 30px;
		text-align: center;
		animation: verdict 0.7s var(--ease-out) 1 both;
	}

	.winner.good {
		border-color: var(--good);
		background: var(--good-tint);
		color: var(--good);
	}

	@keyframes verdict {
		from {
			opacity: 0;
			transform: scale(0.88);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.teaser {
		text-align: center;
		text-wrap: balance;
	}

	.center {
		justify-content: center;
	}

	.groups {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
	}

	.group h3 {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-size: 22px;
		color: var(--good);
	}

	.group.evil h3 {
		color: var(--evil);
	}

	.glyph {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: currentColor;
	}

	.evil .glyph {
		border-radius: 0;
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
	}

	.rows {
		display: grid;
		gap: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row-seat {
		display: grid;
		grid-template-columns: 32px 24px minmax(0, 1fr);
		column-gap: 10px;
		row-gap: 0;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid var(--line);
	}

	.row-seat:last-child {
		border-bottom: 0;
	}

	.row-seat > :global(.icon) {
		grid-row: 1 / span 3;
	}

	.no {
		grid-column: 2;
		grid-row: 1 / span 3;
		color: var(--muted);
		font-size: 14px;
	}

	.who,
	.char,
	.status {
		grid-column: 3;
	}

	.who {
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.row-seat[data-dead] .who {
		text-decoration: line-through;
	}

	.char {
		color: var(--good);
	}

	.row-seat.outsider .char {
		color: var(--outsider);
	}

	.row-seat.minion .char {
		color: var(--evil);
	}

	.row-seat.demon .char {
		color: var(--demon);
	}

	.status {
		font-size: 14px;
		color: var(--muted);
	}

	.status.ghost {
		color: var(--gold);
	}

	@media (min-width: 768px) {
		.groups {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
		}
	}

	.history {
		display: grid;
		gap: 6px;
	}

	@media (prefers-reduced-motion: reduce) {
		.winner {
			animation: none;
		}
	}
</style>
