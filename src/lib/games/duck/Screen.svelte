<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { fault } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
		import GameFrame from '#lib/ui/GameFrame.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import Reveal from '#lib/ui/Reveal.svelte';
	import Scoreboard from '#lib/ui/Scoreboard.svelte';
	import Winner from '#lib/ui/Winner.svelte';
	import { demo as script } from './demo.ts';
	import { checkWin, LETTERS, type DuckAction, type DuckState } from './engine.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as DuckState);
	const chuck = $derived(s.players[s.chuck].name);
	const over = $derived(s.phase === 'gameOver');
	const rows = $derived(
		s.players.map((p, i) => ({
			name: p.name,
			score: s.scores[i],
			before: s.phase === 'standings' || over ? s.baseScores[i] : undefined,
			lead: over && s.winners.includes(i),
			acting: !over && i === s.chuck
		}))
	);

	let skipping = $state(false);

	const livesOf = (name: string) => s.lives[s.players.findIndex((p) => p.name === name)];
	const isChuck = (name: string) => !over && s.players[s.chuck].name === name;

	// the point boxes and letters aren't Buttons: in the demo only the one the script names may be tapped
	const demo = $derived(getDemo());
	const step = $derived(demo?.expected ? script.steps[demo.step - 1].action : null);

	function cue(a: DuckAction): 'expected' | 'blocked' | null {
		if (demo === null) return null;
		const match = step !== null && Object.entries(a).every(([k, v]) => (step as Record<string, unknown>)[k] === v);
		return match ? 'expected' : 'blocked';
	}

	const act = (a: DuckAction) => dispatch(a);

	function reveal() {
		play('reveal');
		act({ type: 'show' });
	}

	function skip() {
		skipping = false;
		act({ type: 'skip' });
	}

	// the Modal's button would be a second expected skip, so in a demo the first tap skips directly
	function askSkip() {
		if (demo !== null) skip();
		else skipping = true;
	}

	function box(player: number, box: number) {
		play('press');
		act({ type: 'score', player, box });
	}

	function letter(e: MouseEvent, player: number, letter: number) {
		const lose = letter < s.lives[player];
		play(lose ? 'wrong' : 'press');
		if (lose) {
			const card = (e.currentTarget as HTMLElement).closest<HTMLElement>('li')!;
			fault(card, card.querySelector<HTMLElement>('[data-testid="stamp"]') ?? undefined);
		}
		act({ type: 'letter', player, letter });
	}

	function commit() {
		if (checkWin(s.scores, s.lives, s.target)) play('win');
		else if (s.scores.some((v, i) => v > s.baseScores[i])) play('correct');
		act({ type: 'commit' });
	}
</script>

