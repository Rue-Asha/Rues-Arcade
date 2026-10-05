<script lang="ts">
	import { getDemo } from '#lib/demo/context.ts';
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { pulse } from '#lib/motion.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import { demo as script } from './demo.ts';
	import { leaders, ranking, type MostLikelyAction, type MostLikelyState } from './engine.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as MostLikelyState);
	const last = $derived(s.round + 1 >= s.rounds);
	const list = (names: string[]) => new Intl.ListFormat('de').format(names);
	const holders = $derived(list(s.chosen.map((i) => s.players[i].name)));
	const best = $derived(leaders(s));
	const top = $derived(Math.max(...s.titles));
	const rows = $derived(ranking(s));

	// in the demo only the scripted player's toggle is live, like Button does for its action
	const demo = $derived(getDemo());
	const scripted = $derived.by(() => {
		const action = demo && demo.expected === 'toggle' ? script.steps[demo.step - 1]?.action : undefined;
		return action?.type === 'toggle' ? action.player : null;
	});

	const act = (a: MostLikelyAction) => dispatch(a);

	function toggle(player: number) {
		play('press');
		act({ type: 'toggle', player });
	}

	function confirm() {
		play('reveal');
		act({ type: 'confirm' });
	}

	function next() {
		if (last) play('win');
		act({ type: 'next' });
	}
</script>

<div class="split">
	<section class="stack main" aria-live="polite">
		{#if s.phase !== 'gameOver'}
			<p class="label turn">Runde {s.round + 1} / {s.rounds}</p>
		{/if}

		{#if s.phase === 'prompt'}
			<Card tone="most_likely_prompts">
				<p class="label">Vorlesen</p>
				<p class="prompt" data-testid="prompt">{s.prompt.a}</p>
				<p class="muted">Auf drei zeigen alle gleichzeitig auf die Person, die am besten passt.</p>
			</Card>
			<div class="row">
				<Button variant="primary" action="point" onclick={() => act({ type: 'point' })}>Alle haben gezeigt</Button>
				<Button variant="secondary" action="redraw" disabled={s.pool.length < 2} onclick={() => act({ type: 'redraw' })}>
					Anderer Spruch
				</Button>
			</div>
		{:else if s.phase === 'pick'}
			<div class="stack tight">
				<p class="muted small" data-testid="pick-prompt">{s.prompt.a}</p>
				<h2 id="pick">Wer hat den Titel?</h2>
				<p class="muted">Tippe an, auf wen die meisten gezeigt haben. Bei Gleichstand alle, die vorne liegen.</p>
			</div>
			<div class="picks" role="group" aria-labelledby="pick">
				{#each s.players as p, i (p.id)}
					{@const expected = scripted === i}
					<button
						type="button"
						class="pick"
						class:expected
						aria-pressed={s.chosen.includes(i)}
						disabled={demo !== null && !expected}
						data-action="toggle"
						data-demo={expected ? 'expected' : undefined}
						onclick={() => toggle(i)}
					>
						<span class="box" aria-hidden="true">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
						</span>
						<span>{p.name}</span>
					</button>
				{/each}
			</div>
			<div class="row">
				<Button variant="primary" action="confirm" disabled={s.chosen.length === 0} onclick={confirm}>Titel vergeben</Button>
			</div>
		{:else if s.phase === 'reveal'}
			<div class="reveal" use:pulse>
				<p class="label" data-testid="reveal-prompt">{s.prompt.a}</p>
				<p class="reveal-word" data-testid="holders">{holders}</p>
				<p class="gain">+1 Titel{s.chosen.length > 1 ? ' für alle' : ''}</p>
			</div>
			<div class="row">
				<Button variant="primary" action="next" onclick={next}>{last ? 'Zum Endstand' : 'Nächste Runde'}</Button>
			</div>
		{:else}
			<div class="reveal">
				<p class="label">{best.length > 1 ? 'Unentschieden' : 'Gewinner'}</p>
				<h2 class="reveal-word winner">{best.map((p) => p.name).join(' & ')}</h2>
				<p>{top} Titel · {s.rounds} Runden gespielt</p>
			</div>
			<div class="row">
				<Button variant="primary" action="rematch" onclick={() => act({ type: 'rematch' })}>Nochmal spielen</Button>
			</div>
		{/if}
	</section>

	<aside>
		<section class="board" aria-label="Titel">
			<h2 class="label">Titel</h2>
			<ol class="rows">
				{#each rows as row (row.player.id)}
					{@const lead = top > 0 && row.titles === top}
					<li class="entry" class:lead>
						<span class="rank">{row.rank}</span>
						<span class="who">{row.player.name}</span>
						<span class="pts data">{row.titles}</span>
					</li>
				{/each}
			</ol>
		</section>
	</aside>
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

	.prompt {
		font-weight: 800;
		font-size: clamp(24px, 5vw, 34px);
		line-height: 1.2;
		letter-spacing: -0.01em;
		overflow-wrap: anywhere;
	}

	.picks {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
		gap: 10px;
	}

	.pick {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 56px;
		padding: 0 14px;
		border: 2px solid transparent;
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: 0 4px 0 var(--shadow);
		color: var(--text);
		font: 700 17px/1.2 var(--font-ui);
		text-align: left;
		cursor: pointer;
		overflow-wrap: anywhere;
		user-select: none;
		touch-action: manipulation;
		transition:
			transform 0.07s ease-out,
			box-shadow 0.07s ease-out,
			border-color 0.1s;
	}

	.pick:active:not(:disabled) {
		transform: translateY(4px);
		box-shadow: 0 0 0 transparent;
	}

	.pick:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.pick[aria-pressed='true'] {
		border-color: var(--most-likely);
		background: var(--most-likely-tint);
		box-shadow: 0 4px 0 var(--most-likely-ledge);
	}

	.box {
		display: grid;
		place-items: center;
		flex: none;
		width: 26px;
		height: 26px;
		border-radius: 8px;
		border: 2px solid var(--line);
		color: transparent;
	}

	[aria-pressed='true'] .box {
		border-color: var(--most-likely);
		background: var(--most-likely);
		color: var(--ink);
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

	.reveal .label {
		max-width: 40ch;
		letter-spacing: 0.06em;
		overflow-wrap: anywhere;
	}

	.reveal-word {
		font-size: clamp(40px, 11vw, 84px);
	}

	.gain {
		font-weight: 700;
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
		min-height: 46px;
		padding: 0 14px;
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
		flex: 1;
		min-width: 0;
		font-weight: 700;
		font-size: 17px;
		overflow-wrap: anywhere;
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
</style>
