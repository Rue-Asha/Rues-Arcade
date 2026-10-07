<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { countUp, reducedMotion } from '#lib/motion.ts';
	import { moved, places, ranked, type ScoreRow } from './scoreboard.ts';
	import { motion } from './tokens.ts';

	interface Props {
		rows: ScoreRow[];
		detail?: Snippet<[ScoreRow]>;
	}

	let { rows, detail }: Props = $props();

	let settled = $state(reducedMotion());
	const order = $derived(settled ? ranked(rows) : ranked(rows, (r) => r.before ?? r.score));
	const shifted = $derived(
		moved(
			ranked(rows, (r) => r.before ?? r.score).map((r) => r.name),
			ranked(rows).map((r) => r.name)
		)
	);
	const place = $derived(places(order.map((r) => (settled ? r.score : (r.before ?? r.score)))));

	onMount(() => {
		const frame = requestAnimationFrame(() => (settled = true));
		return () => cancelAnimationFrame(frame);
	});
</script>

<section class="board" aria-label="Punktestand">
	<h2 class="label">Punktestand</h2>
	<ol class="rows rise">
		{#each order as row, i (row.name)}
			<li class="row" class:lead={row.lead} data-acting={row.acting ? '' : undefined} animate:flip={{ duration: reducedMotion() || !shifted.includes(row.name) ? 0 : motion['dur-in'], easing: cubicOut }}>
				<span class="rank">{place[i]}</span>
				<span class="who">
					{row.name}
					{#if row.lead}
						<span class="crown" aria-label="Führt">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18h16l-1.2-10-4.3 3.5L12 5l-2.5 6.5L5.2 8z"></path></svg>
						</span>
					{/if}
				</span>
				<span class="pts data" use:countUp={row.score}></span>{#if detail}<div class="detail">{@render detail(row)}</div>{/if}
			</li>
		{/each}
	</ol>
</section>

<style>
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

	.row {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		min-height: 46px;
		padding: 0 14px;
		border-radius: var(--radius-sm);
		background: var(--raised);
	}

	.row[data-acting]::before {
		content: '';
		position: absolute;
		left: 0;
		top: 8px;
		bottom: 8px;
		width: 5px;
		border-radius: 0 3px 3px 0;
		background: var(--c, var(--gold));
	}

	.detail {
		flex: 1 0 100%;
		padding-bottom: 10px;
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
		align-items: center;
		gap: 8px;
		min-width: 0;
		font-weight: 700;
		font-size: 17px;
		overflow-wrap: anywhere;
	}

	.pts {
		display: flex;
		justify-content: flex-end;
		min-width: 64px;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
	}

	.lead {
		background: var(--primary);
		color: var(--on-primary);
	}

	.crown {
		display: grid;
		place-items: center;
		flex: none;
		width: 26px;
		height: 26px;
		border-radius: 7px;
		background: var(--on-primary);
		color: var(--primary);
		animation: bob 1.6s ease-in-out infinite;
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-2px);
		}
	}
</style>