{#snippet duck(size: number, body = 'var(--duck)')}
	<svg class="duck" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
		<path d="M8 28c0 9 7 14 17 14s17-5 17-13c0-4-3-6-7-5l-7 2c0-3 2-5 2-9a8 8 0 1 0-16 1c0 3 2 5 3 7-6-2-9 0-9 3z" style="fill:{body}" />
		<path d="M36 11l7 2-7 3z" style="fill:var(--gold)" />
		<circle cx="27" cy="12" r="1.8" style="fill:var(--ink)" />
		<path d="M17 31c4 3 10 3 14 0" style="fill:none;stroke:var(--duck-ledge);stroke-width:2.4;stroke-linecap:round" />
	</svg>
{/snippet}

{#snippet letters(lives: number)}
	<span class="letters" role="img" aria-label="{lives} von {LETTERS.length} Buchstaben">
		{#each LETTERS as l, j (j)}
			{#if j < lives}<span>{l}</span>{:else}<s>{l}</s>{/if}
		{/each}
	</span>
{/snippet}

{#snippet standing(row: { name: string })}
	<div class="standing">
		{@render letters(livesOf(row.name))}
		{#if isChuck(row.name)}<span class="tag">{@render duck(18, 'var(--ink)')} Chuck</span>{/if}
	</div>
{/snippet}

<GameFrame>
	{#snippet hero()}
		{#if s.phase === 'reveal'}
			<Reveal shown={s.shown}>
				{#snippet covered()}
					<p class="label">Neues Wort</p>
					<h2>Bereit?</h2>
					<p class="muted">Deckt das Wort für alle gleichzeitig auf. Dann sucht jede Person still einen Reim darauf.</p>
				{/snippet}
				<p class="label">Das Wort lautet</p>
				<p class="reveal-word" data-testid="word">{s.word.a}</p>
			</Reveal>
		{:else if s.phase === 'scoring'}
			<div class="wordline">
				<h2 class="word">{s.word.a}</h2>
				<div class="chips">
					<span class="chip on">{@render duck(22)} Chuck: {chuck}</span>
					<span class="chip">Ziel: {s.target} Punkte</span>
				</div>
			</div>
		{:else if s.phase === 'standings'}
			<div class="stack tight next">
				{@render duck(56)}
				<p class="label">Punktestand</p>
				<p class="nextline">Als Nächstes bekommt <strong>{chuck}</strong> Chuck the Duck.</p>
			</div>
		{:else}
			<Winner
				names={s.winners.map((i) => s.players[i].name)}
				label={s.winners.length > 1 ? undefined : 'Gewinner'}
				note={s.endReason === 'target' ? `Zielpunktzahl von ${s.target} erreicht.` : 'Ein Spieler hat alle Leben (DUCKY) verloren.'}
				colour="duck"
			/>
		{/if}
	{/snippet}

	{#if s.phase === 'reveal'}
		<div class="banner">
			{@render duck(56)}
			<div class="stack tight">
				<p class="label">Chuck the Duck</p>
				<h2 class="holder">{chuck}</h2>
				<p>Ein Reim-Match mit {chuck} bringt +2 Extrapunkte.</p>
				<p class="muted">Ziel: {s.target} Punkte</p>
			</div>
		</div>
	{:else if s.phase === 'scoring'}
		<ul class="cards" aria-label="Wertung">
			{#each s.players as p, i (p.id)}
				<li class="pcard" class:chuck={i === s.chuck} aria-label={p.name}>
					<div class="top">
						<span class="name">{p.name}</span>
						{#if i === s.chuck}<span class="tag">{@render duck(18, 'var(--ink)')} Chuck</span>{/if}
						<span class="total data">{s.scores[i]}<small>/{s.target}</small></span>
					</div>
					<div class="ducky" role="group" aria-label="DUCKY">
						{#each LETTERS as l, j (j)}
							{@const c = cue({ type: 'letter', player: i, letter: j })}
							{@const lost = j >= s.lives[i]}
							<button
								type="button"
								class="letter"
								class:lost
								class:expected={c === 'expected'}
								disabled={j >= s.baseLives[i] || c === 'blocked'}
								data-demo={c === 'expected' ? 'expected' : undefined}
								aria-pressed={lost}
								onclick={(e) => letter(e, i, j)}
							>
								{#if lost}<s>{l}</s>{:else}{l}{/if}
							</button>
						{/each}
					</div>
					<div class="boxes" role="group" aria-label="Punkte">
						{#each { length: s.target }, k (k)}
							{@const c = cue({ type: 'score', player: i, box: k + 1 })}
							<button
								type="button"
								class="box"
								class:on={k < s.scores[i]}
								class:locked={k < s.baseScores[i]}
								class:expected={c === 'expected'}
								disabled={k < s.baseScores[i] || c === 'blocked'}
								data-demo={c === 'expected' ? 'expected' : undefined}
								aria-label={k === 0 ? '1 Punkt' : `${k + 1} Punkte`}
								aria-pressed={k < s.scores[i]}
								onclick={() => box(i, k + 1)}
							></button>
						{/each}
					</div>
					<div class="stamp" data-testid="stamp" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"></path></svg>
					</div>
				</li>
			{/each}
		</ul>
	{:else if s.phase === 'standings'}
		<h2 class="label">So wird gewertet</h2>
		<ul class="rules">
			<li>Genau eine andere Person mit demselben Reim: 3 Punkte.</li>
			<li>Mehrere Personen mit demselben Reim: je 1 Punkt.</li>
			<li>Ein Match mit Chuck the Duck: 2 Punkte extra.</li>
			<li>Kein Reim: ein Buchstabe von DUCKY ist weg.</li>
		</ul>
		<p class="muted">Ziel: {s.target} Punkte</p>
	{/if}

	{#snippet actions()}
		{#if s.phase === 'reveal'}
			{#if !s.shown}
				<Button variant="primary" action="show" onclick={reveal}>Wort aufdecken</Button>
			{:else}
				<Button variant="primary" action="play" onclick={() => act({ type: 'play' })}>Wort spielen</Button>
			{/if}
			<Button variant="secondary" action="skip" onclick={askSkip}>Überspringen</Button>
		{:else if s.phase === 'scoring'}
			<Button variant="primary" action="commit" onclick={commit}>Weiter</Button>
		{:else if s.phase === 'standings'}
			<Button variant="primary" action="next" onclick={() => act({ type: 'next' })}>Nächstes Wort</Button>
		{:else}
			<Button variant="primary" action="restart" onclick={() => act({ type: 'restart' })}>Neue Runde</Button>
		{/if}
	{/snippet}

	{#snippet rail()}
		<Scoreboard {rows} detail={standing} />
	{/snippet}
</GameFrame>

<Modal open={skipping} title="Wort überspringen?" onclose={() => (skipping = false)}>
	<p class="muted">Das aktuelle Wort wird verworfen und durch ein neues ersetzt. Chuck the Duck bleibt bei {chuck}.</p>
	<div class="row">
		<Button variant="primary" action="skip" onclick={skip}>Überspringen</Button>
		<Button variant="ghost" onclick={() => (skipping = false)}>Abbrechen</Button>
	</div>
</Modal>

<style>
	.label {
		color: var(--duck);
	}

	:global([data-testid='reveal']) .label {
		color: inherit;
	}

	.tight {
		gap: 6px;
	}

	.duck {
		flex: none;
	}

	.next {
		align-items: center;
	}

	.nextline strong {
		color: var(--duck);
	}

	.banner {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 18px 20px;
		border-radius: var(--radius-xl);
		background: var(--duck-tint);
		box-shadow:
			inset 0 0 0 2px var(--duck),
			0 var(--ledge) 0 var(--duck-ledge);
	}

	.holder {
		font-size: clamp(26px, 5vw, 34px);
		color: var(--duck);
		overflow-wrap: anywhere;
	}

	.word {
		font-size: clamp(30px, 7vw, 44px);
		overflow-wrap: anywhere;
	}

	.wordline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 8px 20px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 36px;
		padding: 0 12px;
		border-radius: var(--radius-sm);
		background: var(--raised);
		font-weight: 700;
		font-size: 15px;
	}

	.chip.on {
		background: var(--duck-tint);
		box-shadow: inset 0 0 0 2px var(--duck);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
		gap: var(--gap);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.pcard {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px 12px;
		border-radius: var(--radius-lg);
		background: var(--raised);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.pcard.chuck {
		background: var(--duck-tint);
		box-shadow:
			inset 0 0 0 2px var(--duck),
			0 var(--ledge) 0 var(--duck-ledge);
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
		width: 40%;
		height: auto;
		filter: drop-shadow(0 4px 0 var(--shadow));
	}

	.top {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.name {
		font-weight: 800;
		font-size: 18px;
		overflow-wrap: anywhere;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex: none;
		padding: 2px 8px 2px 4px;
		border-radius: 8px;
		background: var(--duck);
		color: var(--ink);
		font-weight: 800;
		font-size: 13px;
	}

	.top .total {
		margin-left: auto;
		flex: none;
		font-size: 16px;
		color: var(--duck);
	}

	.total small {
		font-size: 11px;
		color: var(--muted);
	}

	.ducky {
		display: flex;
		gap: 6px;
	}

	.letter,
	.box {
		min-width: 44px;
		min-height: 44px;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--surface);
		box-shadow: 0 3px 0 var(--shadow);
		cursor: pointer;
		user-select: none;
		touch-action: manipulation;
		transition:
			transform 0.07s ease-out,
			box-shadow 0.07s ease-out,
			background-color 0.1s;
	}

	.letter {
		font-weight: 800;
		font-size: 17px;
	}

	.letter.lost {
		color: var(--muted);
		background: var(--raised);
	}

	.letter s,
	.letters s {
		text-decoration-color: var(--imposter);
		text-decoration-thickness: 2px;
	}

	.boxes {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
		gap: 6px;
	}

	.box {
		padding: 0;
	}

	.box.on {
		background: var(--duck);
		border-color: var(--duck);
		box-shadow: 0 3px 0 var(--duck-ledge);
	}

	.box.locked {
		background: var(--primary);
		border-color: var(--primary);
		box-shadow: none;
	}

	.letter:active:not(:disabled),
	.box:active:not(:disabled) {
		transform: translateY(3px);
		box-shadow: 0 0 0 transparent;
	}

	.letter:disabled,
	.box:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.box.locked:disabled {
		opacity: 0.6;
	}

	.expected {
		outline: 3px solid var(--gold);
		outline-offset: 3px;
	}

	.standing {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.letters {
		display: flex;
		gap: 2px;
		flex: none;
		font-weight: 800;
		font-size: 14px;
		letter-spacing: 0.04em;
	}

	.letters s {
		color: var(--muted);
	}

	.rules {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding-left: 20px;
	}
</style>
