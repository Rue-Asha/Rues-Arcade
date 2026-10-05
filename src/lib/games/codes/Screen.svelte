<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { countUp } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
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
	const rows = $derived(
		[...s.teams]
			.sort((a, b) => b.score - a.score)
			.map((t) => ({ name: t.name, score: t.score, lead: t.score > 0 && best.includes(t) }))
	);
	const step: Record<string, string> = { reveal: 'Aufdecken', play: 'Spiel', result: 'Rundenergebnis' };
	const verdict: Record<number, string> = {
		3: 'Im ersten Versuch erraten.',
		2: 'Im zweiten Versuch erraten.',
		1: 'Erraten.'
	};

	const act = (a: CodesAction) => dispatch(a);

	function guessed() {
		play('correct');
		act({ type: 'guessed' });
	}

	function missed() {
		play('wrong');
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

<div class="split">
	<div class="stack main">
		{#if s.phase !== 'gameOver'}
			<p class="label turn">Runde {s.roundIndex + 1} / {s.rounds} · {step[s.phase]}</p>
		{/if}

		{#if s.phase === 'reveal'}
			<Card tone="codes_words">
				<p class="label">Nur die Erklärer schauen hin</p>
				<h2>Diese Runde erklären: {list(s.teams.map((_, t) => explainer(s, t).name))}.</h2>
				<p class="muted">Alle anderen schauen weg, bis das Wort verdeckt ist.</p>
			</Card>
			<HoldToView label="Gedrückt halten" onrelease={() => {}}>
				<p class="word">{s.word.a}</p>
			</HoldToView>
			<div class="row">
				<Button variant="primary" action="start" onclick={() => act({ type: 'start' })}>Verdecken & raten</Button>
				<Button variant="secondary" action="redraw" disabled={s.pool.length < 2} onclick={() => act({ type: 'redraw' })}>Anderes Wort</Button>
			</div>
		{:else if s.phase === 'play'}
			<div class="stack tight">
				<h2>{team.name}: {clue} erklärt, {list(rest)} {many ? 'raten' : 'rät'}</h2>
				<p class="muted">{clue} sagt genau ein Wort, {list(rest)} {many ? 'haben' : 'hat'} einen Versuch.</p>
			</div>
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
			</div>
			<div class="row">
				<Button variant="primary" action="guessed" onclick={guessed}>Erraten (+{points})</Button>
				<Button variant="secondary" action="missed" onclick={missed}>Daneben, nächstes Team</Button>
				{#if s.attempt >= SKIP_AFTER}
					<Button variant="ghost" action="skip" onclick={() => act({ type: 'skip' })}>Überspringen</Button>
				{/if}
			</div>
			<div class="stack tight">
				<p class="muted">Nur für Erklärer: das Wort noch einmal ansehen.</p>
				<HoldToView label="Gedrückt halten" onrelease={() => {}}>
					<p class="word">{s.word.a}</p>
				</HoldToView>
			</div>
		{:else if s.phase === 'result' && s.lastResult}
			{@const r = s.lastResult}
			{#if r.kind === 'guessed'}
				<div class="outcome">
					<p class="score data" data-testid="points">+<span use:countUp={r.points}></span></p>
					<div class="stack tight">
						<p class="label">{r.points === 1 ? 'Punkt' : 'Punkte'} für {s.teams[r.teamIndex].name}</p>
						<h2>{verdict[r.points]}</h2>
					</div>
				</div>
			{:else}
				<div class="outcome miss">
					<div class="stack tight">
						<p class="label">Kein Punkt</p>
						<h2>Übersprungen</h2>
						<p class="muted">Niemand konnte das Wort erraten.</p>
					</div>
				</div>
			{/if}
			<Card tone="codes_words">
				<p class="label">Das Wort war</p>
				<p class="word">{r.word}</p>
			</Card>
			<div class="row">
				<Button variant="primary" action="next" onclick={next}>{last ? 'Zum Ergebnis' : 'Nächste Runde'}</Button>
			</div>
		{:else if s.phase === 'gameOver'}
			<div class="reveal">
				<p class="label">{best.length > 1 ? 'Unentschieden' : 'Gewinner'}</p>
				<h2 class="reveal-word winner">{best.map((t) => t.name).join(' & ')}</h2>
				<p>{s.rounds} {s.rounds === 1 ? 'Runde' : 'Runden'} gespielt.</p>
			</div>
			<Scoreboard {rows} />
			<div class="row">
				<Button variant="primary" action="rematch" onclick={() => act({ type: 'rematch' })}>Nochmal spielen</Button>
			</div>
		{/if}
	</div>

	<aside class="stack">
		{#if s.phase !== 'gameOver'}
			<Scoreboard {rows} />
		{/if}
		<ul class="teams">
			{#each s.teams as t, i (t.name)}
				<li class:now={s.phase === 'play' && i === s.teamIndex}>
					<span class="label">{t.name}</span>
					<span>{t.players.map((p) => p.name).join(', ')}</span>
				</li>
			{/each}
		</ul>
	</aside>
</div>

<style>
	.turn {
		color: var(--codes);
	}

	.tight {
		gap: 8px;
	}

	.word {
		font-weight: 800;
		font-size: clamp(36px, 10vw, 64px);
		line-height: 1.05;
		letter-spacing: -0.02em;
		text-align: center;
		overflow-wrap: anywhere;
	}

	.ring {
		position: relative;
		width: min(100%, 340px);
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

	.outcome {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px;
		border-radius: var(--radius-xl);
		background: var(--codes);
		color: var(--ink);
		box-shadow: 0 var(--ledge) 0 var(--codes-ledge);
	}

	.outcome .label {
		color: inherit;
	}

	.outcome.miss {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.outcome.miss .muted {
		color: var(--muted);
	}

	.score {
		flex: none;
		font-size: clamp(34px, 9vw, 52px);
		line-height: 1;
	}

	.winner {
		font-size: clamp(40px, 11vw, 84px);
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
