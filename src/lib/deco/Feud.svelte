<script lang="ts">
	import type { Place } from '#lib/deco/motifs.ts';

	interface Props {
		place: Place;
	}

	let { place }: Props = $props();

	const start = $derived(place === 'start');
</script>

<svg viewBox={start ? '0 0 560 240' : '0 0 400 150'} preserveAspectRatio="xMidYMid slice">
	<rect x="40" y="40" width="120" height="30" rx="6" style="fill:var(--c)" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
