<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { loadCount } from '#lib/count.ts';
	import { games } from '#lib/games/registry.ts';
	import { roster } from '#lib/roster.svelte.ts';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const entry = $derived(games.find((g) => g.def.slug === params.slug)!);
	const def = $derived(entry.def);
	const base = $derived(`/spiele/${def.slug}`);

	// the count lives in localStorage, so it only exists after hydration
	let count = $state<number | null>(null);
	onMount(() => {
		count = loadCount(def.slug, { min: def.minPlayers, max: def.maxPlayers }, roster.players.length);
	});
</script>

<svelte:head>
	<title>Erklärung · {def.name} · Rue's Arcade</title>
</svelte:head>

{#if count !== null && entry.Explanation}
	<div class="stack rise" style="--c: var(--{def.colour})">
		<entry.Explanation {count} onclose={() => goto(base)} />
	</div>
{/if}
