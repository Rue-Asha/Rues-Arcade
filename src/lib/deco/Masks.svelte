<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';
	import Grid from './Grid.svelte';
	import Mask from './Mask.svelte';
	import Spark from './Spark.svelte';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();

	const start = $derived(place === 'start');
	const width = $derived(start ? 560 : 400);
	const height = $derived(start ? 240 : 150);
	const scale = $derived(start ? 3.4 : 2.7);
	const gap = $derived(start ? 92 : 64);
	const left = $derived(start ? 55 : 48);
	const top = $derived(start ? 72 : 42);
	const lift = $derived(start ? 10 : 8);
	const odd = 3;
	const centre = $derived(left + odd * gap + 12 * scale);
</script>

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice">
	<Grid {width} {height} opacity={start ? 0.3 : 0.25} />
	{#each [0, 1, 2, 3, 4] as i (i)}
		{#if i === odd}
			<Mask x={left + i * gap} y={top - lift} {scale} stroke="var(--ink)" fill="var(--imposter)" odd />
		{:else}
			<Mask x={left + i * gap} y={top} {scale} stroke="var(--muted)" fill="var(--raised)" />
		{/if}
	{/each}
	<text
		x={centre}
		y={top - lift - (start ? 4 : 6)}
		style="fill:var(--imposter-text);color:var(--imposter-text);font:800 {start ? 22 : 18}px var(--font-ui);text-anchor:middle">?</text
	>
	<rect x="40" y={top + 25 * scale} width={width - 80} height="3" rx="1.5" style="fill:var(--line)" />
	{#if start}
		<Spark x={500} y={46} scale={0.8} fill="var(--gold)" />
		<Spark x={28} y={196} scale={0.55} fill="var(--imposter)" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
