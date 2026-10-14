<script lang="ts">
	import type { ScreenProps } from '#lib/games/registry.ts';
	import { play } from '#lib/sound.ts';
	import Button from '#lib/ui/Button.svelte';
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

{#if here.screen === 'dusk'}
	<section class="panel stack dusk" aria-labelledby="phase">
		<h2 id="phase">Alle schlafen ein</h2>
		<p class="muted">Alle schließen die Augen.</p>
		<div class="row">
			<Button variant="primary" onclick={() => dispatch({ type: 'next' })}>Weiter</Button>
		</div>
	</section>
	<Questions state={s} {dispatch} />
{:else if here.screen === 'question'}
	<Questions state={s} {dispatch} question={here.question} />
{:else if here.screen === 'deaths'}
	<DeathStep state={s} {dispatch} />
{:else if 'step' in here}
	<Wake state={s} {dispatch} at={here} />
{/if}

{#if here.screen !== 'dusk'}
	<div class="peek"><HoldGrimoire state={s} /></div>
{/if}

<style>
	.peek {
		display: flex;
		justify-content: flex-end;
	}

	.dusk {
		padding: 20px;
		text-align: center;
		align-items: center;
	}

	.dusk h2,
	.dusk p {
		margin: 0;
	}
</style>
