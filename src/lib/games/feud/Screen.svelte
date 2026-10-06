<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { board } from '#lib/content/survey.ts';
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { countUp, ease, reducedMotion } from '#lib/motion.ts';
	import { roster } from '#lib/roster.svelte.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Lives from '#lib/ui/Lives.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import BoardTiles from './Board.svelte';
	import {
		STRIKES,
		canUndo,
		due,
		multiplier,
		named,
		opener,
		pot,
		suddenDeath,
		survey,
		type FeudAction,
		type FeudState
	} from './engine.ts';
	import { demo as script } from './demo.ts';
	import Handoff from './Handoff.svelte';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as FeudState);
	const tiles = $derived(board(survey(s)));
	const teams = $derived(s.config.teams);
	// team 0 is blue, team 1 is gold; both take ink text
	const colours = ['feud', 'gold'];
	const fmt = new Intl.NumberFormat('de-DE');
	// what was revealed when this phase's screen mounted; those tiles don't flip again
	const before = untrack(() => s.revealed);

	const who = (id: string) => roster.players.find((p) => p.id === id)?.name ?? (id.startsWith('player-') ? 'Spieler' : id);
	const pair = $derived(named(s).map(who));
	const last = $derived(s.round + 1 >= s.config.surveys.length);
	const double = $derived(multiplier(s) > 1);
	const acting = $derived(
		s.phase === 'faceoff' ? due(s) : s.phase === 'board' ? s.playing : s.phase === 'steal' ? 1 - s.playing! : null
	);
	const round = $derived(suddenDeath(s) ? 'Stichfrage' : `Runde ${s.round + 1} / ${s.config.surveys.length}`);

	// the tiles aren't Buttons: in the demo only the one the script names may be tapped
	const demo = $derived(getDemo());
	const scripted = $derived.by(() => {
		const action = demo?.expected ? script.steps[demo.step - 1]?.action : undefined;
		return action && 'tile' in action ? action.tile : null;
	});

	// Handoff for the steal is shown once per visit; Stage remounts this per phase, so it starts closed.
	// The demo has no control for its Weiter, so it goes straight to the board.
	let stealing = $state(getDemo() !== null);
	let arena: HTMLElement | undefined = $state();
	let stamp: HTMLElement | undefined = $state();

	const act = (a: FeudAction) => dispatch(a);

	function answer(tile: number | null) {
		play(tile === null ? 'wrong' : 'reveal');
		act({ type: 'answer', tile });
	}

	function reveal(tile: number) {
		play('reveal');
		act({ type: 'reveal', tile });
	}

	function strike() {
		play('wrong');
		act({ type: 'strike' });
		if (reducedMotion()) return;
		arena?.animate(
			[
				{ transform: 'translateX(0)' },
				{ transform: 'translateX(-10px)', offset: 0.2 },
				{ transform: 'translateX(8px)', offset: 0.45 },
				{ transform: 'translateX(-5px)', offset: 0.7 },
				{ transform: 'translateX(0)' }
			],
			{ duration: 360, easing: ease }
		);
		stamp?.animate(
			[
				{ transform: 'scale(2.2)', opacity: 0 },
				{ transform: 'scale(1)', opacity: 1, offset: 0.25 },
				{ transform: 'scale(1)', opacity: 1, offset: 0.7 },
				{ transform: 'scale(1)', opacity: 0 }
			],
			{ duration: 800, easing: ease }
		);
	}

	function steal(tile: number | null) {
		play(tile === null ? 'wrong' : 'reveal');
		act({ type: 'steal', tile });
	}

	// like countUp, but from the score before the round
	function tween(node: HTMLElement, { from, to }: { from: number; to: number }) {
		let frame = 0;
		const run = (a: number, b: number) => {
			cancelAnimationFrame(frame);
			if (a === b || reducedMotion()) {
				node.textContent = fmt.format(b);
				return;
			}
			const start = performance.now();
			const tick = (now: number) => {
				const t = Math.min(1, (now - start) / 1100);
				node.textContent = fmt.format(Math.round(a + (b - a) * (1 - (1 - t) ** 3)));
				if (t < 1) frame = requestAnimationFrame(tick);
			};
			node.textContent = fmt.format(a);
			frame = requestAnimationFrame(tick);
		};
		run(from, to);
		return { update: ({ from, to }: { from: number; to: number }) => run(from, to), destroy: () => cancelAnimationFrame(frame) };
	}

	const from = (t: number) => (s.phase === 'result' && s.gain!.team === t ? s.scores[t] - s.gain!.points : s.scores[t]);
	const rows = $derived(
		teams
			.map((t, i) => ({ name: t.name, score: s.scores[i], lead: s.winner === i }))
			.sort((a, b) => b.score - a.score)
	);

	onMount(() => {
		if (s.phase === 'result') play('correct');
		if (s.phase === 'gameOver') play('win');
	});
