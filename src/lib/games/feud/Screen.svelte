<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { board } from '#lib/content/survey.ts';
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { fault, reducedMotion } from '#lib/motion.ts';
	import { roster } from '#lib/roster.svelte.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import GameFrame from '#lib/ui/GameFrame.svelte';
	import Handoff from '#lib/ui/Handoff.svelte';
	import HoldToView from '#lib/ui/HoldToView.svelte';
	import Lives from '#lib/ui/Lives.svelte';
	import Outcome from '#lib/ui/Outcome.svelte';
	import Reveal from '#lib/ui/Reveal.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import Winner from '#lib/ui/Winner.svelte';
	import BoardTiles from './Board.svelte';
	import {
		STRIKES,
		banks,
		canUndo,
		due,
		feud,
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
	// the face-off takes answers once the question is uncovered and a team has buzzed
	const ready = $derived(s.asked && s.first !== null);
	const acting = $derived(
		s.phase === 'faceoff' ? (ready ? due(s) : null) : s.phase === 'board' ? s.playing : s.phase === 'steal' ? 1 - s.playing! : null
	);

	// the tiles aren't Buttons: in the demo only the one the script names may be tapped
	const demo = $derived(getDemo());
	const scripted = $derived.by(() => {
		const action = demo?.expected ? script.steps[demo.step - 1]?.action : undefined;
		return action && 'tile' in action ? action.tile : null;
	});
	// "Nicht auf der Tafel" dispatches answer/steal with tile null, so in the demo it carries the scripted action's type
	const missing = $derived.by(() => {
		const action = demo?.expected ? script.steps[demo.step - 1]?.action : undefined;
		return action && 'tile' in action && action.tile === null ? action.type : 'miss';
	});
	// on a buzz step only the scripted team's button carries the expected action
	const buzzer = $derived.by(() => {
		const action = demo?.expected ? script.steps[demo.step - 1]?.action : undefined;
		return action?.type === 'buzz' ? action.team : null;
	});

	// Handoff for the steal is shown once per visit; Stage remounts this per phase, so it starts closed.
	// The demo has no control for its Weiter, so it goes straight to the board.
	let stealing = $state(getDemo() !== null);
	let arena: HTMLElement | undefined = $state();
	let stamp: HTMLElement | undefined = $state();

	const act = (a: FeudAction) => {
		if (banks(s, feud.reduce(s, a))) play('correct');
		dispatch(a);
	};

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
		fault(arena, stamp);
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

{#snippet tag()}
	<span class="tag">Doppelte Punkte</span>
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

{#snippet undo()}
	<Button variant="secondary" action="undo" disabled={!canUndo(s)} onclick={() => act({ type: 'undo' })}>Rückgängig</Button>
{/snippet}

<!-- always rendered next to Fehler / Nicht auf der Tafel, so the row doesn't shift when it turns disabled -->
{#snippet back()}
	<Button variant="warning" square label="Rückgängig" action="undo" disabled={!canUndo(s)} onclick={() => act({ type: 'undo' })}>
		<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"></path></svg>
	</Button>
{/snippet}

<GameFrame>
	{#snippet hero()}
		{#if s.phase === 'gameOver'}
			<Winner
				names={[teams[s.winner!].name]}
				label="Gewinner"
				colour={colours[s.winner!]}
				note={suddenDeath({ ...s, round: s.round }) ? 'Entschieden in der Stichfrage.' : `${s.config.surveys.length} ${s.config.surveys.length === 1 ? 'Runde' : 'Runden'} gespielt.`}
			/>
		{:else if s.phase === 'choose'}
			<Handoff heading={teams[s.control!].name} label="Duell gewonnen" note="Spielen oder passen?" colour={colours[s.control!]} />
		{:else if s.phase === 'steal' && !stealing}
			<Handoff heading={teams[1 - s.playing!].name} label="Dritter Fehler" note="Eine Antwort zum Stehlen." colour={colours[1 - s.playing!]} />
		{:else if s.phase === 'result'}
			{@const g = s.gain!}
			{#if suddenDeath(s)}
				<div class="stack tight">
					<p class="label">Stichfrage entschieden</p>
					<h2>{teams[g.team].name} gewinnt das Duell</h2>
				</div>
			{:else}
				<Outcome verdict={g.stolen ? 'Gestohlen' : 'Topf gesichert'} points={g.points} />
			{/if}
		{:else}
			<div class="question">
				<Reveal shown={s.asked}>
					{#snippet covered()}
						{#if double}{@render tag()}{/if}
						<p>Lies die Frage laut vor, dann decke sie auf.</p>
						<Button variant="primary" action="ask" onclick={() => act({ type: 'ask' })}>Frage aufdecken</Button>
					{/snippet}
					{#if double}{@render tag()}{/if}
					<h2>{survey(s).question}</h2>
				</Reveal>
			</div>
		{/if}
	{/snippet}

	{#snippet children()}
		{#if s.phase !== 'gameOver' && s.phase !== 'choose' && !(s.phase === 'steal' && !stealing)}
			{#if s.phase === 'result'}
				{#if double}
					{@render tag()}
				{/if}
				<p class="label">{s.gain!.points === 1 ? 'Punkt' : 'Punkte'} für {teams[s.gain!.team].name}</p>
				{#if double && !suddenDeath(s)}
					<p>{pot(s)} × {multiplier(s)}</p>
				{/if}
			{/if}

			{#if s.phase === 'faceoff'}
				{#if s.first === null}
					<div class="buzz" role="group" aria-label="Buzzer">
						{#each teams as t, i (i)}
							<div class="pick" style="--team: var(--{colours[i]})">
								<Button
									variant="secondary"
									action={buzzer === null || buzzer === i ? 'buzz' : 'buzz-other'}
									disabled={!s.asked}
									onclick={() => act({ type: 'buzz', team: i })}>{t.name}</Button
								>
							</div>
						{/each}
					</div>
				{/if}
				<section class="duel" aria-label="Duell">
					{#each teams as t, i (i)}
						{@const first = i === opener(s)}
						{@const given = s.answers[first ? 0 : 1]}
						<div class="duelist" class:on={acting === i} style="--team: var(--{colours[i]})">
							<span class="label">{t.name}</span>
							<strong>{pair[i]}</strong>
							<span class="status">
								{#if given === undefined}
									{acting === i ? 'ist dran' : 'wartet'}
								{:else if given === null}
									Daneben
								{:else}
									Platz {given + 1}
								{/if}
							</span>
						</div>
					{/each}
				</section>
				{#if s.asked}
					<p class="muted">
						{#if !ready}
							Tippe auf das Team, das zuerst gebuzzert hat.
						{:else}
							{pair[due(s)]} nennt eine Antwort. Tippe auf die genannte Antwort.
						{/if}
					</p>
				{/if}
			{:else if s.phase === 'board'}
				<p class="muted">{teams[s.playing!].name} antwortet gemeinsam. Tippe auf jede genannte Antwort.</p>
			{:else if s.phase === 'steal'}
				<p class="muted">{teams[1 - s.playing!].name} nennt eine Antwort. Ein Treffer holt den Topf.</p>
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
					locked={demo !== null || (s.phase === 'faceoff' && !ready)}
					expected={scripted}
				/>
				<div class="stamp" bind:this={stamp} aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"></path></svg>
				</div>
			</div>

			{#if s.phase === 'board' || s.phase === 'steal'}
				<div class="strikes">
					<Lives icon="strike" total={STRIKES} left={s.strikes} size={30} />
					<p class="pot">Im Topf <strong data-testid="pot">{pot(s)}</strong>{#if double} <span class="muted">× {multiplier(s)}</span>{/if}</p>
				</div>
			{/if}
		{/if}
	{/snippet}

	{#snippet actions()}
		{#if s.phase === 'choose'}
			<div class="row">
				<Button variant="primary" action="play" onclick={() => act({ type: 'play' })}>Spielen</Button>
				<Button variant="secondary" action="pass" onclick={() => act({ type: 'pass' })}>Passen</Button>
				{@render undo()}
			</div>
		{:else if s.phase === 'steal' && !stealing}
			<div class="row">
				<Button variant="primary" onclick={() => (stealing = true)}>Weiter</Button>
				{@render undo()}
			</div>
		{:else if s.phase === 'faceoff'}
			<div class="row fix">
				<Button variant="danger" action={missing} disabled={!ready} onclick={() => answer(null)}>Nicht auf der Tafel</Button>
				{@render back()}
			</div>
		{:else if s.phase === 'board'}
			<div class="row fix">
				<Button variant="danger" action="strike" onclick={strike}>Fehler</Button>
				{@render back()}
			</div>
		{:else if s.phase === 'steal'}
			<div class="row fix">
				<Button variant="danger" action={missing} onclick={() => steal(null)}>Nicht auf der Tafel</Button>
				{@render back()}
			</div>
		{:else if s.phase === 'result'}
			<div class="row">
				<Button variant="primary" action="next" onclick={() => act({ type: 'next' })}>{last || suddenDeath(s) ? 'Zum Ergebnis' : 'Nächste Runde'}</Button>
				{@render undo()}
			</div>
		{/if}
	{/snippet}

	{#snippet rail()}
		{#if s.phase === 'gameOver'}
			<Scoreboard {rows} />
		{:else}
			<div class="stack">
				{#if s.phase !== 'result'}
					<div class="corner">{@render peek()}</div>
				{/if}
				{@render versus()}
			</div>
		{/if}
	{/snippet}
</GameFrame>

<style>
	/* the board, the duel and the action row have to share the first viewport with the card */
	.question :global([data-testid='reveal']),
	.question :global([data-testid='covered']) {
		min-height: 0;
		padding: 12px;
	}

	.question h2 {
		font-size: clamp(20px, 5vw, 30px);
		line-height: 1.15;
	}

	.tag {
		align-self: center;
		padding: 4px 10px;
		border-radius: 6px;
		background: var(--gold);
		color: var(--ink);
		font: 700 12px/1.4 var(--font-ui);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.corner {
		display: flex;
		justify-content: flex-end;
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

	.fix {
		flex-wrap: nowrap;
	}

	.buzz {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.buzz .pick :global(.btn.secondary) {
		width: 100%;
		background: var(--team);
		color: var(--ink);
		border-color: transparent;
		white-space: normal;
		overflow-wrap: anywhere;
	}

	.duel {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.duelist {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: baseline;
		gap: 0 8px;
		padding: 8px 14px;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
		overflow-wrap: anywhere;
	}

	.duelist strong {
		grid-row: 2;
		grid-column: 1 / -1;
		font-weight: 800;
		font-size: clamp(20px, 5vw, 30px);
		line-height: 1.1;
	}

	.duelist .label {
		color: var(--muted);
	}

	.duelist .status {
		color: var(--muted);
		font-size: 13px;
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
