<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';
	import Grid from './Grid.svelte';
	import Rings from './Rings.svelte';
	import Spark from './Spark.svelte';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();
</script>

{#if place === 'play'}
	<Rings tone="var(--off)" />
{:else}
	<svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
		<Grid width={400} height={150} opacity={0.25} />
		<rect x="110" y="40" width="56" height="56" rx="12" style="fill:var(--raised);stroke:var(--line);stroke-width:2" />
		<rect x="180" y="40" width="56" height="56" rx="12" style="fill:none;stroke:var(--line);stroke-width:2;stroke-dasharray:5 5" />
		<rect x="250" y="40" width="56" height="56" rx="12" style="fill:none;stroke:var(--c, var(--muted));stroke-width:2.5" />
		<circle cx="182" cy="122" r="5" style="fill:var(--c, var(--gold))" />
		<circle cx="200" cy="122" r="5" style="fill:var(--line)" />
		<circle cx="218" cy="122" r="5" style="fill:var(--line)" />
		<Spark x={334} y={34} scale={0.6} fill="var(--c, var(--gold))" />
	</svg>
{/if}

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
