<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import Circle from './Circle.svelte';
	import Dawn from './Dawn.svelte';
	import SeatActions from './SeatActions.svelte';
	import Timer from './Timer.svelte';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const send = (action: ClocktowerAction) => dispatch(action);
	const s = $derived(game as ClocktowerState);
	const today = $derived(s.today!);
	let sheet = $state<number | null>(null);
	const nominee = $derived(today.pending ?? s.today!.nominations.at(-1)?.nominee ?? null);
	const nominator = $derived(s.today!.nominations.at(-1)?.nominator ?? null);
	const name = (i: number | null) => (i === null ? '' : s.seats[i].player.name);

	// why a seat can't nominate; null when it can
	function barred(i: number): string | null {
		if (!s.seats[i].alive) return 'ist tot';
		return today.nominations.some((n) => n.nominator === i) ? 'hat heute schon nominiert' : null;
	}
	const barredSeats = $derived(s.seats.flatMap((_, i) => (barred(i) === null ? [] : [i])));

	const screen = $derived(s.phase.kind === 'day' ? s.phase.screen : null);
</script>

{#if s.phase.kind === 'dawn'}
	<Dawn state={s} dispatch={send} />
{:else if screen === 'grimoire'}
	<section class="stack" aria-labelledby="phase">
		<h2 id="phase" class="sr-only">Tag {today.number}</h2>
		{#if today.deadline !== null}<Timer deadline={today.deadline} />{/if}
		<Circle seats={s.seats} block={today.block} onseat={(i) => (sheet = i)} />
	</section>
{:else if screen === 'nominator'}
	<section class="stack" aria-labelledby="phase">
		<h2 id="phase">Wer nominiert {name(nominee)}?</h2>
		{#if today.deadline !== null}<Timer deadline={today.deadline} />{/if}
		<Circle seats={s.seats} block={today.block} disabled={barred} onseat={(i) => send({ type: 'nominate', nominator: i })} />
		{#if barredSeats.length}
			<ul class="muted why">
				{#each barredSeats as i (i)}<li>{name(i)}: {barred(i)}</li>{/each}
			</ul>
		{/if}
		<div class="row">
			<Button variant="secondary" onclick={() => send({ type: 'cancel' })}>Zurück</Button>
		</div>
	</section>
{:else if screen === 'clock'}
	<section class="stack" aria-labelledby="phase">
		<h2 id="phase">{name(nominator)} nominiert {name(nominee)}</h2>
		{#if today.deadline !== null}<Timer deadline={today.deadline} />{/if}
		<Circle seats={s.seats} block={today.block} hand={nominee} onseat={(i) => (sheet = i)} />
		<div class="row">
			<Button variant="primary" onclick={() => send({ type: 'vote' })}>Abstimmung beginnen</Button>
			<Button variant="secondary" onclick={() => send({ type: 'cancel' })}>Zurück</Button>
		</div>
	</section>
{:else}
	<section class="panel stack pad" aria-labelledby="phase">
		<h2 id="phase">Tag {s.phase.kind}</h2>
		<div class="row">
			<Button variant="primary" onclick={() => send({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
{/if}

<SeatActions state={s} seat={sheet} dispatch={send} onclose={() => (sheet = null)} />

<style>
	.why {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 15px;
	}

	.pad {
		padding: 20px;
	}
</style>