</script>

{#snippet versus()}
	<section class="versus" aria-label="Spielstand">
		{#each teams as t, i (i)}
			<div class="side" class:on={acting === i} aria-current={acting === i || undefined} style="--team: var(--{colours[i]})">
				<span class="name">{t.name}</span>
				<span class="total" data-testid="score-{i}" use:tween={{ from: from(i), to: s.scores[i] }}></span>
			</div>
		{/each}
	</section>
{/snippet}

{#snippet peek()}
	<HoldToView label="Umfrage ansehen" corner onrelease={() => {}}>
		<div class="peek" data-testid="peek">
			<p class="label">Umfrage</p>
			<h3>{survey(s).question}</h3>
			<ol>
				{#each tiles as t, i (i)}
					<li><span>{t.text}</span><span class="points">{t.points}</span></li>
				{/each}
			</ol>
		</div>
	</HoldToView>
{/snippet}

{#snippet undo(variant: 'secondary' | 'ghost' = 'ghost')}
	<Button {variant} action="undo" disabled={!canUndo(s)} onclick={() => act({ type: 'undo' })}>Rückgängig</Button>
{/snippet}

{#if s.phase === 'gameOver'}
	<div class="stack">
		<div class="reveal">
			<p class="label">Gewinner</p>
			<h2 class="reveal-word winner">{teams[s.winner!].name}</h2>
			<p>{suddenDeath({ ...s, round: s.round }) ? 'Entschieden in der Stichfrage.' : `${s.config.surveys.length} ${s.config.surveys.length === 1 ? 'Runde' : 'Runden'} gespielt.`}</p>
		</div>
		<Scoreboard {rows} />
	</div>
{:else if s.phase === 'choose'}
	<Handoff colour={colours[s.control!]} label="Duell gewonnen" team={teams[s.control!].name} note="Spielen oder passen?">
		<Button variant="primary" action="play" onclick={() => act({ type: 'play' })}>Spielen</Button>
		<Button variant="secondary" action="pass" onclick={() => act({ type: 'pass' })}>Passen</Button>
		{@render undo('secondary')}
	</Handoff>
{:else if s.phase === 'steal' && !stealing}
	<Handoff colour={colours[1 - s.playing!]} label="Dritter Fehler" team={teams[1 - s.playing!].name} note="Eine Antwort zum Stehlen.">
		<Button variant="primary" onclick={() => (stealing = true)}>Weiter</Button>
		{@render undo('secondary')}
	</Handoff>
{:else}
	<div class="stack">
		<div class="topline">
			<p class="label turn">
				{round} · {s.phase === 'faceoff' ? 'Duell' : s.phase === 'board' ? 'Tafel' : s.phase === 'steal' ? 'Stehlen' : 'Ergebnis'}
			</p>
			{#if double}
				<span class="tag">Doppelte Punkte</span>
			{/if}
			{#if s.phase !== 'result'}
				<div class="corner">{@render peek()}</div>
			{/if}
		</div>

		{@render versus()}

		<Card tone="feud_surveys">
			<h2>{survey(s).question}</h2>
		</Card>

		{#if s.phase === 'faceoff'}
			<section class="duel" aria-label="Duell">
				{#each teams as t, i (i)}
					{@const first = i === opener(s)}
					{@const given = s.answers[first ? 0 : 1]}
					<div class="duelist" class:on={due(s) === i} style="--team: var(--{colours[i]})">
						<span class="label">{t.name}</span>
						<strong>{pair[i]}</strong>
						<span class="status">
							{#if given === undefined}
								{due(s) === i ? 'ist dran' : 'wartet'}
							{:else if given === null}
								Daneben
							{:else}
								Platz {given + 1}
							{/if}
						</span>
					</div>
				{/each}
			</section>
			<p class="muted">{pair[due(s)]} nennt eine Antwort. Tippe auf die genannte Antwort.</p>
		{:else if s.phase === 'board'}
			<p class="muted">{teams[s.playing!].name} antwortet gemeinsam. Tippe auf jede genannte Antwort.</p>
		{:else if s.phase === 'steal'}
			<p class="muted">{teams[1 - s.playing!].name} nennt eine Antwort. Ein Treffer holt den Topf.</p>
		{/if}

		{#if s.phase === 'result'}
			{@const g = s.gain!}
			<div class="outcome" style="--team: var(--{colours[g.team]})">
				{#if suddenDeath(s)}
					<div class="stack tight">
						<p class="label">Stichfrage entschieden</p>
						<h2>{teams[g.team].name} gewinnt das Duell</h2>
					</div>
				{:else}
					<p class="score data" data-testid="points">+<span use:countUp={g.points}></span></p>
					<div class="stack tight">
						<p class="label">{g.points === 1 ? 'Punkt' : 'Punkte'} für {teams[g.team].name}</p>
						<h2>{g.stolen ? 'Gestohlen' : 'Topf gesichert'}</h2>
						{#if double}
							<p>{pot(s)} × {multiplier(s)}</p>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<div class="arena" bind:this={arena}>
			<BoardTiles
				{tiles}
				revealed={s.revealed}
				{before}
				result={s.phase === 'result'}
				verb={s.phase === 'faceoff'
					? (r) => `Antwort ${r} nennen`
					: s.phase === 'board'
						? (r) => `Antwort ${r} aufdecken`
						: s.phase === 'steal'
							? (r) => `Antwort ${r} stehlen`
							: null}
				onpick={s.phase === 'faceoff' ? answer : s.phase === 'board' ? reveal : steal}
				locked={demo !== null}
				expected={scripted}
			/>
			<div class="stamp" bind:this={stamp} aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"></path></svg>
			</div>
		</div>

		{#if s.phase === 'faceoff'}
			<div class="row">
				<Button variant="secondary" action="miss" onclick={() => answer(null)}>Nicht auf der Tafel</Button>
				{@render undo()}
			</div>
		{:else if s.phase === 'board'}
			<div class="strikes">
				<Lives icon="strike" total={STRIKES} left={s.strikes} size={30} />
				<p class="pot">Im Topf <strong data-testid="pot">{pot(s)}</strong>{#if double} <span class="muted">× {multiplier(s)}</span>{/if}</p>
			</div>
			<div class="row">
				<Button variant="primary" action="strike" onclick={strike}>Fehler</Button>
				{@render undo()}
			</div>
		{:else if s.phase === 'steal'}
			<div class="strikes">
				<Lives icon="strike" total={STRIKES} left={s.strikes} size={30} />
				<p class="pot">Im Topf <strong data-testid="pot">{pot(s)}</strong>{#if double} <span class="muted">× {multiplier(s)}</span>{/if}</p>
			</div>
			<div class="row">
				<Button variant="secondary" action="miss" onclick={() => steal(null)}>Nicht auf der Tafel</Button>
				{@render undo()}
			</div>
		{:else}
			<div class="row">
				<Button variant="primary" action="next" onclick={() => act({ type: 'next' })}>{last || suddenDeath(s) ? 'Zum Ergebnis' : 'Nächste Runde'}</Button>
				{@render undo('secondary')}
			</div>
		{/if}
	</div>
{/if}

<style>
	.topline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
	}

	.turn {
		color: var(--feud);
	}

	.tag {
		padding: 4px 10px;
		border-radius: 6px;
		background: var(--gold);
		color: var(--ink);
		font: 700 12px/1.4 var(--font-ui);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.corner {
		margin-left: auto;
	}

	.tight {
		gap: 8px;
	}

	.versus {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px 14px;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		overflow-wrap: anywhere;
	}

	.side:last-child {
		align-items: flex-end;
		text-align: right;
	}

	.side.on {
		background: var(--team);
		color: var(--ink);
	}

	.name {
		font-weight: 700;
		font-size: 15px;
	}

	.total {
		font-weight: 800;
		font-size: clamp(28px, 6vw, 44px);
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.duel {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.duelist {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		overflow-wrap: anywhere;
	}

	.duelist strong {
		font-weight: 800;
		font-size: clamp(22px, 5vw, 32px);
		line-height: 1.1;
	}

	.duelist .label {
		color: var(--muted);
	}

	.duelist .status {
		color: var(--muted);
		font-size: 14px;
	}

	.duelist.on {
		background: var(--team);
		color: var(--ink);
	}

	.duelist.on .label,
	.duelist.on .status {
		color: inherit;
	}

	.arena {
		position: relative;
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
		width: min(60%, 220px);
		height: auto;
		filter: drop-shadow(0 4px 0 var(--shadow));
	}

	.strikes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
	}

	.pot strong {
		font-weight: 800;
		font-size: 22px;
		font-variant-numeric: tabular-nums;
	}

	.outcome {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px;
		border-radius: var(--radius-xl);
		background: var(--team);
		color: var(--ink);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.outcome .label {
		color: inherit;
	}

	.score {
		flex: none;
		font-size: clamp(34px, 9vw, 52px);
		line-height: 1;
	}

	.winner {
		font-size: clamp(40px, 11vw, 84px);
	}

	.peek {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px;
		text-align: left;
	}

	.peek ol {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.peek li {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		font-weight: 600;
	}

	.peek .points {
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}
</style>
