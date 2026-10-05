<script lang="ts">
	import { motifFor, type Place } from '#lib/deco/motifs.ts';
	import Corner from './Corner.svelte';
	import Crew from './Crew.svelte';
	import Dial from './Dial.svelte';
	import Home from './Home.svelte';
	import Masks from './Masks.svelte';
	import Neutral from './Neutral.svelte';
	import Rings from './Rings.svelte';

	interface Props {
		slug?: string;
		place: Place;
	}

	let { slug, place }: Props = $props();

	const motif = $derived(motifFor(slug, place));
</script>

<div class="deco" data-deco data-motif={motif} aria-hidden="true">
	{#if motif === 'home'}
		<Home />
	{:else if motif === 'dial'}
		<Dial {place} />
	{:else if motif === 'masks'}
		<Masks {place} />
	{:else if motif === 'crew'}
		<Crew />
	{:else if motif === 'rings'}
		<Rings />
	{:else if motif === 'corner'}
		<Corner />
	{:else}
		<Neutral {place} />
	{/if}
</div>

<style>
	.deco {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}
</style>
