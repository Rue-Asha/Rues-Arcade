<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';
	import Grid from './Grid.svelte';
	import Spark from './Spark.svelte';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();

	const start = $derived(place === 'start');
	const width = $derived(start ? 560 : 400);
	const height = $derived(start ? 240 : 150);
	// a survey board: two columns of ledge tiles, some flipped open, one of them turning over
	const w = $derived(start ? 200 : 150);
	const h = $derived(start ? 44 : 30);
	const gapX = $derived(start ? 16 : 12);
	const gapY = $derived(start ? 14 : 10);
	const left = $derived((width - 2 * w - gapX) / 2);
	const top = $derived(start ? 40 : 20);
	const cells = [
		{ col: 0, row: 0, open: true },
		{ col: 1, row: 0, open: false },
		{ col: 0, row: 1, open: true, turning: true },
		{ col: 1, row: 1, open: true },
		{ col: 0, row: 2, open: false },
		{ col: 1, row: 2, open: false }
	];
</script>

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice">
	<Grid {width} {height} opacity={start ? 0.3 : 0.25} />

	{#each cells as cell, i (i)}
		{@const x = left + cell.col * (w + gapX)}
		{@const y = top + cell.row * (h + gapY)}
		<g class:turning={cell.turning}>
			<rect {x} y={y + 5} width={w} height={h} rx="9" style="fill:var(--shadow)" />
			{#if cell.open}
				<rect {x} {y} width={w} height={h} rx="9" style="fill:var(--c);stroke:var(--ink);stroke-width:2.5" />
				<rect x={x + 14} y={y + h / 2 - 5} width={w * 0.5 - i * 4} height="10" rx="5" style="fill:var(--ink)" />
				<rect x={x + w - 44} y={y + h / 2 - 5} width="28" height="10" rx="5" style="fill:var(--ink);opacity:0.55" />
			{:else}
				<rect {x} {y} width={w} height={h} rx="9" style="fill:var(--raised);stroke:var(--line);stroke-width:2" />
				<circle cx={x + w / 2} cy={y + h / 2} r={h / 6} style="fill:var(--muted)" />
			{/if}
		</g>
	{/each}

	{#if start}
		<Spark x={500} y={34} scale={0.8} fill="var(--gold)" />
		<Spark x={52} y={206} scale={0.55} fill="var(--c)" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.turning {
		transform-box: fill-box;
		transform-origin: center;
	}

	@media (prefers-reduced-motion: no-preference) {
		.turning {
			animation: turn 5s var(--ease-out) infinite;
		}

		@keyframes turn {
			0%,
			72%,
			100% {
				transform: scaleY(1);
				opacity: 1;
			}
			82% {
				transform: scaleY(0.08);
				opacity: 0.6;
			}
			92% {
				transform: scaleY(1);
				opacity: 1;
			}
		}
	}
</style>
