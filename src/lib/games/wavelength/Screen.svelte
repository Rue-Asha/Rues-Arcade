<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { countUp } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import Dial from './Dial.svelte';
	import {
		formatAverage,
		koopResult,
		modeOf,
		psychic,
		scoreFor,
		winners,
		type WavelengthAction,
		type WavelengthState
	} from './engine.ts';

	let { state, dispatch }: ScreenProps = $props();

	const s = $derived(state as WavelengthState);
	const koop = $derived(modeOf(s) === 'koop');
	const team = $derived(s.teams[s.teamIndex]);
	const clue = $derived(psychic(s));
	const rest = $derived(team.players.filter((p) => p.id !== clue.id).map((p) => p.name));
	// a koop team can be 17 names long, where "A & B & C" stops reading
	const others = $derived(koop ? new Intl.ListFormat('de').format(rest) : rest.join(' & '));
	const many = $derived(rest.length > 1);
	const last = $derived(
		(koop ? s.turn === team.players.length - 1 : s.teamIndex === s.teams.length - 1) && s.roundIndex + 1 >= s.rounds
	);
	const best = $derived(winners(s));
	const rows = $derived(
		[...s.teams]
			.sort((a, b) => b.score - a.score)
			.map((t) => ({ name: t.name, score: t.score, lead: !koop && t.score > 0 && best.includes(t) }))
	);
	const verdict: Record<number, string> = {
		4: 'Genau getroffen.',
		3: 'Knapp daneben.',
		2: 'In der Nähe.',
		0: 'Kein Punkt.'
	};

	const act = (a: WavelengthAction) => dispatch(a);

	function lockIn() {
		play(scoreFor(s.target, s.dial) > 0 ? 'correct' : 'wrong');
		act({ type: 'lockIn' });
	}

	function next() {
		if (last) play('win');
		act({ type: 'next' });
	}
</script>

<div class="split">
	<div class="stack main">
		{#if s.phase === 'prep'}
			<Card tone="wavelength_spectra">
				<p class="label">{koop ? clue.name : team.name} ist dran</p>
				<h2>Gib das Handy an {clue.name}</h2>
				<p class="muted">{others} {many ? 'schauen' : 'schaut'} weg. Nur {clue.name} sieht gleich das Ziel.</p>
			</Card>
			<Dial value={90} left={s.spectrum.a} right={s.spectrum.b} />
			<div class="row">
				<Button variant="primary" action="show" onclick={() => act({ type: 'show' })}>Ziel anzeigen</Button>
				<Button variant="secondary" action="redraw" onclick={() => act({ type: 'redraw' })}>Anderes Spektrum</Button>
			</div>
		{:else if s.phase === 'reveal'}
			<p class="lead">Nur {clue.name} schaut hin.</p>
			<HoldToView label="Gedrückt halten" onrelease={() => {}}>
				<Dial value={s.dial} target={s.target} left={s.spectrum.a} right={s.spectrum.b} />
			</HoldToView>
			<p class="muted">Merk dir das Ziel und überleg dir einen Hinweis zwischen den beiden Begriffen.</p>
			<div class="row">
				<Button variant="primary" action="guess" onclick={() => act({ type: 'guess' })}>Verdecken & Hinweis geben</Button>
				<Button variant="secondary" action="redraw" onclick={() => act({ type: 'redraw' })}>Anderes Spektrum</Button>
			</div>
		{:else if s.phase === 'guess'}
			<div class="stack tight">
				<h2>{clue.name} gibt den Hinweis</h2>
				<p class="muted">{others} {many ? 'drehen' : 'dreht'} den Zeiger dorthin, wo das Ziel liegt.</p>
			</div>
			<Dial value={s.dial} needle left={s.spectrum.a} right={s.spectrum.b} ondial={(value) => act({ type: 'dial', value })} />
			<div class="row">
				<Button variant="primary" action="lockIn" onclick={lockIn}>Einloggen</Button>
			</div>
		{:else if s.phase === 'result'}
			{@const points = s.lastScore ?? 0}
			<div class="outcome" class:miss={points === 0}>
				<p class="score data" data-testid="points">{#if points > 0}+{/if}<span use:countUp={points}></span></p>
				<div class="stack tight">
					<p class="label">{points === 1 ? 'Punkt' : 'Punkte'} für {koop ? 'euch' : team.name}</p>
					<h2 data-testid="verdict">{verdict[points]}</h2>
				</div>
			</div>
			<Dial value={s.dial} needle target={s.target} left={s.spectrum.a} right={s.spectrum.b} />
			<div class="row">
				<Button variant="primary" action="next" onclick={next}>{last ? 'Zum Endstand' : 'Weiter'}</Button>
			</div>
		{:else if koop}
			{@const result = koopResult(s)}
			<div class="reveal">
				<p class="label">Ergebnis</p>
				<h2 class="reveal-word winner">{result.tier}</h2>
				<p class="total data">{result.total} {result.total === 1 ? 'Punkt' : 'Punkte'}</p>
				<p>Ø {formatAverage(result.average)} Punkte pro Zug · {result.turns} Züge</p>
			</div>
			<div class="row">
				<Button variant="primary" action="again" onclick={() => act({ type: 'again' })}>Nochmal spielen</Button>
			</div>
		{:else}
			<div class="reveal">
				<p class="label">{best.length > 1 ? 'Unentschieden' : 'Gewinner'}</p>
				<h2 class="reveal-word winner">{best.map((t) => t.name).join(' & ')}</h2>
				<p>{s.rounds} {s.rounds === 1 ? 'Runde' : 'Runden'} gespielt.</p>
			</div>
			<div class="row">
				<Button variant="primary" action="again" onclick={() => act({ type: 'again' })}>Nochmal spielen</Button>
			</div>
		{/if}
	</div>

	<aside class="stack">
		<Scoreboard {rows} />
		{#if koop}
			<ol class="teams" aria-label="Reihenfolge">
				{#each team.players as p, i (p.id)}
					{@const now = s.phase !== 'gameOver' && i === s.turn}
					<li class="player" class:now aria-current={now || undefined}>
						<span class="label">{i + 1}</span>
						<span>{p.name}</span>
					</li>
				{/each}
			</ol>
		{:else}
			<ul class="teams">
				{#each s.teams as t, i (t.name)}
					<li class:now={s.phase !== 'gameOver' && i === s.teamIndex}>
						<span class="label">{t.name}</span>
						<span>{t.players.map((p) => p.name).join(', ')}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>
</div>

<style>
	.tight {
		gap: 8px;
	}

	.lead {
		font-weight: 700;
		font-size: 20px;
	}

	.outcome {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px;
		border-radius: var(--radius-xl);
		background: var(--wavelength);
		color: var(--ink);
		box-shadow: 0 var(--ledge) 0 var(--wavelength-ledge);
	}

	.outcome .label {
		color: inherit;
	}

	.outcome.miss {
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
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

	.teams li.player {
		flex-direction: row;
		align-items: baseline;
		gap: 12px;
	}

	.total {
		font-size: 24px;
	}

	.teams li .label {
		color: var(--muted);
	}

	.teams li.now {
		box-shadow: inset 3px 0 0 var(--wavelength);
	}

	.teams li.now .label {
		color: var(--wavelength);
	}
</style>
