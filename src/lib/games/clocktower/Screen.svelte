<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import Day from './Day.svelte';
	import Deal from './Deal.svelte';
	import End from './End.svelte';
	import Night from './Night.svelte';
	import SetupBoard from './SetupBoard.svelte';
	import type { ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const kind = $derived((game as ClocktowerState).phase.kind);
</script>

{#if kind === 'setup'}
	<SetupBoard state={game} {dispatch} />
{:else if kind === 'reveal'}
	<Deal state={game} {dispatch} />
{:else if kind === 'night'}
	<Night state={game} {dispatch} />
{:else if kind === 'dawn' || kind === 'day'}
	<Day state={game} {dispatch} />
{:else}
	<End state={game} {dispatch} />
{/if}
