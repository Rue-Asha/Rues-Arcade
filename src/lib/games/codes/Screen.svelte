<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { fault } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import GameFrame from '#lib/ui/GameFrame.svelte';
	import Handoff from '#lib/ui/Handoff.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Outcome from '#lib/ui/Outcome.svelte';
	import Reveal from '#lib/ui/Reveal.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import Winner from '#lib/ui/Winner.svelte';
	import {
		SKIP_AFTER,
		explainer,
		guessers,
		order,
		pointsFor,
		winners,
		type CodesAction,
		type CodesState
	} from './engine.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as CodesState);
	const list = (names: string[]) => new Intl.ListFormat('de').format(names);

	const team = $derived(s.teams[s.teamIndex]);
	const clue = $derived(explainer(s, s.teamIndex).name);
	const rest = $derived(guessers(s, s.teamIndex).map((p) => p.name));
	const many = $derived(rest.length > 1);
	const points = $derived(pointsFor(s.attempt));
	const turns = $derived(order(s));
	const last = $derived(s.roundIndex + 1 >= s.rounds);
	const best = $derived(winners(s));
	const result = $derived(s.phase === 'result' ? s.lastResult : null);
	const rows = $derived(
		s.teams.map((t, i) => ({
			name: t.name,
			score: t.score,
			before: result?.teamIndex === i ? t.score - result.points : t.score,
			lead: t.score > 0 && best.includes(t),
			acting: s.phase === 'play' && i === s.teamIndex
		}))
	);
	const verdict: Record<number, string> = {
		3: 'Im ersten Versuch erraten.',
		2: 'Im zweiten Versuch erraten.',
		1: 'Erraten.'
	};

	let stamp = $state<HTMLElement>();

	const act = (a: CodesAction) => dispatch(a);

	function guessed() {
		play('correct');
		act({ type: 'guessed' });
	}

	function missed() {
		play('wrong');
		fault(stamp?.closest<HTMLElement>('[data-frame="stage"]') ?? undefined, stamp);
		act({ type: 'missed' });
	}

	function next() {
		if (last) play('win');
		act({ type: 'next' });
	}

	// chips sit on a circle inside the square ring, the first one at the top, then clockwise in turn order
	function seat(k: number, n: number) {
		const a = ((-90 + (360 / n) * k) * Math.PI) / 180;
		return `left: calc(50% + ${Math.cos(a).toFixed(3)} * (50% - 54px)); top: calc(50% + ${Math.sin(a).toFixed(3)} * (50% - 30px))`;
	}
</script>

