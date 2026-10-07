<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { pulse } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Modal from '#lib/ui/Modal.svelte';
	import { demo as script } from './demo.ts';
	import { checkWin, LETTERS, rankOf, type DuckAction, type DuckState } from './engine.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as DuckState);
	const chuck = $derived(s.players[s.chuck].name);
	const ranked = $derived(
		s.players.map((p, i) => ({ p, i, score: s.scores[i], lives: s.lives[i], rank: rankOf(s.scores, i) })).sort((a, b) => b.score - a.score)
	);
	const rest = $derived(ranked.filter((r) => !s.winners.includes(r.i)));

	let skipping = $state(false);

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

	function letter(player: number, letter: number) {
		play(letter < s.lives[player] ? 'wrong' : 'press');
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

{#snippet board(rows: typeof ranked, label: string)}
	<ol class="board" aria-label={label}>
		{#each rows as r (r.p.id)}
			<li class:chuck={s.phase === 'standings' && r.i === s.chuck}>
				<span class="rank">{r.rank}</span>
				<span class="who">{r.p.name}</span>
				{#if s.phase === 'standings' && r.i === s.chuck}<span class="tag">Chuck</span>{/if}
				{@render letters(r.lives)}
				<span class="pts data">{r.score}</span>
			</li>
		{/each}
	</ol>
{/snippet}

{#if s.phase === 'scoring'}
	<div class="stack">
		<header class="panel head">
			<div class="stack tight">
				<p class="label">Wort</p>
				<h2 class="word">{s.word.a}</h2>
			</div>
			<div class="row chips">
				<span class="chip on">{@render duck(22)} Chuck: {chuck}</span>
				<span class="chip">Ziel: {s.target} Punkte</span>
			</div>
		</header>

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
								onclick={() => letter(i, j)}
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
				</li>
			{/each}
		</ul>

		<div class="row">
			<Button variant="primary" action="commit" onclick={commit}>Weiter</Button>
		</div>
	</div>
{:else}
	<div class="split">
		<section class="stack" aria-live="polite">
			{#if s.phase === 'reveal'}
				<div class="banner">
					{@render duck(56)}
					<div class="stack tight">
						<p class="label">Chuck the Duck</p>
						<h2 class="holder">{chuck}</h2>
						<p>Ein Reim-Match mit {chuck} bringt +2 Extrapunkte.</p>
					</div>
				</div>
				{#if !s.shown}
					<Card tone="duck_words">
						<p class="label">Neues Wort</p>
						<h2>Bereit?</h2>
						<p class="muted">Deckt das Wort für alle gleichzeitig auf. Dann sucht jede Person still einen Reim darauf.</p>
						<div class="row">
							<Button variant="primary" action="show" onclick={reveal}>Wort aufdecken</Button>
							<Button variant="secondary" action="skip" onclick={askSkip}>Überspringen</Button>
						</div>
					</Card>
				{:else}
					<div class="reveal" use:pulse>
						<p class="label">Das Wort lautet</p>
						<p class="reveal-word" data-testid="word">{s.word.a}</p>
					</div>
					<div class="row">
						<Button variant="primary" action="play" onclick={() => act({ type: 'play' })}>Wort spielen</Button>
						<Button variant="secondary" action="skip" onclick={askSkip}>Überspringen</Button>
					</div>
				{/if}
			{:else if s.phase === 'standings'}
				<section class="panel stack" aria-labelledby="standings">
					<h2 id="standings" class="label">Punktestand</h2>
					{@render board(ranked, 'Punktestand')}
				</section>
				<p class="next">Als Nächstes bekommt <strong>{chuck}</strong> Chuck the Duck.</p>
				<div class="row">
					<Button variant="primary" action="next" onclick={() => act({ type: 'next' })}>Nächstes Wort</Button>
				</div>
			{:else}
				{@const best = s.scores[s.winners[0]]}
				<div class="reveal" use:pulse>
					<p class="label">{s.winners.length > 1 ? 'Unentschieden' : 'Gewinner'}</p>
					<h2 class="reveal-word winner">{s.winners.map((i) => s.players[i].name).join(' & ')}</h2>
					<p class="total data">{best}/{s.target}</p>
					<p>
						{#if s.endReason === 'target'}
							Zielpunktzahl von {s.target} erreicht.
						{:else}
							Ein Spieler hat alle Leben (DUCKY) verloren.
						{/if}
					</p>
				</div>
				<div class="row">
					<Button variant="primary" action="restart" onclick={() => act({ type: 'restart' })}>Neue Runde</Button>
				</div>
			{/if}
		</section>

		<aside class="stack">
			{#if s.phase === 'reveal'}
				<section class="panel stack" aria-labelledby="score">
					<div class="head">
						<h2 id="score" class="label">Spielstand</h2>
						<span class="muted">Ziel: {s.target} Punkte</span>
					</div>
					<ol class="board" aria-label="Spielstand">
						{#each s.players as p, i (p.id)}
							<li class:chuck={i === s.chuck}>
								<span class="who">{p.name}</span>
								{#if i === s.chuck}<span class="tag">Chuck</span>{/if}
								{@render letters(s.lives[i])}
								<span class="pts data">{s.scores[i]}</span>
							</li>
						{/each}
					</ol>
				</section>
			{:else if s.phase === 'standings'}
				<section class="panel stack" aria-labelledby="rules">
					<h2 id="rules" class="label">So wird gewertet</h2>
					<ul class="rules">
						<li>Genau eine andere Person mit demselben Reim: 3 Punkte.</li>
						<li>Mehrere Personen mit demselben Reim: je 1 Punkt.</li>
						<li>Ein Match mit Chuck the Duck: 2 Punkte extra.</li>
						<li>Kein Reim: ein Buchstabe von DUCKY ist weg.</li>
					</ul>
					<p class="muted">Ziel: {s.target} Punkte</p>
				</section>
			{:else if rest.length}
				<section class="panel stack" aria-labelledby="ranking">
					<h2 id="ranking" class="label">Rangliste</h2>
					{@render board(rest, 'Rangliste')}
				</section>
			{/if}
		</aside>
	</div>
{/if}

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

	.reveal .label {
		color: inherit;
	}

	.tight {
		gap: 6px;
	}

	.duck {
		flex: none;
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

	.winner {
		font-size: clamp(40px, 11vw, 84px);
	}

	.reveal .total {
		font-size: 18px;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 16px;
	}

	.word {
		font-size: clamp(30px, 7vw, 44px);
		overflow-wrap: anywhere;
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
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 14px;
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: 0 var(--ledge) 0 var(--shadow);
	}

	.pcard.chuck {
		background: var(--duck-tint);
		box-shadow:
			inset 0 0 0 2px var(--duck),
			0 var(--ledge) 0 var(--duck-ledge);
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
		background: var(--raised);
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
		background: var(--surface);
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

	.board {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.board li {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 46px;
		padding: 0 12px;
		border-radius: var(--radius-sm);
		background: var(--raised);
	}

	.board li.chuck {
		box-shadow: inset 3px 0 0 var(--duck);
	}

	.rank {
		width: 20px;
		flex: none;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.who {
		flex: 1;
		min-width: 0;
		font-weight: 700;
		overflow-wrap: anywhere;
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

	.pts {
		min-width: 40px;
		flex: none;
		font-size: 13px;
		text-align: right;
	}

	.next strong {
		color: var(--duck);
	}

	.rules {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding-left: 20px;
	}
</style>
