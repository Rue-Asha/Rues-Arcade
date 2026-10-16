<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';
	import { polar } from '#lib/deco/motifs.ts';
	import Spark from './Spark.svelte';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();

	const start = $derived(place === 'start');
	const width = $derived(start ? 560 : 400);
	const height = $derived(start ? 240 : 150);
	const cx = $derived(width / 2);
	const cy = $derived(height / 2);
	const r = $derived(start ? 100 : 62);
	// twelve hours, 12 o'clock first; the quarters are longer
	const ticks = $derived(
		Array.from({ length: 12 }, (_, i) => {
			const deg = 90 - i * 30;
			const inner = r * (i % 3 === 0 ? 0.72 : 0.82);
			const [x1, y1] = polar(cx, cy, inner, deg);
			const [x2, y2] = polar(cx, cy, r * 0.92, deg);
			return { x1, y1, x2, y2, quarter: i % 3 === 0 };
		})
	);
	const [hx, hy] = $derived(polar(cx, cy, r * 0.5, 90 - 10 * 30));
	const [mx, my] = $derived(polar(cx, cy, r * 0.78, 90));
	const stars = [
		[40, 30, 2],
		[110, 120, 1.6],
		[500, 60, 2.2],
		[470, 190, 1.6],
		[90, 200, 1.8],
		[380, 24, 1.6]
	];
</script>

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice">
	{#if start}
		{#each stars as [x, y, s] (`${x}-${y}`)}
			<circle class="star" cx={x} cy={y} r={s} />
		{/each}
	{/if}

	<circle class="ring" {cx} {cy} {r} />
	<circle class="ring inner" {cx} {cy} r={r * 0.94} />
	{#each ticks as t, i (i)}
		<line class="tick" class:quarter={t.quarter} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
	{/each}
	<line class="hour" x1={cx} y1={cy} x2={hx} y2={hy} />
	<line class="minute" x1={cx} y1={cy} x2={mx} y2={my} style="transform-origin:{cx}px {cy}px" />
	<circle class="hub" {cx} {cy} r={r * 0.07} />

	{#if start}
		<Spark x={width - 56} y={34} scale={0.8} fill="var(--gold)" />
		<Spark x={52} y={height - 36} scale={0.55} fill="var(--c)" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.ring {
		fill: none;
		stroke: var(--c);
		stroke-width: 3;
	}

	.inner {
		stroke: var(--line);
		stroke-width: 1.5;
	}

	.tick {
		stroke: var(--c);
		stroke-width: 2;
		stroke-linecap: round;
	}

	.quarter {
		stroke-width: 4;
	}

	.hour,
	.minute {
		stroke: var(--text-soft);
		stroke-linecap: round;
	}

	.hour {
		stroke-width: 6;
	}

	.minute {
		stroke-width: 4;
		transform-box: view-box;
	}

	.hub {
		fill: var(--c);
	}

	.star {
		fill: var(--text-soft);
		opacity: 0.55;
	}

	@media (prefers-reduced-motion: no-preference) {
		.minute {
			animation: sweep 60s linear infinite;
		}

		@keyframes sweep {
			to {
				transform: rotate(360deg);
			}
		}
	}
</style>
