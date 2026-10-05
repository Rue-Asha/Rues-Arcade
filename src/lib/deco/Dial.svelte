<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';
	import Arcs from './Arcs.svelte';
	import Gauge from './Gauge.svelte';
	import Grid from './Grid.svelte';
	import Spark from './Spark.svelte';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();
</script>

{#if place === 'start'}
	<svg viewBox="0 0 560 240" preserveAspectRatio="xMidYMax slice">
		<Grid width={560} height={240} />
		<Arcs cx={290} cy={226} radii={[170, 192, 214]} opacity={0.32} />
		<Gauge cx={290} cy={226} r={146} face="var(--raised)" needle={108} />
		<g transform="translate(64 186)">
			<rect width="70" height="34" rx="9" style="fill:var(--raised)" />
			<text x="12" y="23" style="fill:var(--text);color:var(--text);font:700 15px var(--font-ui);text-anchor:start">Kalt</text>
		</g>
		<g transform="translate(450 186)">
			<rect width="70" height="34" rx="9" style="fill:var(--raised)" />
			<text x="58" y="23" style="fill:var(--text);color:var(--text);font:700 15px var(--font-ui);text-anchor:end">Heiß</text>
		</g>
		<Spark x={486} y={56} scale={0.8} fill="var(--gold)" />
		<Spark x={96} y={60} scale={0.55} fill="var(--wavelength)" />
	</svg>
{:else}
	<svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
		<Grid width={400} height={150} opacity={0.25} />
		<Arcs cx={200} cy={168} radii={[150, 170, 190]} />
		<Gauge cx={200} cy={168} r={128} face="var(--raised)" needle={96} />
	</svg>
{/if}

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
