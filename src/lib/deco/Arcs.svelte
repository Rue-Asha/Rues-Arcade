<svelte:options namespace="svg" />

<script lang="ts">
	import { semi } from '#lib/deco/motifs.ts';

	interface Props {
		cx: number;
		cy: number;
		radii: number[];
		opacity?: number;
		stroke?: string;
	}

	let { cx, cy, radii, opacity = 0.3, stroke = 'var(--wavelength)' }: Props = $props();
</script>

{#each radii as r, i (r)}
	<path
		d={semi(cx, cy, r)}
		style="fill:none;stroke:{stroke};stroke-opacity:{opacity};stroke-width:2{i % 2 ? ';stroke-dasharray:2 8;stroke-linecap:round' : ''}"
	/>
{/each}
