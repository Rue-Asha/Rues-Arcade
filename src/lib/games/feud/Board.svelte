<script lang="ts">
	import type { SurveyAnswer } from '#lib/content/types.ts';
	import { ease, reducedMotion } from '#lib/motion.ts';

	interface Props {
		tiles: SurveyAnswer[];
		revealed: boolean[];
		// what was revealed when the screen mounted; those tiles don't flip again
		before: boolean[];
		// result: every hidden tile flips open muted, one after the other
		result?: boolean;
		// accessible name of a hidden tile's button, by rank; null = tiles are not tappable
		verb: ((rank: number) => string) | null;
		onpick: (tile: number) => void;
	}

	let { tiles, revealed, before, result = false, verb, onpick }: Props = $props();

	// WAAPI on transform and opacity, so the e2e settle waits for it
	function flip(node: HTMLElement, { delay = 0, still = false } = {}) {
		if (still || reducedMotion() || typeof node.animate !== 'function') return;
		node.animate(
			[
				{ transform: 'perspective(600px) rotateX(90deg)', opacity: 0.2 },
				{ transform: 'perspective(600px) rotateX(0deg)', opacity: 1 }
			],
			{ duration: 420, delay, easing: ease, fill: 'backwards' }
		);
	}

	const order = $derived(revealed.flatMap((r, i) => (r ? [] : [i])));
</script>

<ol class="tiles" aria-label="Tafel" style="--rows: {Math.ceil(tiles.length / 2)}">
	{#each tiles as t, i (i)}
		{@const kind = revealed[i] ? 'revealed' : result ? 'muted' : 'hidden'}
		<li class="tile {kind}" data-tile={i} data-state={kind}>
			{#if kind === 'revealed'}
				<div class="face" use:flip={{ still: before[i] }}>
					<span class="text">{t.text}</span>
					<span class="points">{t.points}</span>
				</div>
			{:else if kind === 'muted'}
				<div class="face" use:flip={{ delay: order.indexOf(i) * 140 }}>
					<span class="text">{t.text}</span>
				</div>
			{:else if verb}
				<button type="button" class="face" aria-label={verb(i + 1)} onclick={() => onpick(i)}>
					<span class="rank">{i + 1}</span>
				</button>
			{:else}
				<div class="face"><span class="rank">{i + 1}</span></div>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.tiles {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(var(--rows), auto);
		grid-auto-flow: column;
		gap: 12px;
		margin: 0;
		padding: 0 0 var(--ledge);
		list-style: none;
	}

	.tile {
		display: flex;
		min-height: 60px;
	}

	.face {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-width: 0;
		padding: 8px 14px;
		border: 0;
		border-radius: var(--radius);
		font: 700 clamp(15px, 1.4vw + 9px, 22px) / 1.15 var(--font-ui);
		text-align: left;
		overflow-wrap: anywhere;
	}

	.hidden .face {
		justify-content: center;
		background: var(--raised);
		box-shadow:
			inset 0 0 0 1px var(--line),
			0 var(--ledge) 0 var(--shadow);
		color: var(--text);
	}

	button.face {
		cursor: pointer;
		touch-action: manipulation;
	}

	button.face:active {
		transform: translateY(var(--ledge));
		box-shadow: inset 0 0 0 1px var(--line);
	}

	.rank {
		font-weight: 800;
		font-size: clamp(22px, 2vw + 12px, 34px);
		font-variant-numeric: tabular-nums;
	}

	.revealed .face {
		background: var(--feud);
		color: var(--ink);
		box-shadow: 0 var(--ledge) 0 var(--feud-ledge);
	}

	.points {
		flex: none;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.muted .face {
		background: var(--surface);
		color: var(--muted);
		box-shadow: inset 0 0 0 1px var(--line);
		font-weight: 600;
	}
</style>
