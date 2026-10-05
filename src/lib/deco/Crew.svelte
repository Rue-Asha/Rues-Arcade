<script lang="ts">
	import Arcs from './Arcs.svelte';
	import Grid from './Grid.svelte';
	import Spark from './Spark.svelte';

	const pawns = [
		{ x: 160, y: 120, on: false },
		{ x: 220, y: 104, on: true },
		{ x: 280, y: 98, on: true },
		{ x: 340, y: 104, on: true },
		{ x: 400, y: 120, on: false }
	];
</script>

<svg viewBox="0 0 560 170" preserveAspectRatio="xMidYMid slice">
	<Grid width={560} height={170} opacity={0.28} />
	<Arcs cx={280} cy={190} radii={[110, 140, 170]} stroke="var(--c, var(--primary))" />
	{#each pawns as pawn, i (i)}
		<g class="pawn" transform="translate({pawn.x} {pawn.y})" style="stroke:var(--c, var(--primary));stroke-width:3">
			<circle cy="-24" r="13" style="fill:{pawn.on ? 'var(--c, var(--primary))' : 'var(--raised)'}" />
			<path d="M-22 22 V12 a22 22 0 0 1 44 0 V22 Z" style="fill:var(--raised)" />
		</g>
	{/each}
	<rect x="140" y="150" width="280" height="3" rx="1.5" style="fill:var(--line)" />
	<Spark x={76} y={60} scale={0.7} fill="var(--gold)" />
	<Spark x={490} y={118} scale={0.55} fill="var(--primary)" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
