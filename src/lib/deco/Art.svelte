<script lang="ts">
	import { motifFor, type Place } from '#lib/deco/motifs.ts';

	interface Props {
		slug?: string;
		place: Place;
	}

	let { slug, place }: Props = $props();

	const motif = $derived(motifFor(slug, place));
</script>

<div class="deco" data-deco data-motif={motif} aria-hidden="true"></div>

<style>
	.deco {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
</style>
