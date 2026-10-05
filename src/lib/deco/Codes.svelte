<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();

	const width = $derived(place === 'start' ? 560 : 400);
	const height = $derived(place === 'start' ? 240 : 150);
</script>

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid slice">
	<rect x={width / 2 - 28} y={height / 2 - 28} width="56" height="56" rx="12" style="fill:none;stroke:var(--c);stroke-width:3" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
