<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Button from '#lib/ui/Button.svelte';
	import BlockCard from './BlockCard.svelte';
	import Circle from './Circle.svelte';
	import { reducedMotion } from '#lib/theme.ts';
	import Modal from '#lib/ui/Modal.svelte';
	import Dawn from './Dawn.svelte';
	import Facts from './Facts.svelte';
	import SeatActions from './SeatActions.svelte';
	import Timer from './Timer.svelte';
	import VoteClock from './VoteClock.svelte';
	import { canBeNominated, canNominate } from './engine.ts';
	import { threshold } from './vote.ts';
	import { living } from './win.ts';
	import type { ClocktowerAction, ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const send = (action: ClocktowerAction) => dispatch(action);
	const s = $derived(game as ClocktowerState);
	const today = $derived(s.today!);
	let sheet = $state<number | null>(null);
	let ending = $state(false);
	const nominee = $derived(today.pending ?? s.today!.nominations.at(-1)?.nominee ?? null);
	const nominator = $derived(s.today!.nominations.at(-1)?.nominator ?? null);
	const name = (i: number | null) => (i === null ? '' : s.seats[i].player.name);

	// why a seat can't nominate; null when it can
	function barred(i: number): string | null {
		if (!s.seats[i].alive) return 'ist tot';
		return today.nominations.some((n) => n.nominator === i) ? 'hat heute schon nominiert' : null;
	}
	const rings = (i: number) => ({ nominee: canBeNominated(s, i), nominator: canNominate(s, i) });
	const barredSeats = $derived(s.seats.flatMap((_, i) => (barred(i) === null ? [] : [i])));

	const last = $derived(today.nominations.at(-1)!);
	const result = $derived.by(() => {
		const { result, votes, nominee } = last;
		const need = threshold(living(s.seats));
		if (result === 'block') return { title: `${name(nominee)} kommt auf den Block`, detail: `${votes} Stimmen` };
		if (result === 'tie') return { title: 'Gleichstand', detail: `${votes} Stimmen wie der Höchststand, niemand ist auf dem Block` };
		return {
			title: 'Nichts ändert sich',
			detail: votes! < need ? `Zu wenig Stimmen: ${votes} von ${need}` : `Nicht über dem Höchststand von ${today.high}`
		};
	});

	// the votes of the nomination that put the holder on the block
	const blockVotes = $derived(today.nominations.findLast((n) => n.result === 'block' && n.nominee === today.block)?.votes ?? 0);

	const screen = $derived(s.phase.kind === 'day' ? s.phase.screen : null);
</script>

{#if s.phase.kind === 'dawn'}
	<Dawn state={s} dispatch={send} />
{:else if screen === 'grimoire'}
	<section class="stack" aria-labelledby="phase">
		{@render head(`Tag ${today.number}`)}
		<div class="cap"><Circle seats={s.seats} block={today.block} {rings} onseat={(i) => (sheet = i)} /></div>
		{#if today.block !== null}<BlockCard name={name(today.block)} votes={blockVotes} />{/if}
		<div class="row">
			<Button variant="primary" onclick={() => (ending = true)}>Tag beenden</Button>
		</div>
	</section>
{:else if screen === 'nominator'}
	<section class="stack" aria-labelledby="phase">
		{@render head(`Wer nominiert ${name(nominee)}?`)}
		<div class="cap"><Circle seats={s.seats} block={today.block} {rings} disabled={barred} onseat={(i) => send({ type: 'nominate', nominator: i })} /></div>
		{#if barredSeats.length}
			<Facts>
				<ul>
					{#each barredSeats as i (i)}<li>{name(i)}: {barred(i)}</li>{/each}
				</ul>
			</Facts>
		{/if}
		<div class="row">
			<Button variant="secondary" onclick={() => send({ type: 'cancel' })}>Zurück</Button>
		</div>
	</section>
{:else if screen === 'clock' || screen === 'sweep' || screen === 'confirm'}
	<VoteClock state={s} dispatch={send} onseat={(i) => (sheet = i)} />
{:else if screen === 'result'}
	<section class="stack" aria-labelledby="phase">
		{@render head(result.title)}
		<div class="cap"><Circle seats={s.seats} block={today.block} {rings} marked={last.voters} hand={last.nominee} /></div>
		<Facts><p>{result.detail}</p></Facts>
		<div class="row">
			<Button variant="primary" onclick={() => send({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
{:else if screen === 'execution'}
	<section class="stack" aria-labelledby="phase">
		<div class="head">
			<h2 id="phase">{today.executed === null ? 'Heute wird niemand hingerichtet' : `${name(today.executed)} wird hingerichtet`}</h2>
		</div>
		<div class="cap"><Circle seats={s.seats} dying={reducedMotion() || today.killed === null ? [] : [today.killed]} /></div>
		<div class="row">
			<Button variant="primary" onclick={() => send({ type: 'next' })}>Weiter</Button>
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

<Modal open={ending} title="Tag beenden?" onclose={() => (ending = false)}>
	<p class="muted">
		{today.block === null ? 'Niemand ist auf dem Block, heute wird niemand hingerichtet.' : `${name(today.block)} wird hingerichtet.`}
	</p>
	<div class="row">
		<Button variant="danger" onclick={() => { ending = false; send({ type: 'endDay' }); }}>Ja, Tag beenden</Button>
		<Button variant="ghost" onclick={() => (ending = false)}>Weiter beraten</Button>
	</div>
</Modal>

{#snippet head(title: string)}
	<div class="head" class:timed={today.deadline !== null}>
		<h2 id="phase">{title}</h2>
		{#if today.deadline !== null}<div class="clock"><Timer deadline={today.deadline} /></div>{/if}
	</div>
{/snippet}

<SeatActions state={s} seat={sheet} dispatch={send} onclose={() => (sheet = null)} />

<style>
	.head {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		text-align: center;
	}

	.head :global(h2) {
		flex: 1 1 0;
		min-width: 0;
		overflow-wrap: anywhere;
		font-size: 22px;
	}

	.head.timed :global(h2) {
		text-align: start;
	}

	.clock {
		flex: none;
	}

	/* the circle measures its own width, so a narrower box is how the viewport height caps it */
	.cap {
		width: min(100%, calc(100svh - 380px));
		min-width: min(100%, 320px);
		margin-inline: auto;
	}

	.pad {
		padding: 20px;
		text-align: center;
	}

	.pad :global(.row) {
		justify-content: center;
	}
</style>
