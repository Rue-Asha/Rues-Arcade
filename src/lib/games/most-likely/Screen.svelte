<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { pulse } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import { demo as script } from './demo.ts';
	import { choices, current, leaders, ranking, type MostLikelyAction, type MostLikelyState } from './engine.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as MostLikelyState);
	const list = (names: string[]) => new Intl.ListFormat('de').format(names);

	const team = $derived(s.teams[current(s)]);
	const lastTurn = $derived(s.turn + 1 >= s.teams.length);
	const lastGame = $derived(lastTurn && s.round + 1 >= s.rounds);
	const best = $derived(leaders(s));
	const top = $derived(Math.max(...s.teams.map((t) => t.score)));
	const rows = $derived(ranking(s).map(({ team: t }) => ({ name: t.name, score: t.score, lead: top > 0 && t.score === top })));
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

<div class="split">
	<section class="stack main" aria-live="polite">
		{#if s.phase !== 'gameOver'}
			<p class="label turn"><span>Runde {s.round + 1} / {s.rounds}</span> · <span>Team {s.turn + 1} / {s.teams.length}</span></p>
		{/if}

		{#if s.phase === 'prompt'}
			<div class="stack tight">
				<h2>{team.name} ist dran</h2>
				<p class="names" data-testid="players">{list(team.players.map((p) => p.name))}</p>
			</div>
			<Card tone="most_likely_prompts">
				<p class="label">Vorlesen</p>
				<p class="prompt" data-testid="prompt">{s.prompt.a}</p>
				<p class="muted">Zählt bis drei und zeigt gleichzeitig auf die Person, die am besten passt.</p>
			</Card>
			<div class="row">
				<Button variant="primary" action="point" onclick={() => act({ type: 'point' })}>Alle haben gezeigt</Button>
				<Button variant="secondary" action="redraw" disabled={s.pool.length < 2} onclick={() => act({ type: 'redraw' })}>
					Anderer Spruch
				</Button>
			</div>
		{:else if s.phase === 'count'}
			<div class="stack tight">
				<p class="muted small" data-testid="count-prompt">{s.prompt.a}</p>
				<h2 id="count">Wie viele aus {team.name} haben auf dieselbe Person gezeigt?</h2>
				<p class="muted">Zählt die größte Gruppe, die auf dieselbe Person zeigt. Jeder Finger darin ist ein Punkt.</p>
			</div>
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
			<div class="outcome" class:miss={s.lastPoints === 0} use:pulse>
				<p class="score data" data-testid="points">+{s.lastPoints}</p>
				<div class="stack tight">
					<p class="label">{s.lastPoints === 1 ? 'Punkt' : 'Punkte'} für {team.name}</p>
					<h2>{verdict}</h2>
				</div>
			</div>
			<Card tone="most_likely_prompts">
				<p class="label">Der Spruch war</p>
				<p class="prompt small-prompt" data-testid="result-prompt">{s.prompt.a}</p>
			</Card>
			<div class="row">
				<Button variant="primary" action="next" onclick={next}>
					{lastGame ? 'Zum Ergebnis' : lastTurn ? 'Nächste Runde' : 'Nächstes Team'}
				</Button>
			</div>
		{:else}
			<div class="reveal">
				<p class="label">{best.length > 1 ? 'Unentschieden' : 'Gewinner'}</p>
				<h2 class="reveal-word winner">{best.map((t) => t.name).join(' & ')}</h2>
				<p>{s.rounds} Runden gespielt.</p>
			</div>
			<section class="board" aria-labelledby="final">
				<h2 class="label" id="final">Endstand</h2>
				<ol class="rows rise">
					{#each ranking(s) as row (row.team.name)}
						{@const lead = row.team.score === top}
						<li class="entry" class:lead>
							<span class="rank">{row.rank}</span>
							<span class="who">
								<span class="name">{row.team.name}</span>
								<span class="members">{list(row.team.players.map((p) => p.name))}</span>
							</span>
							<span class="pts data">{row.team.score}</span>
						</li>
					{/each}
				</ol>
			</section>
			<div class="row">
				<Button variant="primary" action="rematch" onclick={() => act({ type: 'rematch' })}>Nochmal spielen</Button>
			</div>
		{/if}
	</section>

	{#if s.phase !== 'gameOver'}
		<aside class="stack">
			<Scoreboard {rows} />
			<ul class="teams" aria-label="Teams">
				{#each s.teams as t, i (t.name)}
					<li class:now={i === current(s)}>
						<span class="label">{t.name}</span>
						<span>{list(t.players.map((p) => p.name))}</span>
					</li>
				{/each}
			</ul>
		</aside>
	{/if}
</div>

<style>
	.turn {
		color: var(--most-likely);
	}

	.tight {
		gap: 8px;
	}

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

	.outcome {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px;
		border-radius: var(--radius-xl);
		background: var(--most-likely);
		color: var(--ink);
		box-shadow: 0 var(--ledge) 0 var(--most-likely-ledge);
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

	.board {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px;
		border-radius: var(--radius-xl);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 54px;
		padding: 8px 14px;
		border-radius: var(--radius-sm);
		background: var(--raised);
	}

	.rank {
		width: 20px;
		font-weight: 800;
		font-size: 15px;
		font-variant-numeric: tabular-nums;
	}

	.who {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.name {
		font-weight: 700;
		font-size: 17px;
	}

	.members {
		font-size: 14px;
	}

	.pts {
		min-width: 40px;
		font-size: 13px;
		text-align: right;
	}

	.lead {
		background: var(--primary);
		color: var(--on-primary);
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
