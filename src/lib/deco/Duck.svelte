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
	<circle cx={width / 2} cy={height / 2} r="30" style="fill:none;stroke:var(--c);stroke-width:3" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
