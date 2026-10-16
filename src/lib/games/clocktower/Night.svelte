<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { play } from '#lib/sound.ts';
	import DeathStep from './DeathStep.svelte';
	import HoldGrimoire from './HoldGrimoire.svelte';
	import Questions from './Questions.svelte';
	import Wake from './Wake.svelte';
	import type { ClocktowerState } from './types.ts';

	let { state: game, dispatch }: ScreenProps = $props();

	const s = $derived(game as ClocktowerState);
	const night = $derived(s.night!);
	const here = $derived(night.screens[night.at]);

	$effect(() => {
		if (here.screen === 'dusk') play('bell');
	});
</script>

{#snippet peek()}
	<div class="peek"><HoldGrimoire state={s} /></div>
{/snippet}

{#if here.screen === 'dusk'}
	<Questions state={s} {dispatch} />
{:else if here.screen === 'question'}
	<Questions state={s} {dispatch} question={here.question} {peek} />
{:else if here.screen === 'deaths'}
	<DeathStep state={s} {dispatch} {peek} />
{:else if 'step' in here}
	<Wake state={s} {dispatch} at={here} {peek} />
{/if}

<style>
	.peek {
		display: flex;
		justify-content: flex-end;
	}
</style>
