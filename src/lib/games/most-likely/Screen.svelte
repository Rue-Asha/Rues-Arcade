<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import GameFrame from '#lib/ui/GameFrame.svelte';
	import Handoff from '#lib/ui/Handoff.svelte';
	import Outcome from '#lib/ui/Outcome.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import Winner from '#lib/ui/Winner.svelte';
	import { demo as script } from './demo.ts';
	import { choices, current, leaders, type MostLikelyAction, type MostLikelyState } from './engine.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as MostLikelyState);
	const list = (names: string[]) => new Intl.ListFormat('de').format(names);

	const team = $derived(s.teams[current(s)]);
	const lastTurn = $derived(s.turn + 1 >= s.teams.length);
	const lastGame = $derived(lastTurn && s.round + 1 >= s.rounds);
	const best = $derived(leaders(s));
	const top = $derived(Math.max(...s.teams.map((t) => t.score)));
	const rows = $derived(
		s.teams.map((t, i) => ({
			name: t.name,
			score: t.score,
			before: s.phase === 'result' && i === current(s) ? t.score - (s.lastPoints ?? 0) : undefined,
			lead: s.phase === 'gameOver' ? t.score === top : top > 0 && t.score === top,
			acting: s.phase !== 'gameOver' && i === current(s)
		}))
	);
	const members = $derived(Object.fromEntries(s.teams.map((t) => [t.name, list(t.players.map((p) => p.name))])));
	const verdict = $derived(
		s.lastPoints === 0
			? 'Alle verschieden'
			: s.lastPoints === team.players.length
				? 'Alle auf dieselbe Person'
				: `${s.lastPoints} auf dieselbe Person`
	);

	// the choices aren't Buttons: in the demo only the count the script names may be tapped
	const demo = $derived(getDemo());
	const scripted = $derived.by(() => {
		const action = demo && demo.expected === 'score' ? script.steps[demo.step - 1]?.action : undefined;
		return action?.type === 'score' ? action.matched : null;
	});

	const act = (a: MostLikelyAction) => dispatch(a);

	function score(matched: number) {
		play('reveal');
		act({ type: 'score', matched });
	}

	function next() {
		if (lastGame) play('win');
		act({ type: 'next' });
	}
</script>

<GameFrame>
	{#snippet hero()}
		{#if s.phase === 'prompt'}
			<Handoff heading="{team.name} ist dran" />
		{:else if s.phase === 'count'}
			<h2 id="count">Wie viele aus {team.name} haben auf dieselbe Person gezeigt?</h2>
		{:else if s.phase === 'result'}
			<Outcome {verdict} points={s.lastPoints ?? 0} />
		{:else}
			<Winner
				names={best.map((t) => t.name)}
				label={best.length > 1 ? undefined : 'Gewinner'}
				note="{s.rounds} Runden gespielt."
			/>
		{/if}
	{/snippet}

	{#snippet children()}
		{#if s.phase === 'prompt'}
			<p class="names" data-testid="players">{list(team.players.map((p) => p.name))}</p>
			<p class="label">Vorlesen</p>
			<p class="prompt" data-testid="prompt">{s.prompt.a}</p>
			<p class="muted">Zählt bis drei und zeigt gleichzeitig auf die Person, die am besten passt.</p>
		{:else if s.phase === 'count'}
			<p class="muted small" data-testid="count-prompt">{s.prompt.a}</p>
			<p class="muted">Zählt die größte Gruppe, die auf dieselbe Person zeigt. Jeder Finger darin ist ein Punkt.</p>
		{:else if s.phase === 'result'}
			<p class="label">{s.lastPoints === 1 ? 'Punkt' : 'Punkte'} für {team.name}</p>
			<p class="label">Der Spruch war</p>
			<p class="prompt small-prompt" data-testid="result-prompt">{s.prompt.a}</p>
		{/if}
	{/snippet}

	{#snippet actions()}
		{#if s.phase === 'prompt'}
			<Button variant="primary" action="point" onclick={() => act({ type: 'point' })}>Alle haben gezeigt</Button>
			<Button variant="secondary" action="redraw" disabled={s.pool.length < 2} onclick={() => act({ type: 'redraw' })}>
				Anderer Spruch
			</Button>
		{:else if s.phase === 'count'}
			<div class="picks" role="group" aria-labelledby="count">
				{#each choices(team.players.length) as n (n)}
					{@const expected = scripted === n}
					<button
						type="button"
						class="pick"
						class:expected
						disabled={demo !== null && !expected}
						data-action="score"
						data-demo={expected ? 'expected' : undefined}
						onclick={() => score(n)}
					>
						{n === 0 ? 'Alle verschieden' : n}
					</button>
				{/each}
			</div>
		{:else if s.phase === 'result'}
			<Button variant="primary" action="next" onclick={next}>
				{lastGame ? 'Zum Ergebnis' : lastTurn ? 'Nächste Runde' : 'Nächstes Team'}
			</Button>
		{:else}
			<Button variant="primary" action="rematch" onclick={() => act({ type: 'rematch' })}>Nochmal spielen</Button>
		{/if}
	{/snippet}

	{#snippet rail()}
		<div class="stack">
			<Scoreboard {rows}>
				{#snippet detail(row)}
					{#if s.phase === 'gameOver'}<p class="members">{members[row.name]}</p>{/if}
				{/snippet}
			</Scoreboard>
			{#if s.phase !== 'gameOver'}
				<ul class="teams" aria-label="Teams">
					{#each s.teams as t, i (t.name)}
						<li class:now={i === current(s)}>
							<span class="label">{t.name}</span>
							<span>{members[t.name]}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/snippet}
</GameFrame>

<style>
	.small {
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.names {
		font-weight: 700;
		font-size: 18px;
		overflow-wrap: anywhere;
	}

	.prompt {
		font-weight: 800;
		font-size: clamp(24px, 5vw, 34px);
		line-height: 1.2;
		letter-spacing: -0.01em;
		overflow-wrap: anywhere;
	}

	.small-prompt {
		font-size: clamp(20px, 4vw, 26px);
	}

	.picks {
		flex: 1 1 100%;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
		gap: 10px;
	}

	.pick {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 56px;
		padding: 0 14px;
		border: 2px solid transparent;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: 0 4px 0 var(--shadow);
		color: var(--text);
		font: 700 17px/1.2 var(--font-ui);
		cursor: pointer;
		overflow-wrap: anywhere;
		user-select: none;
		touch-action: manipulation;
		transition:
			transform 0.07s ease-out,
			box-shadow 0.07s ease-out;
	}

	.pick:active:not(:disabled) {
		transform: translateY(4px);
		box-shadow: 0 0 0 transparent;
	}

	.pick:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.expected::after {
		content: '';
		position: absolute;
		inset: -7px -7px -11px;
		border: 3px solid var(--gold);
		border-radius: calc(var(--radius) + 6px);
		pointer-events: none;
		animation: beckon 1.2s var(--ease-out) infinite;
	}

	@keyframes beckon {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.45;
			transform: scale(1.03);
		}
	}

	.members {
		font-size: 14px;
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
		box-shadow: inset 3px 0 0 var(--most-likely);
	}

	.teams li.now .label {
		color: var(--most-likely);
	}
</style>
