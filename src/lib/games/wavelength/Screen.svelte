<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import GameFrame from '#lib/ui/GameFrame.svelte';
	import Handoff from '#lib/ui/Handoff.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Outcome from '#lib/ui/Outcome.svelte';
	import Reveal from '#lib/ui/Reveal.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import Winner from '#lib/ui/Winner.svelte';
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
	const points = $derived(s.lastScore ?? 0);
	const rows = $derived(
		s.teams.map((t, i) => ({
			name: t.name,
			score: t.score,
			before: s.phase === 'result' && i === s.teamIndex ? t.score - points : undefined,
			lead: !koop && t.score > 0 && best.includes(t),
			acting: !koop && s.phase !== 'gameOver' && i === s.teamIndex
		}))
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

<GameFrame>
	{#snippet hero()}
		{#if s.phase === 'prep'}
			<Handoff
				heading="Gib das Handy an {clue.name}"
				label="{koop ? clue.name : team.name} ist dran"
				note="{others} {many ? 'schauen' : 'schaut'} weg. Nur {clue.name} sieht gleich das Ziel."
			/>
			<Dial value={90} left={s.spectrum.a} right={s.spectrum.b} />
		{:else if s.phase === 'reveal'}
			<HoldToView label="Gedrückt halten" onrelease={() => {}}>
				<Reveal shown>
					{#snippet covered()}{/snippet}
					<Dial value={s.dial} target={s.target} left={s.spectrum.a} right={s.spectrum.b} />
				</Reveal>
			</HoldToView>
		{:else if s.phase === 'guess'}
			<Dial value={s.dial} needle left={s.spectrum.a} right={s.spectrum.b} ondial={(value) => act({ type: 'dial', value })} />
		{:else if s.phase === 'result'}
			<Outcome verdict={verdict[points]} {points} />
			<Dial value={s.dial} needle target={s.target} left={s.spectrum.a} right={s.spectrum.b} />
		{:else if koop}
			{@const result = koopResult(s)}
			<Winner
				names={[result.tier]}
				label="Ergebnis"
				note="{result.total} {result.total === 1 ? 'Punkt' : 'Punkte'}"
			/>
		{:else}
			<Winner
				names={best.map((t) => t.name)}
				label={best.length > 1 ? undefined : 'Gewinner'}
				note="{s.rounds} {s.rounds === 1 ? 'Runde' : 'Runden'} gespielt."
			/>
		{/if}
	{/snippet}

	{#snippet children()}
		{#if s.phase === 'reveal'}
			<p class="lead">Nur {clue.name} schaut hin.</p>
			<p class="muted">Merk dir das Ziel und überleg dir einen Hinweis zwischen den beiden Begriffen.</p>
		{:else if s.phase === 'guess'}
			<h2>{clue.name} gibt den Hinweis</h2>
			<p class="muted">{others} {many ? 'drehen' : 'dreht'} den Zeiger dorthin, wo das Ziel liegt.</p>
		{:else if s.phase === 'result'}
			<p class="label">{points === 1 ? 'Punkt' : 'Punkte'} für {koop ? 'euch' : team.name}</p>
		{:else if s.phase === 'gameOver' && koop}
			{@const result = koopResult(s)}
			<p>Ø {formatAverage(result.average)} Punkte pro Zug · {result.turns} Züge</p>
		{/if}
	{/snippet}

	{#snippet actions()}
		{#if s.phase === 'prep'}
			<Button variant="primary" action="show" onclick={() => act({ type: 'show' })}>Ziel anzeigen</Button>
			<Button variant="secondary" action="redraw" onclick={() => act({ type: 'redraw' })}>Anderes Spektrum</Button>
		{:else if s.phase === 'reveal'}
			<Button variant="primary" action="guess" onclick={() => act({ type: 'guess' })}>Verdecken & Hinweis geben</Button>
			<Button variant="secondary" action="redraw" onclick={() => act({ type: 'redraw' })}>Anderes Spektrum</Button>
		{:else if s.phase === 'guess'}
			<Button variant="primary" action="lockIn" onclick={lockIn}>Einloggen</Button>
		{:else if s.phase === 'result'}
			<Button variant="primary" action="next" onclick={next}>{last ? 'Zum Endstand' : 'Weiter'}</Button>
		{:else}
			<Button variant="primary" action="again" onclick={() => act({ type: 'again' })}>Nochmal spielen</Button>
		{/if}
	{/snippet}

	{#snippet rail()}
		<div class="stack">
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
		</div>
	{/snippet}
</GameFrame>

<style>
	.lead {
		font-weight: 700;
		font-size: 20px;
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
