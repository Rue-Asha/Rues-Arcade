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
	const scale = $derived(start ? 1.25 : 0.95);
	const gap = $derived(start ? 96 : 74);
	const floor = $derived(start ? 196 : 128);
	const cx = $derived(width / 2);
	const lift = $derived(start ? 16 : 12);
	// the four others point at the pawn in the middle, who holds the title
	const others = [-2, -1, 1, 2];
	const head = $derived(floor - 46 * scale - lift);
</script>

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice">
	<Grid {width} {height} opacity={start ? 0.3 : 0.25} />
	{#each others as o (o)}
		{@const x = cx + o * gap}
		{@const y = floor - 46 * scale}
		{@const toward = Math.sign(-o)}
		<path
			d="M{x + toward * 16 * scale} {y + 10 * scale} Q{(x + cx) / 2} {y - (Math.abs(o) === 2 ? 34 : 18) * scale} {cx - toward * 22 * scale} {head + 4 * scale}"
			style="fill:none;stroke:var(--most-likely);stroke-width:{start ? 3 : 2.5};stroke-linecap:round;stroke-dasharray:2 {start ? 9 : 7};opacity:0.85"
		/>
		<g transform="translate({x} {floor}) scale({scale})" style="stroke:var(--muted);stroke-width:2.5">
			<circle cy="-46" r="13" style="fill:var(--raised)" />
			<path d="M-20 0 V-12 a20 20 0 0 1 40 0 V0 Z" style="fill:var(--raised)" />
			<path d="M{toward * 8} -18 l{toward * 22} -10" style="stroke:var(--most-likely);stroke-width:4;stroke-linecap:round" />
		</g>
	{/each}
	<g transform="translate({cx} {floor - lift}) scale({scale})" style="stroke:var(--ink);stroke-width:2.5">
		<circle cy="-46" r="15" style="fill:var(--most-likely)" />
		<path d="M-24 0 V-14 a24 24 0 0 1 48 0 V0 Z" style="fill:var(--most-likely)" />
		<path d="M-14 -66 L-14 -80 L-7 -73 L0 -84 L7 -73 L14 -80 L14 -66 Z" style="fill:var(--gold);stroke-linejoin:round" />
	</g>
	<rect x="40" y={floor + 4} width={width - 80} height="3" rx="1.5" style="fill:var(--line)" />
	{#if start}
		<Spark x={492} y={54} scale={0.8} fill="var(--gold)" />
		<Spark x={70} y={64} scale={0.55} fill="var(--most-likely)" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
