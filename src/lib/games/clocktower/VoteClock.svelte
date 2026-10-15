<script lang="ts">
	import { play } from '#lib/sound.ts';
	import { reducedMotion } from '#lib/theme.ts';
	import Button from '#lib/ui/Button.svelte';
	import Circle from './Circle.svelte';
	import Facts from './Facts.svelte';
	import Timer from './Timer.svelte';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';
	import { seatMs, threshold, voteOrder } from './vote.ts';
	import { living } from './win.ts';

	interface Props {
		state: ClocktowerState;
		dispatch: (action: ClocktowerAction) => void;
		onseat: (seat: number) => void;
	}

	let { state: s, dispatch, onseat }: Props = $props();

	const screen = $derived(s.phase.kind === 'day' ? s.phase.screen : 'clock');
	const today = $derived(s.today!);
	const vote = $derived(today.nominations.at(-1)!);
	const count = $derived(s.seats.length);
	const name = (i: number) => s.seats[i].player.name;

	// `step` counts the sectors the hand has entered; in sector k it turns on to that sector's end boundary, so over
	// one seat time it covers exactly 360 / count degrees and never rests
	const per = seatMs();
	const reduced = reducedMotion();
	let step = $state(-1);
	const order = $derived(voteOrder(vote.nominee, count));
	const sweeping = $derived(screen === 'sweep');
	const under = $derived(sweeping && step >= 0 ? order[step] : null);
	// seat units past the last seat keep the hand turning clockwise instead of swinging back at seat 1
	const hand = $derived(!sweeping ? vote.nominee : step < 0 ? vote.nominee + 0.5 : vote.nominee + (reduced ? 1 : 1.5) + step);
	const handMs = $derived(sweeping && step >= 0 && !reduced ? per : 0);

	$effect(() => {
		if (screen !== 'sweep') return;
		let id: ReturnType<typeof setTimeout>;
		const visit = (i: number) => {
			// commit the start boundary first, or the hand would glide to the first sector from the nominee
			if (i === 0) void document.body.offsetHeight;
			step = i;
			play('tick');
			id = setTimeout(() => (i + 1 < count ? visit(i + 1) : dispatch({ type: 'swept' })), per);
		};
		id = setTimeout(() => visit(0), 0);
		return () => clearTimeout(id);
	});

	const voted = (i: number) => vote.voters.includes(i);
	const casts = (i: number) => s.seats[i].alive || s.seats[i].ghostVote;
	const mark = (i: number, on: boolean) => dispatch({ type: 'mark', seat: i, on });

	const off = (i: number) => {
		if (sweeping && i !== under) return 'Zeiger ist woanders';
		return casts(i) || voted(i) ? null : 'keine Stimme';
	};

	const tap = (i: number) => (screen === 'clock' ? onseat(i) : mark(i, !voted(i)));

	function key(e: KeyboardEvent) {
		if (screen !== 'sweep' || e.key !== ' ') return;
		// a focused seat would otherwise take the space as a click and toggle itself back off
		e.preventDefault();
		if (e.type === 'keydown' && !e.repeat && under !== null && casts(under) && !voted(under)) mark(under, true);
	}
</script>

<svelte:window onkeydown={key} onkeyup={key} />

<section class="stack" aria-labelledby="phase" data-sweep={screen === 'sweep' ? '' : undefined} data-under={under === null ? undefined : under + 1}>
	<div class="head">
		<h2 id="phase">
			{#if screen === 'confirm'}Stimmen zählen{:else}{name(vote.nominator)} nominiert {name(vote.nominee)}{/if}
		</h2>
		{#if today.deadline !== null}<Timer deadline={today.deadline} />{/if}
	</div>
	<div class="cap"><Circle
		seats={s.seats}
		block={today.block}
		marked={vote.voters}
		{hand}
		{handMs}
		sector={under}
		disabled={screen === 'clock' ? undefined : off}
		onseat={tap}
	/></div>
	<Facts>
		<p class="pair">
			<span>Nötig: {threshold(living(s.seats))}</span>
			<span>Höchststand: {today.high}</span>
		</p>
		{#if screen === 'sweep'}<p class="hint">Platz antippen oder Leertaste, solange der Zeiger in seinem Kreisstück steht.</p>{/if}
	</Facts>
	{#if screen === 'clock'}
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'vote' })}>Abstimmung beginnen</Button>
			<Button variant="secondary" onclick={() => dispatch({ type: 'cancel' })}>Zurück</Button>
		</div>
	{:else if screen !== 'sweep'}
		<div class="row">
			<output class="votes" data-testid="count">{vote.votes}</output>
			<Button variant="primary" onclick={() => dispatch({ type: 'confirm' })}>Bestätigen</Button>
		</div>
	{/if}
</section>

<style>
	.head {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 10px;
		text-align: center;
	}

	.head h2 {
		font-size: 22px;
	}

	.cap {
		width: min(100%, calc(100svh - 380px));
		min-width: min(100%, 320px);
		margin-inline: auto;
	}

	.votes {
		min-width: 2em;
		text-align: center;
		font: 400 40px/1 var(--font-num);
		font-variant-numeric: tabular-nums;
	}
</style>
