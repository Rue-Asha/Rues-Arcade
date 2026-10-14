<script lang="ts">
	import { play } from '#lib/sound.ts';
	import { reducedMotion } from '#lib/theme.ts';
	import Button from '#lib/ui/Button.svelte';
	import Circle from './Circle.svelte';
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

	// the hand rests on a seat for one seat time; `step` counts the seats it has visited
	const per = seatMs();
	const glide = reducedMotion() ? 0 : Math.min(250, per * 0.6);
	let step = $state(-1);
	const order = $derived(voteOrder(vote.nominee, count));
	const under = $derived(screen === 'sweep' && step >= 0 ? order[step] : null);
	// an index past the last seat keeps the hand turning clockwise instead of swinging back at seat 1
	const hand = $derived(under === null ? vote.nominee : vote.nominee + 1 + step);

	$effect(() => {
		if (screen !== 'sweep') return;
		let id: ReturnType<typeof setTimeout>;
		const visit = (i: number) => {
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

	function tap(i: number) {
		if (screen === 'clock') onseat(i);
		else mark(i, !voted(i));
	}

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
	<Circle
		seats={s.seats}
		block={today.block}
		marked={vote.voters}
		{hand}
		handMs={glide}
		disabled={screen === 'clock' ? undefined : (i) => (casts(i) || voted(i) ? null : 'keine Stimme')}
		onseat={tap}
	/>
	<p class="facts">
		<span>Nötig: {threshold(living(s.seats))}</span>
		<span>Höchststand: {today.high}</span>
	</p>
	{#if screen === 'clock'}
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'vote' })}>Abstimmung beginnen</Button>
			<Button variant="secondary" onclick={() => dispatch({ type: 'cancel' })}>Zurück</Button>
		</div>
	{:else if screen === 'sweep'}
		<p class="muted hint">Platz antippen oder Leertaste, solange der Zeiger darauf steht.</p>
	{:else}
		<div class="row">
			<Button variant="secondary" square label="Stimme weniger" onclick={() => dispatch({ type: 'count', votes: Math.max(0, (vote.votes ?? 0) - 1) })}>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"></path></svg>
			</Button>
			<output class="votes" data-testid="count">{vote.votes}</output>
			<Button variant="secondary" square label="Stimme mehr" onclick={() => dispatch({ type: 'count', votes: Math.min(count, (vote.votes ?? 0) + 1) })}>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"></path></svg>
			</Button>
			<Button variant="primary" onclick={() => dispatch({ type: 'confirm' })}>Bestätigen</Button>
		</div>
	{/if}
</section>

<style>
	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.head h2 {
		font-size: 22px;
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 20px;
		margin: 0;
		font-weight: 700;
	}

	.hint {
		margin: 0;
	}

	.votes {
		min-width: 2em;
		text-align: center;
		font: 400 40px/1 var(--font-num);
		font-variant-numeric: tabular-nums;
	}
</style>