{#snippet nothing()}{/snippet}

<GameFrame>
	{#snippet hero()}
		{#if s.phase === 'reveal'}
			<div class="stack">
				<Handoff
					heading="Diese Runde erklären: {list(s.teams.map((_, t) => explainer(s, t).name))}."
					label="Nur die Erklärer schauen hin"
					note="Alle anderen schauen weg, bis das Wort verdeckt ist."
					colour="codes"
				/>
				<div class="compact">
					<HoldToView label="Gedrückt halten" onrelease={() => {}}>
						<Reveal shown covered={nothing}>
							<p class="word">{s.word.a}</p>
						</Reveal>
					</HoldToView>
				</div>
			</div>
		{:else if s.phase === 'play'}
			<div class="ring">
				<ol aria-label="Reihenfolge">
					{#each turns as t, k (t)}
						<li class="chip" class:now={t === s.teamIndex} style={seat(k, turns.length)} aria-current={t === s.teamIndex || undefined}>
							<span class="pos">{k + 1}</span>
							<span>{s.teams[t].name}</span>
						</li>
					{/each}
				</ol>
				<div class="centre">
					<span class="value" data-testid="value">{points}</span>
					<span class="label">{points === 1 ? 'Punkt' : 'Punkte'}</span>
				</div>
				<div class="stamp" bind:this={stamp} data-testid="stamp" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"></path></svg>
				</div>
			</div>
		{:else if s.phase === 'result' && s.lastResult}
			{@const r = s.lastResult}
			<Outcome verdict={r.kind === 'guessed' ? verdict[r.points] : 'Übersprungen'} points={r.points} />
		{:else if s.phase === 'gameOver'}
			<Winner
				names={best.map((t) => t.name)}
				label={best.length > 1 ? undefined : 'Gewinner'}
				note="{s.rounds} {s.rounds === 1 ? 'Runde' : 'Runden'} gespielt."
				colour="codes"
			/>
		{/if}
	{/snippet}

	{#if s.phase === 'play'}
		<h2>{team.name}: {clue} erklärt, {list(rest)} {many ? 'raten' : 'rät'}</h2>
		<p class="muted">{clue} sagt genau ein Wort, {list(rest)} {many ? 'haben' : 'hat'} einen Versuch.</p>
		<div class="peek">
			<p class="muted">Nur für Erklärer: das Wort noch einmal ansehen.</p>
			<HoldToView corner label="Gedrückt halten" onrelease={() => {}}>
				<p class="word">{s.word.a}</p>
			</HoldToView>
		</div>
	{:else if s.phase === 'result' && s.lastResult}
		{@const r = s.lastResult}
		{#if r.kind === 'guessed'}
			<p class="label">{r.points === 1 ? 'Punkt' : 'Punkte'} für {s.teams[r.teamIndex].name}</p>
		{:else}
			<p class="muted">Niemand konnte das Wort erraten.</p>
		{/if}
		<div class="card">
			<p class="label">Das Wort war</p>
			<p class="word">{r.word}</p>
		</div>
	{/if}

	{#snippet actions()}
		{#if s.phase === 'reveal'}
			<Button variant="primary" action="start" onclick={() => act({ type: 'start' })}>Verdecken & raten</Button>
			<Button variant="secondary" action="redraw" disabled={s.pool.length < 2} onclick={() => act({ type: 'redraw' })}>Anderes Wort</Button>
		{:else if s.phase === 'play'}
			<Button variant="primary" action="guessed" onclick={guessed}>Erraten (+{points})</Button>
			<Button variant="secondary" action="missed" onclick={missed}>Daneben, nächstes Team</Button>
			{#if s.attempt >= SKIP_AFTER}
				<Button variant="ghost" action="skip" onclick={() => act({ type: 'skip' })}>Überspringen</Button>
			{/if}
		{:else if s.phase === 'result'}
			<Button variant="primary" action="next" onclick={next}>{last ? 'Zum Ergebnis' : 'Nächste Runde'}</Button>
		{:else if s.phase === 'gameOver'}
			<Button variant="primary" action="rematch" onclick={() => act({ type: 'rematch' })}>Nochmal spielen</Button>
		{/if}
	{/snippet}

	{#snippet rail()}
		<div class="stack">
			<Scoreboard {rows} />
			<ul class="teams">
				{#each s.teams as t, i (t.name)}
					<li class:now={s.phase === 'play' && i === s.teamIndex}>
						<span class="label">{t.name}</span>
						<span>{t.players.map((p) => p.name).join(', ')}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/snippet}
</GameFrame>

<style>
	.compact :global(.window) {
		min-height: 0;
	}

	.peek {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.peek p {
		flex: 1;
		min-width: 0;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		border-radius: var(--radius-lg);
		background: var(--raised);
	}

	.stamp {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: var(--imposter);
		opacity: 0;
		pointer-events: none;
	}

	.stamp svg {
		width: 50%;
		height: auto;
		filter: drop-shadow(0 4px 0 var(--shadow));
	}

	.word {
		font-weight: 800;
		font-size: clamp(36px, 10vw, 64px);
		line-height: 1.05;
		letter-spacing: -0.02em;
		overflow-wrap: anywhere;
	}

	.ring {
		position: relative;
		width: min(100%, 300px);
		aspect-ratio: 1;
		margin-inline: auto;
	}

	.ring::before {
		content: '';
		position: absolute;
		inset: 16%;
		border: 2px dashed var(--line);
		border-radius: 50%;
	}

	.ring ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chip {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		width: 104px;
		padding: 8px 6px;
		transform: translate(-50%, -50%);
		border-radius: var(--radius-sm);
		background: var(--surface);
		box-shadow: 0 4px 0 var(--shadow);
		color: var(--muted);
		font-weight: 700;
		text-align: center;
		overflow-wrap: anywhere;
	}

	.chip.now {
		background: var(--raised);
		color: var(--text);
		box-shadow:
			inset 0 0 0 2px var(--codes),
			0 4px 0 var(--codes-ledge);
	}

	.pos {
		font-size: 13px;
		font-variant-numeric: tabular-nums;
	}

	.now .pos {
		color: var(--codes);
	}

	.centre {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		pointer-events: none;
	}

	.value {
		font-weight: 800;
		font-size: 56px;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		color: var(--codes);
	}

	.centre .label {
		color: var(--muted);
	}

	.teams {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.teams li {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		background: var(--surface);
		overflow-wrap: anywhere;
	}

	.teams li .label {
		color: var(--muted);
	}

	.teams li.now {
		box-shadow: inset 3px 0 0 var(--codes);
	}

	.teams li.now .label {
		color: var(--codes);
	}
</style>
